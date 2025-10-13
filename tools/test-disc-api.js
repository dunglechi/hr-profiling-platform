// Quick test for DISC API
const fetch = require('node-fetch');

async function testDISCAPI() {
  try {
    console.log('🧪 Testing DISC API...');
    
    // Test 1: Health check
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test 2: DISC questions
    console.log('\n2. Testing DISC questions endpoint...');
    const questionsResponse = await fetch('http://localhost:5000/api/disc/questions');
    const questionsData = await questionsResponse.json();
    console.log('✅ DISC Questions count:', questionsData?.data?.totalQuestions);
    console.log('✅ First question:', questionsData?.data?.questions?.[0]);
    
    // Test 3: Sample DISC calculation (if we have questions)
    if (questionsData?.data?.questions?.length > 0) {
      console.log('\n3. Testing DISC submission...');
      
      // Create sample responses
      const sampleResponses = questionsData.data.questions.map((q, index) => ({
        questionId: q.id,
        mostLike: index % 3 === 0,
        leastLike: index % 3 === 1,
        neutral: index % 3 === 2
      }));
      
      console.log('📝 Sample responses created:', sampleResponses.length);
      console.log('✅ Ready for DISC assessment submission');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDISCAPI();