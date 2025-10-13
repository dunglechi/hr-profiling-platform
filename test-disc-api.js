const axios = require('axios');

// Test DISC API endpoints
async function testDISCAPI() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing DISC API Endpoints...\n');
  
  try {
    // Test 1: Get DISC questions
    console.log('1️⃣ Testing GET /api/disc/questions');
    const questionsResponse = await axios.get(`${baseURL}/api/disc/questions`);
    console.log('✅ Questions endpoint working');
    console.log(`📊 Total questions: ${questionsResponse.data.data.questions.length}`);
    
    // Sample questions
    const questions = questionsResponse.data.data.questions.slice(0, 5);
    
    // Test 2: Create mock responses
    console.log('\n2️⃣ Creating mock DISC responses');
    const mockResponses = questions.map((q, index) => ({
      questionId: q.id,
      response: index % 3 === 0 ? 'mostLike' : index % 3 === 1 ? 'neutral' : 'leastLike'
    }));
    
    console.log('✅ Mock responses created');
    console.log(`📝 Sample responses: ${mockResponses.length}`);
    
    // Test 3: Try to submit (will fail without valid assessmentId, but tests the endpoint)
    console.log('\n3️⃣ Testing POST /api/disc/submit (validation test)');
    try {
      await axios.post(`${baseURL}/api/disc/submit`, {
        assessmentId: 'test-assessment-id',
        responses: mockResponses
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Submit endpoint working (expected 404 for invalid assessment ID)');
        console.log(`📋 Response: ${error.response.data.error}`);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test 4: Health check
    console.log('\n4️⃣ Testing health endpoint');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check passed');
    console.log(`💚 Status: ${healthResponse.data.status}`);
    
    console.log('\n🎉 All DISC API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📋 Response data:', error.response.data);
    }
  }
}

// Run tests
testDISCAPI();