const axios = require('axios');

// Quick test for Numerology API
async function quickTestNumerology() {
  try {
    console.log('🔮 Testing Numerology API quick-calculate...');
    
    const response = await axios.post('http://localhost:5000/api/numerology/quick-calculate', {
      fullName: 'Nguyễn Văn An',
      birthDate: '1990-05-15'
    });
    
    console.log('✅ Success!');
    console.log('📋 coreTraits structure:', JSON.stringify(response.data.data.coreTraits, null, 2));
    console.log('📋 careerGuidance structure:', JSON.stringify(response.data.data.careerGuidance, null, 2));
    console.log('📋 relationships structure:', JSON.stringify(response.data.data.relationships, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📋 Response:', error.response.status, error.response.data);
    }
  }
}

quickTestNumerology();