# SafeGuard AI Backend Deployment Guide

This guide will help you deploy the SafeGuard AI backend to various cloud platforms.

## 🚀 Quick Deploy to Render (Recommended)

### 1. Prepare Your Repository

1. Push your code to GitHub
2. Ensure all files are committed
3. The `render.yaml` file is already configured

### 2. Deploy to Render

1. Go to [Render.com](https://render.com) and sign up/login
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` configuration
5. Set your environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string
   - `NODE_ENV`: production
6. Click "Create Web Service"

### 3. Get Your Backend URL

After deployment, Render will provide you with a URL like:
`https://your-app-name.onrender.com`

## 🐳 Docker

Docker support has been removed. Please use Render, Railway, or run locally with Node.js.

## ☁️ Other Cloud Platforms

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Heroku

```bash
# Install Heroku CLI
# Create app and deploy
heroku create your-app-name
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

### DigitalOcean App Platform

1. Go to DigitalOcean App Platform
2. Connect your GitHub repository
3. Configure build settings:
   - Build Command: `npm install`
   - Run Command: `npm start`
4. Set environment variables
5. Deploy!

## 🔧 Environment Variables

### Required Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=your-frontend-url
```

### Optional Variables

```env
# Email (for password reset)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS (for notifications)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# File uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended for Production)

1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Add it to your environment variables

### Local MongoDB

```bash
# Install MongoDB locally
# Or use a managed MongoDB like MongoDB Atlas
```

## 📱 Frontend Integration

### Update Frontend Configuration

After deploying your backend, update your frontend to use the new backend URL:

```typescript
// In your frontend config
const API_BASE_URL = 'https://your-backend-url.onrender.com/api';
```

### CORS Configuration

The backend is already configured to accept requests from your frontend domain. If you need to add more domains, update the CORS configuration in `server.js`.

## 🔒 Security Considerations

### Production Checklist

- [ ] Use HTTPS (automatic with most cloud platforms)
- [ ] Set strong JWT_SECRET
- [ ] Use environment variables for sensitive data
- [ ] Enable rate limiting
- [ ] Set up proper CORS origins
- [ ] Use MongoDB Atlas or secure database
- [ ] Enable logging and monitoring

### JWT Secret Generation

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📊 Monitoring and Health Checks

### Health Endpoint

Your backend includes a health check endpoint at `/health` that returns:

```json
{
  "status": "OK",
  "message": "SafeGuard AI Backend is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Logs

- Render: View logs in the dashboard
- Railway: Use `railway logs`
- Heroku: Use `heroku logs --tail`
 

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check your connection string
   - Ensure MongoDB is running
   - Check network access

2. **JWT Errors**
   - Verify JWT_SECRET is set
   - Check token expiration

3. **CORS Errors**
   - Verify FRONTEND_URL is correct
   - Check CORS configuration

4. **Port Issues**
   - Ensure PORT environment variable is set
   - Check if port is available

### Debug Mode

For debugging, set `NODE_ENV=development` to see detailed error messages.

## 📈 Scaling

### Render

- Automatic scaling based on traffic
- Upgrade plan for more resources

### Railway

- Automatic scaling
- Pay-per-use pricing

### Heroku

- Dyno scaling
- Add-ons for databases and monitoring

## 🔄 Continuous Deployment

### GitHub Actions

Set up GitHub Actions for automatic deployment:

```yaml
name: Deploy to Render
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v1.0.0
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

## 📞 Support

If you encounter issues:

1. Check the logs
2. Verify environment variables
3. Test locally first
4. Check platform-specific documentation
5. Create an issue in the repository

## 🎯 Next Steps

After successful deployment:

1. Test all API endpoints
2. Update frontend configuration
3. Set up monitoring and alerts
4. Configure custom domain (optional)
5. Set up SSL certificates (automatic with most platforms)
6. Test production environment thoroughly

---

**Happy Deploying! 🚀**
