const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3000/users/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('Backend login response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
  }
}

testLogin();
