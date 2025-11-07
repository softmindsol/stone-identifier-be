#!/usr/bin/env node

/**
 * Authentication Test Script
 * Tests the complete authentication flow including registration, login, and protected routes
 */

const API_BASE = 'http://localhost:3000/api/v1';

// Test data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`, // Unique email
  password: 'password123'
};

let accessToken = '';

async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...options.headers
    },
    ...options
  });

  const data = await response.json();
  return { response, data };
}

async function testRegistration() {
  console.log('🔄 Testing user registration...');
  
  try {
    const { response, data } = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testUser)
    });

    if (response.ok) {
      console.log('✅ Registration successful');
      console.log(`📧 User: ${data.user.email}`);
      console.log(`🔑 Token received: ${data.accessToken ? 'Yes' : 'No'}`);
      
      if (data.accessToken) {
        accessToken = data.accessToken;
      }
      return true;
    } else {
      console.log('❌ Registration failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔄 Testing user login...');
  
  try {
    const { response, data } = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    if (response.ok) {
      console.log('✅ Login successful');
      console.log(`📧 User: ${data.user.email}`);
      console.log(`🔑 Token received: ${data.accessToken ? 'Yes' : 'No'}`);
      
      if (data.accessToken) {
        accessToken = data.accessToken;
      }
      return true;
    } else {
      console.log('❌ Login failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

async function testProtectedRoute() {
  console.log('\n🔄 Testing protected route (auth/test)...');
  
  try {
    const { response, data } = await makeRequest('/auth/test');

    if (response.ok) {
      console.log('✅ Protected route access successful');
      console.log(`👤 User ID: ${data.user.id}`);
      console.log(`📧 User Email: ${data.user.email}`);
      console.log(`⏰ Timestamp: ${data.timestamp}`);
      return true;
    } else {
      console.log('❌ Protected route failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Protected route error:', error.message);
    return false;
  }
}

async function testInvalidToken() {
  console.log('\n🔄 Testing invalid token...');
  
  const originalToken = accessToken;
  accessToken = 'invalid-token';
  
  try {
    const { response, data } = await makeRequest('/auth/test');

    if (!response.ok && response.status === 401) {
      console.log('✅ Invalid token properly rejected');
      console.log(`🚫 Error: ${data.message}`);
      accessToken = originalToken; // Restore token
      return true;
    } else {
      console.log('❌ Invalid token should have been rejected');
      accessToken = originalToken; // Restore token
      return false;
    }
  } catch (error) {
    console.log('❌ Invalid token test error:', error.message);
    accessToken = originalToken; // Restore token
    return false;
  }
}

async function testNoToken() {
  console.log('\n🔄 Testing no token...');
  
  const originalToken = accessToken;
  accessToken = '';
  
  try {
    const { response, data } = await makeRequest('/auth/test');

    if (!response.ok && response.status === 401) {
      console.log('✅ No token properly rejected');
      console.log(`🚫 Error: ${data.message}`);
      accessToken = originalToken; // Restore token
      return true;
    } else {
      console.log('❌ No token should have been rejected');
      accessToken = originalToken; // Restore token
      return false;
    }
  } catch (error) {
    console.log('❌ No token test error:', error.message);
    accessToken = originalToken; // Restore token
    return false;
  }
}

async function testUserProfile() {
  console.log('\n🔄 Testing user profile endpoint...');
  
  try {
    const { response, data } = await makeRequest('/auth/profile');

    if (response.ok) {
      console.log('✅ Profile access successful');
      console.log(`👤 Name: ${data.name}`);
      console.log(`📧 Email: ${data.email}`);
      console.log(`🔐 Provider: ${data.provider}`);
      return true;
    } else {
      console.log('❌ Profile access failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Profile access error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Authentication Tests\n');
  console.log('================================');

  const results = {
    registration: await testRegistration(),
    login: await testLogin(),
    protectedRoute: await testProtectedRoute(),
    invalidToken: await testInvalidToken(),
    noToken: await testNoToken(),
    profile: await testUserProfile(),
  };

  console.log('\n================================');
  console.log('📊 Test Results:');
  console.log('================================');

  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'PASSED' : 'FAILED';
    console.log(`${icon} ${test.toUpperCase()}: ${status}`);
  });

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log('\n================================');
  console.log(`📈 Summary: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All authentication tests passed!');
    console.log('✨ JWT Authentication is fully functional!');
  } else {
    console.log('⚠️  Some tests failed. Check server logs for details.');
  }

  console.log('================================\n');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };