#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Test Runner for CV Filtering Backend
Provides easy commands to run all test suites with coverage reporting.
"""

import sys
import os
import subprocess
from pathlib import Path

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


def print_header(text):
    """Print formatted header."""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}  {text}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")


def run_command(cmd, description):
    """Run a command and return exit code."""
    print(f"{Colors.OKCYAN}➜ {description}{Colors.ENDC}")
    print(f"{Colors.OKBLUE}  Command: {' '.join(cmd)}{Colors.ENDC}\n")

    result = subprocess.run(cmd, cwd=Path(__file__).parent)

    if result.returncode == 0:
        print(f"{Colors.OKGREEN}✅ {description} - PASSED{Colors.ENDC}\n")
    else:
        print(f"{Colors.FAIL}❌ {description} - FAILED{Colors.ENDC}\n")

    return result.returncode


def run_all_tests():
    """Run all test suites."""
    print_header("Running All Test Suites")

    cmd = [
        sys.executable, "-m", "pytest",
        "backend/src/__tests__/",
        "-v",
        "--tb=short"
    ]

    return run_command(cmd, "All Tests")


def run_with_coverage():
    """Run tests with coverage report."""
    print_header("Running Tests with Coverage Report")

    cmd = [
        sys.executable, "-m", "pytest",
        "backend/src/__tests__/",
        "-v",
        "--cov=backend/src/services",
        "--cov=backend/src/routes",
        "--cov-report=term-missing",
        "--cov-report=html"
    ]

    exit_code = run_command(cmd, "Tests with Coverage")

    if exit_code == 0:
        print(f"{Colors.OKGREEN}📊 Coverage report generated in: htmlcov/index.html{Colors.ENDC}")

    return exit_code


def run_batch_tests():
    """Run only batch insert tests."""
    print_header("Running Batch Insert Tests")

    cmd = [
        sys.executable, "-m", "pytest",
        "backend/src/__tests__/test_database_service_batch.py",
        "-v"
    ]

    return run_command(cmd, "Batch Insert Tests")


def run_disc_pipeline_tests():
    """Run DISC pipeline comprehensive tests."""
    print_header("Running DISC Pipeline Comprehensive Tests")

    cmd = [
        sys.executable, "-m", "pytest",
        "backend/src/__tests__/test_disc_pipeline_comprehensive.py",
        "-v"
    ]

    return run_command(cmd, "DISC Pipeline Tests")


def run_integration_tests():
    """Run integration tests."""
    print_header("Running Integration Tests")

    cmd = [
        sys.executable, "-m", "pytest",
        "backend/src/__tests__/test_disc_routes_integration.py",
        "-v"
    ]

    return run_command(cmd, "Integration Tests")


def run_critical_bug_tests():
    """Run tests for critical bug fixes."""
    print_header("Verifying Critical Bug Fixes")

    tests = [
        "backend/src/__tests__/test_database_service_batch.py::TestSupabaseResponseParsing::test_get_recent_analyses_response_parsing",
        "backend/src/__tests__/test_disc_pipeline_comprehensive.py::TestCSVHeaderValidation::test_empty_csv_file",
        "backend/src/__tests__/test_disc_routes_integration.py::TestBatchInsertPerformance::test_large_csv_batch_performance"
    ]

    cmd = [
        sys.executable, "-m", "pytest"
    ] + tests + ["-v"]

    return run_command(cmd, "Critical Bug Fix Verification")


def run_quick_tests():
    """Run quick smoke tests."""
    print_header("Running Quick Smoke Tests")

    cmd = [
        sys.executable, "-m", "pytest",
        "backend/src/__tests__/",
        "-v",
        "-k", "test_batch_insert_success or test_manual_input_valid_scores or test_csv_upload_endpoint_success",
        "--tb=line"
    ]

    return run_command(cmd, "Quick Smoke Tests")


def show_menu():
    """Display test menu."""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}  CV Filtering Backend - Test Runner{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")

    print(f"{Colors.OKBLUE}Select test suite to run:{Colors.ENDC}\n")
    print("  1. Run All Tests")
    print("  2. Run with Coverage Report")
    print("  3. Run Batch Insert Tests Only")
    print("  4. Run DISC Pipeline Tests Only")
    print("  5. Run Integration Tests Only")
    print("  6. Verify Critical Bug Fixes")
    print("  7. Run Quick Smoke Tests")
    print("  8. Exit")
    print()


def main():
    """Main entry point."""
    if len(sys.argv) > 1:
        # Command-line arguments
        arg = sys.argv[1].lower()

        if arg in ['all', 'a']:
            sys.exit(run_all_tests())
        elif arg in ['coverage', 'cov', 'c']:
            sys.exit(run_with_coverage())
        elif arg in ['batch', 'b']:
            sys.exit(run_batch_tests())
        elif arg in ['pipeline', 'disc', 'p']:
            sys.exit(run_disc_pipeline_tests())
        elif arg in ['integration', 'int', 'i']:
            sys.exit(run_integration_tests())
        elif arg in ['critical', 'bugs', 'cr']:
            sys.exit(run_critical_bug_tests())
        elif arg in ['quick', 'smoke', 'q']:
            sys.exit(run_quick_tests())
        else:
            print(f"{Colors.FAIL}Unknown argument: {arg}{Colors.ENDC}")
            print(f"\nUsage: python run_tests.py [all|coverage|batch|pipeline|integration|critical|quick]")
            sys.exit(1)

    # Interactive menu
    while True:
        show_menu()

        try:
            choice = input(f"{Colors.OKCYAN}Enter your choice (1-8): {Colors.ENDC}").strip()

            if choice == '1':
                run_all_tests()
            elif choice == '2':
                run_with_coverage()
            elif choice == '3':
                run_batch_tests()
            elif choice == '4':
                run_disc_pipeline_tests()
            elif choice == '5':
                run_integration_tests()
            elif choice == '6':
                run_critical_bug_tests()
            elif choice == '7':
                run_quick_tests()
            elif choice == '8':
                print(f"\n{Colors.OKGREEN}Goodbye!{Colors.ENDC}\n")
                sys.exit(0)
            else:
                print(f"{Colors.WARNING}Invalid choice. Please enter 1-8.{Colors.ENDC}")

            input(f"\n{Colors.OKCYAN}Press Enter to continue...{Colors.ENDC}")

        except KeyboardInterrupt:
            print(f"\n\n{Colors.OKGREEN}Goodbye!{Colors.ENDC}\n")
            sys.exit(0)
        except Exception as e:
            print(f"{Colors.FAIL}Error: {e}{Colors.ENDC}")


if __name__ == "__main__":
    main()
