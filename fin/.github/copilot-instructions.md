# FixItNow – AI Agent Guide

**FixItNow** is a neighborhood service & repair marketplace (Spring Boot 3 + React 18). This guide ensures AI agents are immediately productive.

## Architecture Overview

### Full-Stack Data Flow
```
User → React App (AuthContext + Axios interceptors)
  ↓
  ├─ REST calls → Spring Boot Controllers (auth, services, bookings, admin)
  │                 ↓ JWT validation (AuthTokenFilter)
  │                 ↓ Spring Security (role-based authorization)
  │                 ↓ Service layer (business logic)
  │                 ↓ JPA Repositories → MySQL
  │
  └─ WebSocket (SockJS + STOMP) → WebSocketChatController
                                    ↓ Routes to /topic/ or /queue/
```

### Backend: Spring Boot 3 REST API + STOMP WebSocket
- **Entry**: `backend/src/main/java/com/fixitnow/FixItNowApplication.java`
- **Controllers** (12 total, all in `controller/`):
  - `AuthController` – Login, signup, token refresh, password reset
  - `ServiceController` – CRUD services, search, map data, categories
  - `BookingController` – Create/manage bookings, status updates
  - `ReviewController` – Create/read reviews for services
  - `ChatController` – HTTP chat REST (complementary to WebSocket)
  - `WebSocketChatController` – Real-time messaging via `/api/ws`
  - `UserController` – User profile, role checks
  - `AdminController` – User/provider management, verification
  - `DisputeController` – Dispute resolution
  - `AnalyticsController` – Dashboard metrics
  - `FileUploadController` – Multipart file upload → `/uploads`
  - `FileServeController` – Public file serving
- **Models** (JPA entities in `model/`): User (with role enum: CUSTOMER, PROVIDER, ADMIN), Service, Booking, ChatMessage, Review, Dispute, Conversation, Skill, Category, ServiceArea
- **Security**: JWT token pair (accessToken + refreshToken), role-based checks via `@EnableMethodSecurity` and `requestMatchers` in `WebSecurityConfig.java`

### Frontend: React 18 SPA
- **Entry**: `frontend/src/index.js` → `frontend/src/App.js` (route dispatcher)
- **State Management**:
  - `AuthContext.js` – Global auth state (user, login, logout, token refresh logic)
  - `ChatContext.js` – Global chat state (conversations, active room, messages)
- **API Layer**: `services/api.js` (Axios instance with request/response interceptors for JWT refresh)
- **WebSocket Service**: `services/webSocketService.js` (STOMP client, auto-reconnect, subscription management)
- **Pages** (25+): Auth (Login, Register, ForgotPassword), Customer (Dashboard, Services, Bookings, Chat), Provider (MyServices, EditService, CreateService), Admin (AdminDashboard, AdminProviders, AdminUsers, AdminDisputes, AdminInsights)
- **Components**: Navbar, Footer, ProtectedRoute, MapView (Google Maps), ChatMessageModal, DeleteConfirmationModal, LocationSelector

### Integration Points
- **REST API Base URL**: `${REACT_APP_API_URL}/api` (default `http://localhost:8080/api`)
- **WebSocket Endpoint**: `http://localhost:8080/api/ws` (SockJS + STOMP)
- **File Storage**: `backend/uploads/` (avatar, service images); served at `/uploads/**` (public)

## Critical Patterns & Conventions

### Authentication & Authorization Flow
1. **Login/Signup** (`AuthController.java`):
   - POST `/auth/signin` or `/auth/signup` returns: `{ accessToken, refreshToken, id, email, role, isVerified, ... }`
   - Frontend stores **both tokens** in `localStorage`: `accessToken` (short-lived), `refreshToken` (long-lived)
   
2. **Token Refresh** (automatic via `api.js` interceptor):
   - If any REST call returns **401**, intercept and POST `/auth/refresh` with `refreshToken`
   - If successful, update `accessToken` in localStorage and retry original request
   - If refresh fails (e.g., token expired), clear all auth data and redirect to `/login`

3. **Request Authentication**:
   - All authenticated requests include: `Authorization: Bearer ${accessToken}` (added by Axios interceptor)
   - Backend validates via `AuthTokenFilter` → `JwtTokenProvider` → `SecurityContext`

4. **Role-Based Access Control** (`WebSecurityConfig.java`):
   - Rules defined via `.requestMatchers(path).hasRole(...)` or `.hasAnyRole(...)`
   - **Enforcement**: `@EnableMethodSecurity(prePostEnabled = true)` allows `@PreAuthorize("hasRole(...)")` on methods
   - **Common rules**:
     - Public: `/auth/**`, `/services`, `/services/**`, `/uploads/**`, `/ws` (WebSocket)
     - Authenticated: `/bookings/**`, `/reviews`, `/upload` (file)
     - Provider+ (PROVIDER | ADMIN): `/provider/**`, `/my-services/**`
     - Customer+ (CUSTOMER | ADMIN): `/customer/**`
     - Admin only: `/admin/**`

5. **Provider Verification**:
   - Provider signs up with document upload (ShopAct, MSME, Udyam)
   - Admin verifies in `/admin/providers` → `/admin/verify-provider/{id}` (PATCH)
   - **Until verified**: Provider cannot log in (403 error after signup redirect to login)
   - **After verified**: Login succeeds and provider can create services via `/provider/services` (POST)

### WebSocket Real-Time Communication
- **Connection**: SockJS + STOMP at `/api/ws`; frontend uses `webSocketService.js` (Client wrapper with auto-reconnect)
- **Auth**: Bearer token passed in `connectHeaders` during handshake
- **Message Flow** (example chat):
  - Frontend subscribes to `/topic/chat/{conversationId}` (receives all messages for conversation)
  - Frontend sends to `/app/chat.sendMessage/{conversationId}` with `{ content, senderId, timestamp }`
  - Backend `@MessageMapping("/chat.sendMessage/{conversationId}")` validates and broadcasts to `/topic/chat/{conversationId}`
- **Mapping** (in `WebSocketChatController.java`):
  - `@MessageMapping("/chat.sendMessage/{conversationId}")` – New message (broadcasts to `/topic/chat/{conversationId}`)
  - `@MessageMapping("/chat.addUser/{conversationId}")` – User joins (broadcasts presence)
  - `@MessageMapping("/chat.markAsRead/{conversationId}")` – Mark messages read (broadcasts read status)

### Database & Models
- **Key Entities** (in `model/`):
  - `User` – id, email, password (bcrypted), role (enum), isVerified, name, phone, location, avatar, createdAt
  - `Service` – id, provider (FK to User), title, description, category, latitude, longitude, price, status, createdAt
  - `Booking` – id, customer (FK), service (FK), status (PENDING, CONFIRMED, COMPLETED, CANCELLED), slots, totalPrice
  - `ChatMessage` – id, conversation (FK), sender (FK), content, timestamp, isRead
  - `Conversation` – id, customer (FK), provider (FK), createdAt
  - `Review` – id, service (FK), reviewer (FK), rating (1-5), comment, createdAt
  - `Dispute` – id, booking (FK), reason, status (OPEN, RESOLVED, REJECTED), resolution, createdAt
  - `Skill`, `Category`, `ServiceArea` – Reference data for filtering
  
- **Relationships**: User (one-to-many) Service/Booking/Conversation, Booking (many-to-one) Service, Conversation (two FK to User), etc.
- **Repositories** (`repository/`): Spring Data JPA interfaces with custom `@Query` methods where needed
- **File Storage**: 
  - Upload to `backend/uploads/avatar/` or `backend/uploads/service/` via `/upload` endpoint
  - Return full path URL (e.g., `/uploads/avatar/filename.jpg`)
  - Serve files publicly via `/uploads/**` (no auth required)

### Frontend State Management
- **`useAuth()` hook** (from `AuthContext.js`):
  - Properties: `user` (object), `loading` (bool)
  - Methods: `login(email, password)`, `logout()`, `register(userData)`, `isProvider()`, `isCustomer()`, `isAdmin()`, `updateUser(data)`
  - Usage: Always call in pages that need auth state; wraps app with `<AuthProvider>`
  
