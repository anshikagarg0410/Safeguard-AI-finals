# SafeGuard AI Backend

A comprehensive, privacy-first backend platform for family safety and wellness monitoring. Built with Node.js, Express, and MongoDB.

## 🚀 Features

- **AI-Powered Monitoring**: Real-time activity recognition and safety monitoring
- **Emergency Alert System**: Instant notifications with escalation procedures
- **Wellness Tracking**: Health metrics, medication management, and wellness scoring
- **Contact Management**: Emergency contacts, caregivers, and family members
- **User Authentication**: Secure JWT-based authentication with role-based access
- **Privacy-First**: On-device AI processing with configurable privacy settings
- **Real-time Notifications**: Email, SMS, and push notification support
- **Comprehensive API**: RESTful API with validation and error handling

## 🏗️ Architecture

```
backend/
├── config/          # Database and configuration
├── middleware/      # Authentication and error handling
├── models/          # MongoDB schemas and models
├── routes/          # API route handlers
├── server.js        # Main application entry point
└── package.json     # Dependencies and scripts
```

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **File Upload**: Multer with Cloudinary
- **Email**: Nodemailer
- **Monitoring**: Morgan logging

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/familysafe-ai

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Security
BCRYPT_SALT_ROUNDS=12
```

### 3. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | User registration | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update profile | Private |
| PUT | `/api/auth/change-password` | Change password | Private |
| POST | `/api/auth/forgot-password` | Forgot password | Public |
| PUT | `/api/auth/reset-password/:token` | Reset password | Public |
| GET | `/api/auth/verify-email/:token` | Verify email | Public |

### Monitoring Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/monitoring/start` | Start monitoring session | Private |
| PUT | `/api/monitoring/stop/:sessionId` | Stop monitoring session | Private |
| PUT | `/api/monitoring/pause/:sessionId` | Pause monitoring session | Private |
| PUT | `/api/monitoring/resume/:sessionId` | Resume monitoring session | Private |
| POST | `/api/monitoring/:sessionId/activity` | Add activity data | Private |
| GET | `/api/monitoring/:sessionId` | Get monitoring session | Private |
| GET | `/api/monitoring` | Get user's sessions | Private |
| GET | `/api/monitoring/stats/overview` | Get monitoring statistics | Private |

### Alert Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/alerts` | Get user's alerts | Private |
| GET | `/api/alerts/:id` | Get alert by ID | Private |
| POST | `/api/alerts` | Create new alert | Private |
| PUT | `/api/alerts/:id/acknowledge` | Acknowledge alert | Private |
| PUT | `/api/alerts/:id/resolve` | Resolve alert | Private |
| PUT | `/api/alerts/:id/escalate` | Escalate alert | Private |
| PUT | `/api/alerts/:id` | Update alert | Private |
| DELETE | `/api/alerts/:id` | Delete alert | Private |
| GET | `/api/alerts/stats/overview` | Get alert statistics | Private |

### Wellness Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/wellness` | Get wellness data | Private |
| GET | `/api/wellness/date/:date` | Get wellness by date | Private |
| POST | `/api/wellness` | Create wellness entry | Private |
| PUT | `/api/wellness/:id` | Update wellness entry | Private |
| POST | `/api/wellness/:id/medication` | Add medication | Private |
| PUT | `/api/wellness/:id/medication/:medId` | Mark medication taken | Private |
| POST | `/api/wellness/:id/symptoms` | Add symptom | Private |
| PUT | `/api/wellness/:id/symptoms/:symptomId` | Resolve symptom | Private |
| GET | `/api/wellness/trends` | Get wellness trends | Private |
| GET | `/api/wellness/stats` | Get wellness statistics | Private |

### Contact Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/contacts` | Get user's contacts | Private |
| GET | `/api/contacts/:id` | Get contact by ID | Private |
| POST | `/api/contacts` | Create new contact | Private |
| PUT | `/api/contacts/:id` | Update contact | Private |
| DELETE | `/api/contacts/:id` | Delete contact | Private |
| PUT | `/api/contacts/:id/notifications` | Update notification preferences | Private |
| PUT | `/api/contacts/:id/availability` | Update availability | Private |
| PUT | `/api/contacts/:id/emergency-response` | Update emergency response | Private |
| GET | `/api/contacts/primary` | Get primary contacts | Private |
| GET | `/api/contacts/type/:contactType` | Get contacts by type | Private |
| GET | `/api/contacts/search/:term` | Search contacts | Private |

### User Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users` | Get all users (Admin) | Admin |
| GET | `/api/users/:id` | Get user by ID (Admin) | Admin |
| PUT | `/api/users/:id` | Update user (Admin) | Admin |
| DELETE | `/api/users/:id` | Delete user (Admin) | Admin |
| PUT | `/api/users/preferences` | Update user preferences | Private |
| PUT | `/api/users/emergency-contacts` | Update emergency contacts | Private |
| GET | `/api/users/stats` | Get user statistics (Admin) | Admin |
| PUT | `/api/users/:id/deactivate` | Deactivate user (Admin) | Admin |
| PUT | `/api/users/:id/reactivate` | Reactivate user (Admin) | Admin |
| GET | `/api/users/dashboard` | Get user dashboard | Private |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Data Models

### User Model
- Personal information (name, email, phone)
- Role-based access control
- Emergency contacts
- Privacy preferences
- Notification settings

### Monitoring Model
- Session management
- AI analysis settings
- Activity tracking
- Privacy controls
- Performance metrics

### Alert Model
- Alert types and severity
- Escalation procedures
- Notification tracking
- Resolution workflow
- Metadata storage

### Wellness Model
- Health metrics
- Medication tracking
- Symptom monitoring
- Wellness scoring
- Goal management

### Contact Model
- Contact information
- Relationship types
- Availability schedules
- Notification preferences
- Emergency response settings

## 🚀 Deployment

### Environment Variables

Set the following environment variables for production:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=your-frontend-url
```

### Production Commands

```bash
npm start
```

### Docker Deployment

Docker support has been removed for this project. Please run locally with Node.js or deploy using Render (`render.yaml`) or your preferred platform.

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API request throttling
- **Input Validation**: Request data validation
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt password encryption
- **SQL Injection Protection**: Mongoose ODM
- **XSS Protection**: Input sanitization

## 📝 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": "Additional error details"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📈 Monitoring

- **Health Check**: `/health` endpoint
- **Logging**: Morgan HTTP request logging
- **Error Tracking**: Comprehensive error logging
- **Performance**: Response time monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Real-time WebSocket**: Live monitoring updates
- **AI Model Training**: Custom model development (ML containerization removed)
- **Mobile App**: Native mobile applications
- **IoT Integration**: Smart device connectivity
- **Analytics Dashboard**: Advanced reporting
- **Multi-language**: Internationalization support
- **API Versioning**: Backward compatibility
- **Microservices**: Service architecture evolution
