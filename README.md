# FixItNow - Neighborhood Service & Repair Marketplace

A full-stack web application connecting residents with local service providers like electricians, plumbers, carpenters, and more.

## 🚀 Features

- **User Authentication**: JWT-based authentication with role-based access (Customer, Provider, Admin)
- **Service Discovery**: Location-based search and filtering
- **Booking System**: Instant booking with time slots
- **Real-time Chat**: WebSocket-powered messaging between customers and providers
- **Review System**: Rating and feedback system
- **Admin Panel**: User verification and dispute management
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🛠 Tech Stack

### Frontend
- React.js 18
- Tailwind CSS
- React Router
- Axios
- React Query
- Socket.io Client

### Backend
- Spring Boot 3.2
- Spring Security
- Spring Data JPA
- JWT Authentication
- WebSocket (STOMP)
- MySQL

## 📁 Project Structure

```
fixitnow-app/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── services/       # API services
│   └── public/
└── backend/               # Spring Boot application
    └── src/main/java/com/fixitnow/
        ├── controller/    # REST controllers
        ├── model/         # JPA entities
        ├── repository/    # Data repositories
        ├── service/       # Business logic
        ├── security/      # Security configuration
        └── config/        # Configuration classes
```

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 16+
- Java 17+
- MySQL 8.0+
- Maven 3.6+

### Database Setup
1. Create a MySQL database named `fixitnow_db`
2. Update database credentials in `backend/src/main/resources/application.properties`

### Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

The frontend will start on `http://localhost:3000`

## 🔧 Configuration

### Backend Configuration
Update `application.properties` with your settings:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/fixitnow_db
spring.datasource.username=your_username
spring.datasource.password=your_password

# JWT
app.jwt.secret=your_jwt_secret_key
```

### Frontend Configuration
Create a `.env` file in the frontend directory:

```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 📋 Development Roadmap

### Milestone 1: Authentication & Basic Setup ✅
- [x] JWT authentication system
- [x] User registration and login
- [x] Role-based routing
- [x] Basic project structure

### Milestone 2: Service Listings & Search (Week 3-4)
- [x] Service CRUD operations
- [x] Category and subcategory system
- [x] Location-based search
- [x] Google Maps integration

### Milestone 3: Booking & Interaction (Week 5-6)
- [x] Booking system with time slots
- [x] Real-time chat with WebSockets
- [x] Review and rating system
- [x] Notification system

### Milestone 4: Admin Panel & Enhancement (Week 7-8)
- [x] Admin dashboard
- [x] Provider verification system
- [x] Dispute management
- [x] Analytics and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📧 Contact

For questions or support, please contact the development teem.