- **`useChat()` hook** (from `ChatContext.js`):
  - Properties: `conversations`, `activeConversation`, `messages`
  - Methods: `loadConversations()`, `selectConversation(id)`, `sendMessage(content)`, `markAsRead(conversationId)`

- **Protected Routes** (`ProtectedRoute.js`):
  - Wraps pages requiring auth; redirects to `/login` if `!user`
  - Example: `<ProtectedRoute><Dashboard /></ProtectedRoute>`

### URL Routing (Frontend)
- **Public**: `/` (Home), `/login`, `/register`, `/forgot-password`, `/reset-password`, `/services`, `/services/{id}`, `/privacy`, `/terms`, `/refund`, `/help`
- **Authenticated Customer**: `/dashboard`, `/bookings`, `/bookings/{id}`, `/services/map`, `/chat`
- **Authenticated Provider**: `/my-services`, `/my-services/create`, `/my-services/{id}/edit`
- **Authenticated (Any role)**: `/profile`, `/create-review/{bookingId}`
- **Admin Only**: `/admin/dashboard`, `/admin/providers`, `/admin/users`, `/admin/services`, `/admin/disputes`, `/admin/insights`

## Build & Development Workflow

### Prerequisites
- **Backend**: Java 17+, Maven 3.6+, MySQL 8.0+
- **Frontend**: Node 16+, npm 7+
- **Database**: Create MySQL database `fixitnow_db` with credentials in `backend/src/main/resources/application.properties`

### Local Development (Windows PowerShell)

```powershell
# Terminal 1: Backend
cd fin/backend
mvn clean install           # Build with tests (H2 for test profiles, MySQL for local)
mvn spring-boot:run         # Start Spring Boot server on http://localhost:8080/api

# Terminal 2: Frontend
cd fin/frontend
npm install                 # Install dependencies
npm start                   # Start React dev server on http://localhost:3000

# OR use convenience batch scripts
.\fin\bat\start-dev.bat     # Auto-launches both backend & frontend in separate terminals
.\fin\bat\test-system.bat   # Run integration tests
```

### Key Maven Commands
```bash
# Backend
mvn clean install                    # Full build with test execution
mvn spring-boot:run                  # Start without rebuild
mvn test                             # Run unit tests (uses H2 in-memory DB via application-test.properties)
mvn compile                          # Compile only
mvn package -DskipTests              # Build JAR without tests
```

### Key npm Commands
```bash
npm start                            # Dev server (http://localhost:3000)
npm run build                        # Production build
npm test                             # Run Jest tests
```

### Database Initialization
- Flyway auto-migrations run on backend startup (see `backend/src/main/resources/db/migration/`)
- Migrations create schema and seed initial categories/roles
- H2 in-memory DB used for test profiles (`application-test.properties`)

## Project Structure & Key Files

```
fin/
├── backend/
│   ├── pom.xml              # Maven dependencies (JWT, Spring Security, WebSocket, MySQL)
│   ├── src/main/java/com/fixitnow/
│   │   ├── controller/      # 12 REST controllers (Auth, Service, Booking, etc.)
│   │   ├── service/         # Business logic (e.g., BookingService, ReviewService)
│   │   ├── model/           # JPA entities (User, Service, Booking, ChatMessage, Review, Dispute)
│   │   ├── repository/      # Spring Data repositories
│   │   ├── config/          # WebSecurityConfig, WebSocketConfig, CorsConfig
│   │   ├── security/        # JWT token provider, AuthTokenFilter
│   │   └── dto/             # Request/response DTOs
│   └── src/main/resources/
│       ├── application.properties   # MySQL, JWT secret, CORS allowed origins, email config
│       ├── db/migration/    # Flyway SQL migrations (V1..V5)
│       └── uploads/         # File upload storage
├── frontend/
│   ├── package.json         # React dependencies (axios, @stomp/stompjs, react-router, tailwind)
│   ├── public/index.html
│   └── src/
│       ├── App.js           # Main router
│       ├── contexts/        # AuthContext.js (global auth state)
│       ├── pages/           # 25+ page components
│       ├── components/      # Reusable components (Navbar, MapView, ChatMessageModal, etc.)
│       └── services/        # api.js (Axios instance), googleMapsService.js, webSocketService.js
└── bat/
    ├── start-dev.bat        # Start backend + frontend
    ├── test-system.bat      # Run integration tests
    └── setup.bat            # Initial setup
```

## Configuration & Environment Setup

### Backend: `application.properties` (MySQL local)
```properties
# Database (MySQL)
spring.datasource.url=jdbc:mysql://localhost:3306/fixitnow_db
spring.datasource.username=root
spring.datasource.password=845905
spring.jpa.hibernate.ddl-auto=validate                  # Flyway handles schema
spring.jpa.show-sql=false

# JWT
app.jwt.secret=fixitnowSecretKey2024!@#$%^&*()_+        # Change in production!
app.jwt.expiration=86400000                             # 24 hours (ms)
app.jwt.refreshExpiration=2592000000                    # 30 days (ms)

# CORS
app.cors.allowed-origins=http://localhost:3000

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Email (for password reset, notifications)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### Backend: `application-test.properties` (H2 for tests)
```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
```

### Frontend: `.env` (create in `frontend/` root)
```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
```

## Common Implementation Patterns

### Adding a New Authenticated Endpoint
1. **Backend** (`controller/SomeController.java`):
   ```java
   @PostMapping("/some-path")
   @PreAuthorize("hasRole('CUSTOMER')")  // or hasAnyRole('CUSTOMER', 'ADMIN')
   public ResponseEntity<?> someMethod(@AuthenticationPrincipal User user, @RequestBody SomeDto dto) {
       // Access current user via 'user' parameter
       return ResponseEntity.ok(someResult);
   }
   ```
2. Update `WebSecurityConfig.java` if adding new role or path pattern
3. **Frontend** (`pages/SomePage.js`):
   ```javascript
   const { user } = useAuth();
   const response = await api.post('/some-path', data);
   ```

### Adding a New Role
1. Add to `Role` enum in `model/User.java`
2. Update `WebSecurityConfig.java` `requestMatchers` with new role rules
3. Update `AuthContext.js` with helper method: `isNewRole() { return user?.role === 'NEW_ROLE'; }`
4. Wrap conditional UI in frontend: `{user?.isNewRole() && <AdminPanel />}`

### File Upload Pattern
- **Frontend**: POST multipart form to `/upload` (authenticated, max 10MB)
  ```javascript
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  const filePath = response.data.filePath;  // e.g., "/uploads/avatar/abc123.jpg"
  ```
- **Backend** (`FileUploadController.java`): Saves to `backend/uploads/` and returns full path
- **Public Access**: Files automatically accessible at `/uploads/**` (no auth required)

### Adding a WebSocket Feature
1. **Backend** (`WebSocketChatController.java` or new controller):
   ```java
   @MessageMapping("/app/feature.action/{id}")
   @SendTo("/topic/feature/{id}")
   public FeatureMessage handleAction(@Payload FeatureMessage message) {
       return processAndReturn(message);
   }
   ```
2. **Frontend** (`services/webSocketService.js` wrapper):
   ```javascript
   // Subscribe to receive messages
   this.subscribe(`/topic/feature/${featureId}`, (message) => {
       handleReceivedMessage(JSON.parse(message.body));
   });
   
   // Send message
   this.send(`/app/feature.action/${featureId}`, { content: "data" });
   ```

### Querying with Filters (Frontend + Backend)
- **Frontend** sends filter params: `api.get('/services', { params: { category: 'plumbing', latitude: 10.5, longitude: 20.3 } })`
- **Backend** (`ServiceController.java`):
  ```java
  @GetMapping("")
  public List<ServiceDto> getServices(
      @RequestParam(required = false) String category,
      @RequestParam(required = false) Double latitude,
      @RequestParam(required = false) Double longitude) {
      // Use ServiceRepository.findBy... with custom @Query
  }
  ```
- **Repo** (`ServiceRepository.java`): Define custom queries for complex filters
  ```java
  @Query("SELECT s FROM Service s WHERE s.category = :category AND DISTANCE(s.latitude, :lat, s.longitude, :lon) <= :radius")
  List<Service> findNearbyByCategory(...);
  ```

## Key Files Reference

| File | Purpose |
|------|---------|
| `backend/src/main/java/com/fixitnow/config/WebSecurityConfig.java` | Auth rules, role checks, CORS setup |
| `backend/src/main/java/com/fixitnow/config/WebSocketConfig.java` | WebSocket endpoint registration |
| `backend/src/main/java/com/fixitnow/security/JwtTokenProvider.java` | JWT generation, validation, parsing |
| `backend/src/main/java/com/fixitnow/security/AuthTokenFilter.java` | Request-level JWT extraction and validation |
| `backend/src/main/java/com/fixitnow/controller/AuthController.java` | Login, signup, refresh, password reset |
| `backend/src/main/java/com/fixitnow/controller/WebSocketChatController.java` | Real-time chat messaging |
| `frontend/src/contexts/AuthContext.js` | Global auth state, login/logout, role helpers |
| `frontend/src/services/api.js` | Axios instance, interceptors, token refresh logic |
| `frontend/src/services/webSocketService.js` | STOMP client wrapper, connection management |
| `frontend/src/components/ProtectedRoute.js` | Route-level auth guard |

## Debugging & Troubleshooting

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| **401 Unauthorized after login** | Token not refreshed or stored | Check `localStorage` for `accessToken`/`refreshToken`; verify `api.js` interceptor is running |
| **CORS error in browser** | Frontend URL not in allowed origins | Update `app.cors.allowed-origins=http://localhost:3000` in `application.properties` |
| **WebSocket connection fails** | Wrong endpoint or missing auth header | Verify `/api/ws` in `webSocketService.js`; check `connectHeaders` has Bearer token |
| **Provider can't login after signup** | Account not verified by admin | Admin must access `/admin/providers` and click verify; check `user.isVerified` in database |
| **File upload 413 error** | Exceeds multipart size limit | Increase `spring.servlet.multipart.max-file-size` in `application.properties` |
| **Google Maps not displaying** | Missing or invalid API key | Add `REACT_APP_GOOGLE_MAPS_API_KEY` to `.env`; verify key in Google Cloud Console |
| **Real-time chat not updating** | Message subscription failed | Check WebSocket connection in browser DevTools; verify `/topic/chat/{roomId}` subscription |
| **Maven build fails** | Wrong Java version or missing MySQL | Ensure Java 17+ and MySQL running; check `pom.xml` parent version |
| **React app shows blank screen** | API URL misconfigured | Verify `REACT_APP_API_URL` in `.env` matches backend URL; check browser console for CORS errors |

## Testing Strategy

- **Backend Unit Tests**: Run via `mvn test` (uses H2 in-memory DB from `application-test.properties`)
- **Backend Integration Tests**: Use `mvn verify` or batch script `.\fin\bat\test-system.bat`
- **Frontend Unit Tests**: Run via `npm test` (Jest + React Testing Library)
- **Manual Testing**: Use Postman for REST API; DevTools Network tab for WebSocket debugging
- **Test Database**: H2 auto-creates schema on test startup via Flyway migrations

## Project-Specific Conventions

| Convention | Why | Example |
|-----------|-----|---------|
| Bearer token in every API call | Stateless auth for scalability | `api.js` interceptor adds automatically |
| Token refresh on 401 | JWT tokens are short-lived | `api.js` interceptor catches 401, refreshes, retries |
| Role enum (not strings) | Type-safe role checking | `Role.CUSTOMER` in backend, `user.role === 'CUSTOMER'` in frontend |
| `/uploads/**` public access | User-generated content is shareable | Avatar, service images accessible without auth |
| SockJS + STOMP (not raw WebSocket) | Cross-browser compatibility | Falls back to HTTP polling on old browsers |
| `/topic/` for broadcasts, `/queue/` for unicast | Clean message routing | Chat uses `/topic/chat/{roomId}`, notifications use `/queue/user/{userId}` |
| Flyway migrations (not Hibernate DDL) | Schema versioning and reproducibility | Migrations in `db/migration/V*.sql` |
| DTO pattern (not sending entities directly) | API contract stability | `ServiceDto` instead of raw `Service` entity |

---

**Questions or unclear sections?** Common clarifications: auth token lifecycle, entity relationships, WebSocket subscription pattern, role verification flow, Axios interceptor logic, or specific file locations.
