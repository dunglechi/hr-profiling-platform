#!/usr/bin/env python3
import sys
import re

FORBIDDEN_PATTERNS = [
    r'SPRINT-\d+',
    r'DAY-\d+', 
    r'V\d+\.\d+',
    r'TEAM-\d+',
    r'TEMP|DRAFT|FINAL',
    r'\d{4}-\d{2}-\d{2}'
]

def validate_filename(filename):
    for pattern in FORBIDDEN_PATTERNS:
        if re.search(pattern, filename, re.IGNORECASE):
            print(f"X SDLC 4.7 Violation: {filename} contains forbidden pattern '{pattern}'")
            return False
    return True

if __name__ == "__main__":
    exit_code = 0
    for filename in sys.argv[1:]:
        if not validate_filename(filename):
            exit_code = 1
    sys.exit(exit_code)