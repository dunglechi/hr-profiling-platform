import sys
import json
import requests
import os

BASE = 'http://127.0.0.1:5000/api'

def post_json(path, body):
    url = BASE + path
    resp = requests.post(url, json=body, timeout=10)
    return resp


def get(path):
    url = BASE + path
    resp = requests.get(url, timeout=10)
    return resp


def run_numerology_tests(base_url):
    failures = []

    # 1) numerology calculate (correct)
    body_full = {"candidate_id": "test-123", "name": "Nguyễn Văn A", "birth_date": "1990-01-01"}
    r1 = post_json('/numerology/calculate', body_full)
    print('/numerology/calculate (full) ->', r1.status_code)
    if r1.status_code >= 300:
        failures.append(('numerology_full', r1.status_code, r1.text))

    # 2) numerology calculate (missing field) - expect 4xx
    body_missing = {"candidate_id": "test-124", "birth_date": "1990-01-01"}
    r2 = post_json('/numerology/calculate', body_missing)
    print('/numerology/calculate (missing) ->', r2.status_code)
    if not (400 <= r2.status_code < 500):
        failures.append(('numerology_missing_expected_4xx', r2.status_code, r2.text))

    return failures


def run_disc_tests(base_url):
    failures = []

    # 3) disc manual-input
    body_disc = {"candidate_id": "disc-001", "d_score": 8, "i_score": 6, "s_score": 5, "c_score": 7}
    r3 = post_json('/disc/manual-input', body_disc)
    print('/disc/manual-input ->', r3.status_code)
    if r3.status_code >= 300:
        failures.append(('disc_manual', r3.status_code, r3.text))

    # 4) disc test
    r4 = get('/disc/test')
    print('/disc/test ->', r4.status_code)
    if r4.status_code >= 300:
        failures.append(('disc_test', r4.status_code, r4.text))

    return failures


def run_cv_parsing_tests(base_url):
    print("\n--- Running CV Parsing Tests ---")
    url = f"{base_url}/api/parse-cv"
    file_path = 'tests/sample_cv.pdf'
    
    try:
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f, 'application/pdf')}
            response = requests.post(url, files=files)
            
            print(f"POST {url} with {os.path.basename(file_path)}")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("Response JSON:", json.dumps(data, indent=2))
                if data.get('personalInfo', {}).get('name') and data['source']['aiUsed'] is not None:
                    print("CV Parsing Test: PASSED")
                    return True
                else:
                    print("CV Parsing Test: FAILED - Missing expected data")
                    return False
            else:
                print("CV Parsing Test: FAILED - Non-200 status code")
                return False
    except Exception as e:
        print(f"CV Parsing Test: FAILED - {e}")
        return False


def main():
    base_url = BASE
    failures = []

    failures.extend(run_numerology_tests(base_url))
    failures.extend(run_disc_tests(base_url))
    cv_parsing_result = run_cv_parsing_tests(base_url)

    if failures:
        print('\nFailures:')
        for f in failures:
            print(f)
        sys.exit(2)
    print('\nAll functional checks passed')

if __name__ == '__main__':
    main()
