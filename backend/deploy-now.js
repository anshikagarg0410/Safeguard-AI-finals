#!/usr/bin/env node

// SafeGuard AI Backend - Instant Deployment Guide
// This script provides immediate deployment steps

const fs = require('fs');
const path = require('path');

console.log('🚀 SafeGuard AI Backend - Instant Deployment');
console.log('============================================');
console.log('');

// Check if we're in the right directory
if (!fs.existsSync('package.json') || !fs.existsSync('server.js')) {
  console.log('❌ Please run this script from the backend directory');
  process.exit(1);
}

console.log('✅ Backend files detected!');
console.log('');

// Display immediate deployment options
console.log('🎯 Choose Your Deployment Method:');
console.log('==================================');
console.log('');
console.log('1. 🌐 Render (Recommended - Free, Easy, Fast)');
// console.log('2. 🐳 Docker (Local/Cloud)');
console.log('3. 🚂 Railway (Alternative to Render)');
console.log('4. 🦊 Heroku (Legacy but reliable)');
console.log('5. 🐙 GitHub Actions (CI/CD)');
console.log('');

const deploymentMethod = process.argv[2] || 'render';

switch (deploymentMethod) {
  case 'render':
    showRenderDeployment();
    break;
  // case 'docker':
  //   showDockerDeployment();
  //   break;
  case 'railway':
    showRailwayDeployment();
    break;
  case 'heroku':
    showHerokuDeployment();
    break;
  case 'github':
    showGitHubDeployment();
    break;
  default:
    showRenderDeployment();
}

function showRenderDeployment() {
  console.log('🌐 Render Deployment (Recommended)');
  console.log('==================================');
  console.log('');
  console.log('⏱️  Estimated time: 5-10 minutes');
  console.log('💰 Cost: FREE tier available');
  console.log('🌍 Global CDN: Yes');
  console.log('');
  
  console.log('📋 Prerequisites:');
  console.log('   ✅ GitHub repository');
  console.log('   ✅ MongoDB Atlas account (free)');
  console.log('   ✅ 5 minutes of your time');
  console.log('');
  
  console.log('🚀 Step-by-Step:');
  console.log('');
  console.log('1. 🐙 Push your code to GitHub:');
  console.log('   git add .');
  console.log('   git commit -m "Deploy SafeGuard AI Backend"');
  console.log('   git push origin main');
  console.log('');
  
  console.log('2. 🌐 Open Render Dashboard:');
  console.log('   https://dashboard.render.com/');
  console.log('   (Sign up with GitHub if needed)');
  console.log('');
  
  console.log('3. ➕ Create New Web Service:');
  console.log('   - Click "New +" → "Web Service"');
  console.log('   - Connect your GitHub repo');
  console.log('   - Name: safeguard-ai-backend');
  console.log('   - Environment: Node');
  console.log('   - Build Command: npm install');
  console.log('   - Start Command: npm start');
  console.log('   - Plan: Free');
  console.log('');
  
  console.log('4. 🔑 Add Environment Variables:');
  console.log('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/familysafe-ai');
  console.log('   JWT_SECRET=your-super-secret-key-here');
  console.log('   NODE_ENV=production');
  console.log('');
  
  console.log('5. 🚀 Deploy:');
  console.log('   - Click "Create Web Service"');
  console.log('   - Wait 3-5 minutes');
  console.log('   - Your backend is LIVE! 🎉');
  console.log('');
  
  console.log('🔗 Your backend URL will be:');
  console.log('   https://safeguard-ai-backend.onrender.com');
  console.log('');
  
  console.log('💡 Pro Tips:');
  console.log('   - Use MongoDB Atlas free tier (512MB)');
  console.log('   - Generate a strong JWT_SECRET');
  console.log('   - Enable auto-deploy from main branch');
  console.log('   - Set up health checks');
  console.log('');
  
  console.log('🎯 Ready to deploy? Run:');
  console.log('   node deploy-now.js render');
}

// function showDockerDeployment() { /* removed */ }

function showRailwayDeployment() {
  console.log('🚂 Railway Deployment');
  console.log('=====================');
  console.log('');
  console.log('⏱️  Estimated time: 5-10 minutes');
  console.log('💰 Cost: $5/month (includes database)');
  console.log('🌍 Global CDN: Yes');
  console.log('');
  
  console.log('🚀 Steps:');
  console.log('');
  console.log('1. 🌐 Go to Railway: https://railway.app/');
  console.log('2. 🔗 Connect your GitHub repository');
  console.log('3. 🚀 Deploy automatically');
  console.log('4. 🔑 Add environment variables');
  console.log('5. 🎉 Your backend is live!');
  console.log('');
}

function showHerokuDeployment() {
  console.log('🦊 Heroku Deployment');
  console.log('====================');
  console.log('');
  console.log('⏱️  Estimated time: 5-10 minutes');
  console.log('💰 Cost: $7/month (basic dyno)');
  console.log('🌍 Global CDN: Yes');
  console.log('');
  
  console.log('🚀 Steps:');
  console.log('');
  console.log('1. 🦊 Install Heroku CLI');
  console.log('2. 🔐 Login: heroku login');
  console.log('3. 🚀 Create app: heroku create safeguard-ai-backend');
  console.log('4. 🔑 Set config: heroku config:set MONGODB_URI=...');
  console.log('5. 🚀 Deploy: git push heroku main');
  console.log('');
}

function showGitHubDeployment() {
  console.log('🐙 GitHub Actions Deployment');
  console.log('============================');
  console.log('');
  console.log('⏱️  Estimated time: 10-15 minutes');
  console.log('💰 Cost: Free (GitHub Actions)');
  console.log('🌍 Global CDN: Depends on target');
  console.log('');
  
  console.log('🚀 Steps:');
  console.log('');
  console.log('1. 📁 Create .github/workflows/deploy.yml');
  console.log('2. 🔑 Add secrets to GitHub repository');
  console.log('3. 🚀 Push to trigger deployment');
  console.log('4. 🎉 Automatic deployments on every push!');
  console.log('');
}

console.log('');
console.log('🎯 To deploy now, choose your method:');
console.log('   node deploy-now.js render    (Recommended)');
// console.log('   node deploy-now.js docker    (Local/Cloud)');
console.log('   node deploy-now.js railway   (Alternative)');
console.log('   node deploy-now.js heroku    (Legacy)');
console.log('   node deploy-now.js github    (CI/CD)');
console.log('');
console.log('🚀 Happy Deploying! 🎉');
