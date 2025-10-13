const axios = require('axios');

// Test Numerology API
async function testNumerologyAPI() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🔮 Testing Numerology API Endpoints...\n');
  
  try {
    // Test health check first
    console.log('1️⃣ Testing health endpoint');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check passed');
    console.log(`💚 Status: ${healthResponse.data.status}\n`);

    // Test numerology quick-calculate
    console.log('2️⃣ Testing POST /api/numerology/quick-calculate');
    const testData = {
      fullName: 'Nguyễn Văn An',
      birthDate: '1990-05-15'
    };

    const numerologyResponse = await axios.post(`${baseURL}/api/numerology/quick-calculate`, testData);
    console.log('✅ Numerology calculation successful');
    console.log(`📊 Result:`, JSON.stringify(numerologyResponse.data, null, 2));
    
    // Check if the response has the expected structure
    const result = numerologyResponse.data.data;
    if (result && result.coreTraits) {
      console.log('✅ coreTraits found in response');
      console.log(`📋 coreTraits type:`, typeof result.coreTraits);
      console.log(`📋 coreTraits:`, result.coreTraits);
    } else {
      console.log('❌ coreTraits missing in response');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📋 Response status:', error.response.status);
      console.error('📋 Response data:', error.response.data);
    }
  }
}

// Run tests
testNumerologyAPI();