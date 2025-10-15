// FINAL E2E TEST với Real Artifacts cho CTO Demo
// Test complete pipeline với sample CSV, image data, và full workflow

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
        
        console.log(`${response.ok ? '✅' : '❌'} ${method} ${endpoint}: ${response.status}`);
        
        return { success: response.ok, data, status: response.status };
    } catch (error) {
        console.log(`❌ ${method} ${endpoint}:`, error.message);
        return { success: false, error: error.message };
    }
}

async function logTestResult(testName, result) {
    console.log(`\n📋 ${testName}:`);
    if (result.success && result.data) {
        if (result.data.success !== false) {
            console.log('   ✅ SUCCESS');
            return true;
        } else {
            console.log('   ❌ FAILED:', result.data.error);
            return false;
        }
    } else {
        console.log('   ❌ API ERROR:', result.error || result.status);
        return false;
    }
}

async function finalE2ETest() {
    console.log('🚀 FINAL E2E TEST - CTO DEMO ARTIFACTS\n');
    
    const testResults = {
        passed: 0,
        failed: 0,
        artifacts: []
    };
    
    // Test 1: System Health Check
    console.log('=== SYSTEM HEALTH ===');
    let result = await testAPI('/health');
    if (await logTestResult('System Health Check', result)) {
        testResults.passed++;
        testResults.artifacts.push({
            test: 'Health Check',
            status: 'PASSED',
            evidence: result.data.services
        });
    } else {
        testResults.failed++;
    }
    
    // Test 2: Complete Vietnamese Numerology Processing
    console.log('\n=== VIETNAMESE NUMEROLOGY ===');
    const vietnameseNames = [
        { name: 'Nguyễn Văn An', birth_date: '1990-05-15' },
        { name: 'Trần Thị Minh Châu', birth_date: '1992-03-20' },
        { name: 'Lê Hoàng Đức', birth_date: '1988-12-03' }
    ];
    
    for (const candidate of vietnameseNames) {
        result = await testAPI('/api/numerology/calculate', 'POST', candidate);
        const testName = `Numerology: ${candidate.name}`;
        if (await logTestResult(testName, result)) {
            testResults.passed++;
            testResults.artifacts.push({
                test: testName,
                status: 'PASSED',
                evidence: {
                    original: result.data.calculation_details?.name_calculation?.original_name,
                    normalized: result.data.calculation_details?.name_calculation?.normalized_name,
                    life_path: result.data.data?.life_path_number,
                    meaning: result.data.data?.life_path_meaning
                }
            });
        } else {
            testResults.failed++;
        }
    }
    
    // Test 3: DISC Manual Input
    console.log('\n=== DISC MANUAL INPUT ===');
    const discCandidates = [
        { candidate_id: 'CAND-001', d_score: 8, i_score: 6, s_score: 5, c_score: 7 },
        { candidate_id: 'CAND-002', d_score: 5, i_score: 9, s_score: 6, c_score: 4 },
        { candidate_id: 'CAND-003', d_score: 6, i_score: 5, s_score: 8, c_score: 6 }
    ];
    
    for (const candidate of discCandidates) {
        result = await testAPI('/api/disc/manual-input', 'POST', candidate);
        const testName = `DISC Manual: ${candidate.candidate_id}`;
        if (await logTestResult(testName, result)) {
            testResults.passed++;
            testResults.artifacts.push({
                test: testName,
                status: 'PASSED',
                evidence: {
                    candidate_id: candidate.candidate_id,
                    primary_style: result.data.disc_profile?.primary_style,
                    scores: result.data.disc_scores
                }
            });
        } else {
            testResults.failed++;
        }
    }
    
    // Test 4: DISC CSV Processing
    console.log('\n=== DISC CSV PIPELINE ===');
    const csvData = 'Name,D,I,S,C\nNguyen Van An,8,6,7,5\nTran Thi Mai,5,9,6,4\nLe Hoang Duc,7,5,8,6';
    result = await testAPI('/api/disc/upload-csv', 'POST', {
        candidate_id: 'CSV-BATCH-001',
        csv_data: csvData,
        validation_rules: { min_score: 1, max_score: 10 }
    });
    if (await logTestResult('CSV Processing Pipeline', result)) {
        testResults.passed++;
        testResults.artifacts.push({
            test: 'CSV Processing',
            status: 'PASSED',
            evidence: {
                processed_count: result.data.processed_count,
                total_rows: result.data.total_rows,
                candidates: result.data.candidates?.length || 0
            }
        });
    } else {
        testResults.failed++;
    }
    
    // Test 5: Documented OCR Processing
    console.log('\n=== DOCUMENTED OCR PROCESSING ===');
    result = await testAPI('/api/disc/upload-ocr-image', 'POST', {
        candidate_id: 'OCR-TEST-001',
        image_base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA==',
        survey_format: 'standard'
    });
    if (await logTestResult('OCR Processing (Documented Stub)', result)) {
        testResults.passed++;
        testResults.artifacts.push({
            test: 'OCR Processing',
            status: 'PASSED',
            evidence: {
                extraction_method: result.data.extraction_method,
                confidence: result.data.confidence,
                production_notes: result.data.production_notes?.length || 0
            }
        });
    } else {
        testResults.failed++;
    }
    
    // Test 6: Service Testing
    console.log('\n=== SERVICE TESTING ===');
    const services = [
        { endpoint: '/api/numerology/test', name: 'Numerology Service' },
        { endpoint: '/api/disc/test', name: 'DISC Pipeline' }
    ];
    
    for (const service of services) {
        result = await testAPI(service.endpoint);
        if (await logTestResult(service.name + ' Test', result)) {
            testResults.passed++;
            testResults.artifacts.push({
                test: service.name,
                status: 'PASSED',
                evidence: result.data
            });
        } else {
            testResults.failed++;
        }
    }
    
    // Final Results
    console.log('\n' + '='.repeat(50));
    console.log('🎯 FINAL E2E TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`✅ Tests Passed: ${testResults.passed}`);
    console.log(`❌ Tests Failed: ${testResults.failed}`);
    console.log(`📊 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
    
    console.log('\n📋 TEST ARTIFACTS SUMMARY:');
    testResults.artifacts.forEach((artifact, index) => {
        console.log(`${index + 1}. ${artifact.test}: ${artifact.status}`);
    });
    
    console.log('\n🔥 CTO DEMO STATUS:');
    if (testResults.failed === 0) {
        console.log('✅ ALL SYSTEMS OPERATIONAL - READY FOR DEMO');
        console.log('✅ Vietnamese Unicode: Working');
        console.log('✅ Health Monitoring: Active');
        console.log('✅ DISC Pipeline: Complete');
        console.log('✅ OCR Integration: Documented');
    } else {
        console.log('⚠️  Some tests failed - needs attention before demo');
    }
    
    return testResults;
}

// Run the final test
finalE2ETest().then(results => {
    console.log('\n📊 Test completed. Artifacts logged for CTO review.');
}).catch(console.error);