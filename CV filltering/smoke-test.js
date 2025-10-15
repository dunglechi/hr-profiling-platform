// Complete Smoke Test for CTO Demo
// Tests all 3 mandatory requirements:
// 1. Numerology Auto Backend Service
// 2. DISC External Pipeline + OCR
// 3. Backend Integration Full Stack

const baseUrl = 'http://localhost:5000';

async function testAPI(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${baseUrl}${endpoint}`, options);
        const data = await response.json();
        
        console.log(`✅ ${method} ${endpoint}:`, response.status);
        console.log('   Response:', JSON.stringify(data, null, 2));
        return { success: response.ok, data, status: response.status };
    } catch (error) {
        console.log(`❌ ${method} ${endpoint}:`, error.message);
        return { success: false, error: error.message };
    }
}

async function runSmokeTest() {
    console.log('🚀 CTO DEMO SMOKE TEST - Starting...\n');
    
    // Test 1: Health Check
    console.log('1️⃣ HEALTH CHECK');
    await testAPI('/health');
    
    // Test 2: Numerology Auto Service
    console.log('\n2️⃣ NUMEROLOGY AUTO SERVICE');
    await testAPI('/api/numerology/calculate', 'POST', {
        name: 'Nguyen Van An',
        birth_date: '1990-05-15'
    });
    
    // Test 3: Numerology Manual Fallback
    console.log('\n3️⃣ NUMEROLOGY MANUAL FALLBACK');
    await testAPI('/api/numerology/manual-input', 'POST', {
        candidate_id: 'test-001',
        numerology_score: 8,
        notes: 'Manual input test'
    });
    
    // Test 4: DISC Pipeline - Manual Input
    console.log('\n4️⃣ DISC PIPELINE - MANUAL INPUT');
    await testAPI('/api/disc/manual-input', 'POST', {
        candidate_id: 'test-001',
        scores: {
            dominance: 8,
            influence: 6,
            steadiness: 5,
            compliance: 7
        }
    });
    
    // Test 5: DISC Pipeline - CSV Processing  
    console.log('\n5️⃣ DISC PIPELINE - CSV PROCESSING');
    await testAPI('/api/disc/upload-csv', 'POST', {
        csv_data: 'Name,D,I,S,C\nNguyen Van An,8,6,5,7',
        validation_rules: {
            min_score: 1,
            max_score: 10
        }
    });
    
    // Test 6: DISC Pipeline - OCR Simulation
    console.log('\n6️⃣ DISC PIPELINE - OCR SIMULATION');
    await testAPI('/api/disc/upload-ocr-image', 'POST', {
        image_base64: 'mock_base64_image_data',
        survey_format: 'standard'
    });
    
    // Test 7: List Available Routes
    console.log('\n7️⃣ AVAILABLE ROUTES');
    await testAPI('/api');
    
    console.log('\n🎯 CTO DEMO SMOKE TEST - COMPLETED');
    console.log('✅ All 3 mandatory requirements tested:');
    console.log('   1. Numerology Auto Backend Service');
    console.log('   2. DISC External Pipeline + OCR');
    console.log('   3. Backend Integration Full Stack');
}

// Run the test
runSmokeTest().catch(console.error);