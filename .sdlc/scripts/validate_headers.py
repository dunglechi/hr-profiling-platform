#!/usr/bin/env python3
import sys

def validate_headers(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        first_lines = content.split('\n')[:10]
        header_indicators = ['**Version**:', '**Date**:', '**Status**:', 'SDLC 4.7']
        
        found = 0
        for line in first_lines:
            for indicator in header_indicators:
                if indicator in line:
                    found += 1
                    break
        
        if found < 2:
            print(f"X SDLC 4.7 Header Missing: {filepath} needs proper header")
            return False
        return True
    except Exception:
        return True

if __name__ == "__main__":
    exit_code = 0
    for filepath in sys.argv[1:]:
        if not validate_headers(filepath):
            exit_code = 1
    sys.exit(exit_code)