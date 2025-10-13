// Simple test script for Numerology API
fetch('http://localhost:5000/api/numerology/quick-calculate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullName: 'Nguyễn Văn An',
    birthDate: '1990-05-15'
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ API Response:', data);
  
  if (data.data && data.data.coreTraits) {
    console.log('✅ coreTraits structure:', data.data.coreTraits);
    console.log('✅ coreTraits.positive:', data.data.coreTraits.positive);
    console.log('✅ coreTraits.negative:', data.data.coreTraits.negative);
    console.log('✅ coreTraits.keywords:', data.data.coreTraits.keywords);
  }
})
.catch(error => {
  console.error('❌ API Error:', error);
});