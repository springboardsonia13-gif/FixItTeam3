# FixItNow - Neighborhood Service & Repair Marketplace

A full-stack web application connecting residents with local service providers like electricians, plumbers, carpenters, and more. Built with **Spring Boot 3 + React 18**, featuring real-time messaging, location-based search, and comprehensive admin tools. [View Project](https://fixitnow-frontend-m629.onrender.com/)


## 🎯 Project Overview

**FixItNow** is a marketplace platform that enables:
- **Customers** to discover, book, and review local service providers
- **Providers** to list services, manage bookings, and build reputation
- **Admins** to verify providers, resolve disputes, and monitor platform metrics

### Current Status: ✅ **Production-Ready**
- All core features implemented and tested
- JWT authentication with token refresh
- Real-time WebSocket communication
- Provider verification workflow
- Complete dispute resolution system

## 🚀 Core Features

### 👥 User Management
- **JWT-based Authentication** with secure token refresh mechanism
- **Three User Roles**: Customer, Provider (verified), Admin
- **Provider Verification**: Document upload (ShopAct, MSME, Udyam) with admin approval
- **User Profiles**: Avatar upload, bio, service history, ratings

### 🔍 Service Discovery
- **Location-Based Search**: Find providers within custom radius using latitude/longitude
- **Category & Subcategory Filtering**: Services organized by type
- **Advanced Filtering**: Price range, rating, availability
- **Google Maps Integration**: Visual provider location mapping

### 📅 Booking & Management
- **Instant Booking**: Select time slots and confirm bookings
- **Booking Lifecycle**: PENDING → CONFIRMED → COMPLETED → REVIEWED
- **Provider Dashboard**: Manage bookings, confirm/cancel, track earnings
- **Customer Dashboard**: View bookings, provider profiles, booking history

### 💬 Real-Time Communication
- **WebSocket Chat**: STOMP protocol for instant messaging
- **Conversation Management**: Between customers and providers
- **Message Read Status**: Track seen/unseen messages
- **Auto-Reconnection**: Handles network drops gracefully

### ⭐ Reviews & Ratings
- **Post-Booking Reviews**: 1-5 star ratings with comments
- **Provider Reputation**: Aggregated ratings visible to customers
- **Review Verification**: Only customers who completed bookings can review

### 🛡️ Dispute Resolution
- **Dispute Filing**: Customers can escalate issues with bookings
- **Admin Review**: Admins investigate and resolve disputes
- **Status Tracking**: OPEN → RESOLVED / REJECTED

### 📊 Admin Dashboard
- **Provider Management**: View, verify, or reject provider applications
- **User Management**: Suspend/activate users, view profiles
- **Dispute Tracking**: Manage and resolve customer-provider disputes
- **Analytics**: Dashboard metrics (total users, bookings, revenue trends)
- **Service Management**: Monitor all services on platform

## 🛠 Tech Stack & Architecture

### Frontend Stack
- **React 18**: Modern component-based UI framework
- **React Router v6**: Client-side routing with nested routes
- **Axios**: HTTP client with interceptors for JWT authentication
- **Context API**: Global state management (Auth, Chat)
- **React Query v3**: Server state caching and synchronization
- **Tailwind CSS**: Utility-first CSS for responsive design
- **STOMP + SockJS**: WebSocket client for real-time communication
- **React Hook Form**: Lightweight form validation
- **React Hot Toast**: Non-blocking notifications
- **Google Maps API**: Location visualization and search
- **jsPDF & XLSX**: Report generation and data export

### Backend Stack
- **Spring Boot 3.2**: Enterprise Java framework
- **Spring Security**: Authentication & authorization
- **Spring Data JPA**: ORM with Hibernate
- **JWT (io.jsonwebtoken)**: Secure token generation and validation
- **Spring WebSocket**: STOMP message broker
- **MySQL 8.0**: Relational database
- **Flyway**: Database migration management
- **Spring Mail**: Email notifications and password reset
- **Maven 3.6+**: Build and dependency management

### Architecture Pattern
- **Layered Architecture**: Controller → Service → Repository → Database
- **RESTful API**: 12 controllers, 50+ endpoints
- **Real-Time Layer**: WebSocket endpoints for chat
- **Security**: JWT bearer token + Spring Security method-level authorization
- **State Management**: Server-side (JPA/MySQL) + Client-side (localStorage + Context)

## 📁 Project Structure & Key Files

```
FixItTeam3/
├── fin/
│   ├── backend/                              # Spring Boot REST + WebSocket API
│   │   ├── pom.xml                          # Maven dependencies
│   │   ├── src/main/java/com/fixitnow/
│   │   │   ├── FixItNowApplication.java     # Entry point
│   │   │   ├── controller/                  # 12 REST controllers
│   │   │   ├── model/                       # JPA Entities (9 models)
│   │   │   ├── repository/                  # Spring Data JPA Repositories
│   │   │   ├── service/                     # Business Logic (8 services)
│   │   │   ├── dto/                         # Request/Response DTOs
│   │   │   ├── config/                      # Configuration Classes
│   │   │   ├── security/                    # Security Components
│   │   │   └── exception/                   # Custom Exceptions
│   │   ├── src/main/resources/
│   │   │   ├── application.properties       # MySQL, JWT, CORS, Mail config
│   │   │   ├── application-test.properties  # H2 test database config
│   │   │   ├── db/migration/                # Flyway SQL migrations
│   │   │   └── uploads/                     # File storage directory
│   │   └── target/                          # Build artifacts
│   │
│   ├── frontend/                             # React 18 Single Page App
│   │   ├── package.json                     # Dependencies
│   │   ├── public/index.html                # HTML entry point
│   │   ├── src/
│   │   │   ├── index.js                     # React DOM render
│   │   │   ├── App.js                       # Main router & layout
│   │   │   ├── contexts/                    # Global State (Auth, Chat)
│   │   │   ├── pages/                       # 25+ Page Components
│   │   │   ├── components/                  # Reusable Components
│   │   │   └── services/                    # API & External Services
│   │   ├── .env                             # Environment variables (create locally)
│   │   ├── tailwind.config.js               # Tailwind configuration
│   │   └── node_modules/ (gitignored)
│   │
│   └── bat/                                  # Convenience Scripts (Windows)
│       ├── start-dev.bat
│       ├── test-system.bat
│       └── setup.bat
│
├── Guide/                                    # Documentation
│   ├── COMPLETE_SYSTEM_GUIDE.md
│   ├── ADMIN_PANEL_GUIDE.md
│   ├── DEPLOYMENT_CHECKLIST.md
│   └── ... (more guides)
│
├── .github/
│   └── copilot-instructions.md              # AI Agent guidance
│
├── README.md                                 # This file
└── LICENSE
```

## 🏃‍♂️ Getting Started

### System Requirements
| Component | Requirement |
|-----------|-------------|
| **Java** | 17+ |
| **Node.js** | 16+ |
| **MySQL** | 8.0+ |
| **Maven** | 3.6+ |
| **RAM** | 4GB minimum |

### Database Setup
```bash
mysql -u root -p
CREATE DATABASE fixitnow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Backend Setup
```bash
cd fin/backend
mvn clean install
mvn spring-boot:run
# Server runs on: http://localhost:8080/api
```

### Frontend Setup
```bash
cd fin/frontend
npm install
npm start
# App launches on: http://localhost:3000
```

### Quick Start (Windows)
```powershell
.\fin\bat\start-dev.bat
```

## 🔧 Configuration

### Backend: `application.properties`
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/fixitnow_db
spring.datasource.username= your username
spring.datasource.password= your password

# JWT
app.jwt.secret=fixitnowSecretKey2024!@#$%^&*()_+
app.jwt.expiration=86400000

# CORS
app.cors.allowed-origins=http://localhost:3000

# Email
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### Frontend: `.env`
```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
```

## 📚 API Documentation

### Authentication
```bash
POST /auth/signup       # Register new user
POST /auth/signin       # Login
POST /auth/refresh      # Refresh token
```

### Services
```bash
GET    /services                                # List all services
GET    /services/{id}                           # Get service details
POST   /provider/services                       # Create service (provider)
PUT    /provider/services/{id}                  # Update service
DELETE /provider/services/{id}                  # Delete service
```

### Bookings
```bash
POST   /bookings                                # Create booking
GET    /bookings                                # Get my bookings
PUT    /bookings/{id}/confirm                   # Confirm booking
PUT    /bookings/{id}/complete                  # Complete booking
```

### Chat (WebSocket)
```
/api/ws - WebSocket endpoint
/app/chat.sendMessage/{conversationId}         # Send message
/topic/chat/{conversationId}                   # Subscribe to messages
```

### Admin
```bash
GET    /admin/providers                         # List providers
PATCH  /admin/verify-provider/{id}              # Verify provider
GET    /admin/disputes                          # List disputes
GET    /admin/analytics                         # Dashboard metrics
```

## 🧪 Testing

### Backend Tests
```bash
cd fin/backend
mvn test                                        # Unit tests
mvn verify                                      # Integration tests
```

### Frontend Tests
```bash
cd fin/frontend
npm test                                        # Jest + React Testing Library
```

## 🚀 Deployment

### Build Production JAR
```bash
cd fin/backend
mvn clean package -DskipTests
```

### Build Production Bundle
```bash
cd fin/frontend
npm run build
# Output: build/ directory
```

### Deploy Backend
```bash
java -jar target/fixitnow-backend-1.0.0.jar
```

### Deploy Frontend
```bash
# Option 1: AWS S3
aws s3 sync build/ s3://fixitnow-frontend/

# Option 2: Traditional hosting
scp -r build/* user@host:/var/www/html/
```

## 🛠 Development & Contributing

### Setup Development Environment
```bash
git clone https://github.com/springboardsonia13-gif/FixItTeam3.git
cd FixItTeam3
git checkout -b feature/your-feature-name
```

### Coding Standards
- **Backend**: Google Java Style Guide
- **Frontend**: Airbnb ESLint config
- **Commits**: Conventional commits (`feat:`, `fix:`, `docs:`)

## 📚 Documentation

- **[Complete System Guide](./Guide/COMPLETE_SYSTEM_GUIDE.md)** – Full architecture
- **[Admin Panel Guide](./Guide/ADMIN_PANEL_GUIDE.md)** – Admin features
- **[Deployment Checklist](./Guide/DEPLOYMENT_CHECKLIST.md)** – Pre-deployment
- **[AI Agent Guide](./fin/.github/copilot-instructions.md)** – Developer assistance

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Maven build fails** | Run `mvn clean -U install` |
| **Port 8080 in use** | Change port in properties or kill process |
| **Frontend won't connect** | Verify `REACT_APP_API_URL` in `.env`; check CORS |
| **Google Maps not showing** | Verify API key and Cloud Console restrictions |
| **WebSocket connection fails** | Ensure backend running; verify `/api/ws` |
| **Database connection error** | Check MySQL running; verify credentials |

## 📝 License

This project is licensed under the **MIT License**.

## 📧 Contact

**Repository:** [FixItTeam3](https://github.com/springboardsonia13-gif/FixItTeam3)  
**Issues:** [GitHub Issues](https://github.com/springboardsonia13-gif/FixItTeam3/issues)

---


