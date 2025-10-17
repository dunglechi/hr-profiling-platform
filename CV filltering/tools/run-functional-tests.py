import sys
import json
import requests

BASE = 'http://127.0.0.1:5000/api'

def post_json(path, body):
    url = BASE + path
    resp = requests.post(url, json=body, timeout=10)
    return resp


def get(path):
    url = BASE + path
    resp = requests.get(url, timeout=10)
    return resp


def main():
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

    if failures:
        print('\nFailures:')
        for f in failures:
            print(f)
        sys.exit(2)
    print('\nAll functional checks passed')

if __name__ == '__main__':
    main()
