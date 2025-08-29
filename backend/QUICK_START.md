# 🚀 SafeGuard AI Backend - Quick Start Guide

## ⚡ Get Started in 5 Minutes

### 1. 📋 Prerequisites
- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account
- Git repository set up

### 2. 🏃‍♂️ Quick Start

```bash
# Clone and navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment template
copy env.local.template .env

# Edit .env file with your settings
# (especially MONGODB_URI and JWT_SECRET)

# Start the server
npm run dev
```

### 3. 🧪 Test Your Backend

```bash
# Test the API endpoints
node test-api.js

# Or test manually with curl
curl http://localhost:5000/health
```

### 4. 🌐 Deploy to Render (Recommended)

```bash
# Run deployment check
node deploy-render.js

# Follow the deployment instructions
# Your backend will be live in minutes!
```

## 🔧 Environment Variables

**Required:**
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A strong secret for JWT tokens

**Optional:**
- `EMAIL_SERVICE` - For password reset functionality
- `CLOUDINARY_*` - For file uploads
- `SMS_*` - For SMS notifications

## 📱 API Endpoints

- `GET /health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/contacts` - Create contact
- `POST /api/wellness` - Create wellness entry
- `POST /api/monitoring/start` - Start monitoring
- `POST /api/alerts` - Create alert

## 🐳 Docker

Docker support has been removed. Use local Node.js or deploy with Render instead.

## 🆘 Need Help?

1. Check the logs: `npm run dev`
2. Run tests: `node test-api.js`
3. Check deployment: `node deploy-render.js`
4. Read the full README.md

## 🎯 Next Steps

1. ✅ Backend is running locally
2. 🚀 Deploy to Render for production
3. 🔗 Connect your frontend
4. 🧪 Test all endpoints
5. 🎉 Your SafeGuard AI is live!

---

**Happy Coding! 🎉**
