#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Quick verification script for all bug fixes.
Run this to verify all fixes are working correctly.
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import and run verification
from src.__tests__.test_fixes_verification import run_verification

if __name__ == "__main__":
    sys.exit(run_verification())
