// SafeGuard AI Backend API Testing Script
// Run this script to test your backend endpoints

const axios = require('axios');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

// Test data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'TestPass123!',
  phone: '+1234567890'
};

let authToken = null;
let userId = null;

// Helper function to make authenticated requests
const authRequest = (method, endpoint, data = null) => {
  const config = {
    method,
    url: `${API_BASE}${endpoint}`,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

// Test functions
const testHealthCheck = async () => {
  try {
    console.log('🔍 Testing health check...');
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
};

const testUserRegistration = async () => {
  try {
    console.log('🔍 Testing user registration...');
    const response = await axios.post(`${API_BASE}/auth/register`, testUser);
    console.log('✅ User registration passed:', response.data.message);
    authToken = response.data.data.token;
    userId = response.data.data.user._id;
    return true;
  } catch (error) {
    console.error('❌ User registration failed:', error.response?.data || error.message);
    return false;
  }
};

const testUserLogin = async () => {
  try {
    console.log('🔍 Testing user login...');
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ User login passed:', response.data.message);
    authToken = response.data.data.token;
    userId = response.data.data.user._id;
    return true;
  } catch (error) {
    console.error('❌ User login failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetCurrentUser = async () => {
  try {
    console.log('🔍 Testing get current user...');
    const response = await authRequest('GET', '/auth/me');
    console.log('✅ Get current user passed:', response.data.data.user.email);
    return true;
  } catch (error) {
    console.error('❌ Get current user failed:', error.response?.data || error.message);
    return false;
  }
};

const testCreateContact = async () => {
  try {
    console.log('🔍 Testing contact creation...');
    const contactData = {
      contactType: 'emergency_contact',
      firstName: 'Emergency',
      lastName: 'Contact',
      relationship: 'Spouse',
      email: 'emergency@example.com',
      phone: '+1987654321',
      isPrimary: true
    };
    
    const response = await authRequest('POST', '/contacts', contactData);
    console.log('✅ Contact creation passed:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Contact creation failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetContacts = async () => {
  try {
    console.log('🔍 Testing get contacts...');
    const response = await authRequest('GET', '/contacts');
    console.log('✅ Get contacts passed:', response.data.data.contacts.length, 'contacts found');
    return true;
  } catch (error) {
    console.error('❌ Get contacts failed:', error.response?.data || error.message);
    return false;
  }
};

const testCreateWellnessEntry = async () => {
  try {
    console.log('🔍 Testing wellness entry creation...');
    const wellnessData = {
      sleepData: {
        totalSleepHours: 8,
        sleepQuality: 'good'
      },
      mood: {
        score: 8,
        description: 'Feeling good today'
      },
      activityMetrics: {
        steps: 7500
      }
    };
    
    const response = await authRequest('POST', '/wellness', wellnessData);
    console.log('✅ Wellness entry creation passed:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Wellness entry creation failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetWellnessData = async () => {
  try {
    console.log('🔍 Testing get wellness data...');
    const response = await authRequest('GET', '/wellness');
    console.log('✅ Get wellness data passed:', response.data.data.wellnessData.length, 'entries found');
    return true;
  } catch (error) {
    console.error('❌ Get wellness data failed:', error.response?.data || error.message);
    return false;
  }
};

const testStartMonitoring = async () => {
  try {
    console.log('🔍 Testing monitoring session start...');
    const monitoringData = {
      deviceInfo: {
        deviceId: 'test-device-001',
        deviceType: 'webcam',
        location: 'Living Room'
      },
      aiAnalysis: {
        confidence: 0.85
      }
    };
    
    const response = await authRequest('POST', '/monitoring/start', monitoringData);
    console.log('✅ Monitoring session start passed:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Monitoring session start failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetMonitoringSessions = async () => {
  try {
    console.log('🔍 Testing get monitoring sessions...');
    const response = await authRequest('GET', '/monitoring');
    console.log('✅ Get monitoring sessions passed:', response.data.data.sessions.length, 'sessions found');
    return true;
  } catch (error) {
    console.error('❌ Get monitoring sessions failed:', error.response?.data || error.message);
    return false;
  }
};

const testCreateAlert = async () => {
  try {
    console.log('🔍 Testing alert creation...');
    const alertData = {
      alertType: 'wellness',
      severity: 'medium',
      title: 'Test Alert',
      description: 'This is a test alert for testing purposes',
      location: 'Home'
    };
    
    const response = await authRequest('POST', '/alerts', alertData);
    console.log('✅ Alert creation passed:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Alert creation failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetAlerts = async () => {
  try {
    console.log('🔍 Testing get alerts...');
    const response = await authRequest('GET', '/alerts');
    console.log('✅ Get alerts passed:', response.data.data.alerts.length, 'alerts found');
    return true;
  } catch (error) {
    console.error('❌ Get alerts failed:', error.response?.data || error.message);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting SafeGuard AI Backend API Tests');
  console.log('==========================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Get Current User', fn: testGetCurrentUser },
    { name: 'Create Contact', fn: testCreateContact },
    { name: 'Get Contacts', fn: testGetContacts },
    { name: 'Create Wellness Entry', fn: testCreateWellnessEntry },
    { name: 'Get Wellness Data', fn: testGetWellnessData },
    { name: 'Start Monitoring', fn: testStartMonitoring },
    { name: 'Get Monitoring Sessions', fn: testGetMonitoringSessions },
    { name: 'Create Alert', fn: testCreateAlert },
    { name: 'Get Alerts', fn: testGetAlerts }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ Test "${test.name}" crashed:`, error.message);
      failed++;
    }
    console.log('');
  }
  
  console.log('📊 Test Results');
  console.log('===============');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Your backend is working perfectly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testHealthCheck,
  testUserRegistration,
  testUserLogin
};
