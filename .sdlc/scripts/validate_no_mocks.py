#!/usr/bin/env python3
import sys
import re

MOCK_PATTERNS = [
    r'jest\.mock\(',
    r'sinon\.mock\(',
    r'@Mock',
    r'mock\(',
    r'MockRequest',
    r'MockResponse'
]

def validate_no_mocks(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        for pattern in MOCK_PATTERNS:
            if re.search(pattern, content, re.IGNORECASE):
                print(f"X SDLC 4.7 Zero Mock Policy Violation: {filepath} contains '{pattern}'")
                return False
        return True
    except Exception:
        return True

if __name__ == "__main__":
    exit_code = 0
    for filepath in sys.argv[1:]:
        if not validate_no_mocks(filepath):
            exit_code = 1
    sys.exit(exit_code)