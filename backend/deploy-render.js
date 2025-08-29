// SafeGuard AI Backend - Render Deployment Script
// This script helps deploy the backend to Render

const fs = require('fs');
const path = require('path');

console.log('🚀 SafeGuard AI Backend Deployment to Render');
console.log('============================================');

// Check if we have the necessary files
const requiredFiles = [
  'package.json',
  'server.js',
  'render.yaml',
  'Dockerfile'
];

console.log('\n📋 Checking required files...');
let missingFiles = [];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log('\n❌ Missing required files. Please ensure all files are present before deployment.');
  process.exit(1);
}

console.log('\n✅ All required files are present!');

// Display deployment instructions
console.log('\n📚 Deployment Instructions:');
console.log('============================');
console.log('');
console.log('1. 🐙 Push your code to GitHub:');
console.log('   git add .');
console.log('   git commit -m "Initial backend deployment"');
console.log('   git push origin main');
console.log('');
console.log('2. 🌐 Go to Render Dashboard:');
console.log('   https://dashboard.render.com/');
console.log('');
console.log('3. ➕ Click "New +" and select "Web Service"');
console.log('');
console.log('4. 🔗 Connect your GitHub repository');
console.log('');
console.log('5. ⚙️  Configure the service:');
console.log('   - Name: safeguard-ai-backend');
console.log('   - Environment: Node');
console.log('   - Build Command: npm install');
console.log('   - Start Command: npm start');
console.log('   - Plan: Free (or your preferred plan)');
console.log('');
console.log('6. 🔑 Add Environment Variables:');
console.log('   - MONGODB_URI: Your MongoDB connection string');
console.log('   - JWT_SECRET: A strong secret for JWT tokens');
console.log('   - NODE_ENV: production');
console.log('   - PORT: 10000 (Render will set this automatically)');
console.log('');
console.log('7. 🚀 Click "Create Web Service"');
console.log('');
console.log('8. ⏳ Wait for deployment to complete');
console.log('');
console.log('9. 🔗 Your backend will be available at:');
console.log('   https://safeguard-ai-backend.onrender.com (or similar)');
console.log('');

// Check package.json scripts
console.log('📦 Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

if (packageJson.scripts.start) {
  console.log('✅ start script found:', packageJson.scripts.start);
} else {
  console.log('❌ start script missing - Render requires this');
}

if (packageJson.scripts.build) {
  console.log('✅ build script found:', packageJson.scripts.build);
} else {
  console.log('❌ build script missing - Consider adding one');
}

console.log('\n🎯 Ready for deployment! Follow the steps above to deploy to Render.');
console.log('\n💡 Pro Tips:');
console.log('   - Use Render\'s free tier for testing');
console.log('   - Set up automatic deployments from your main branch');
console.log('   - Monitor your service logs in the Render dashboard');
console.log('   - Set up health checks for better monitoring');
console.log('   - Consider using Render\'s managed MongoDB service');
