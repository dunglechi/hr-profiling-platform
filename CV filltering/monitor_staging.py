#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Staging Environment Monitoring Script
Monitors health, performance, and error rates of staging deployment
"""

import sys
import os
import time
import requests
from datetime import datetime, timedelta
from collections import defaultdict

class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


class StagingMonitor:
    """Monitor staging environment health and performance."""

    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.start_time = datetime.now()
        self.metrics = {
            "health_checks": {"success": 0, "failed": 0},
            "api_calls": {"success": 0, "failed": 0},
            "response_times": [],
            "errors": []
        }

    def print_header(self, text):
        """Print formatted header."""
        print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
        print(f"{Colors.HEADER}{Colors.BOLD}  {text}{Colors.ENDC}")
        print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")

    def health_check(self):
        """Check application health."""
        try:
            start = time.time()
            response = requests.get(f"{self.base_url}/health", timeout=10)
            elapsed = (time.time() - start) * 1000  # ms

            self.metrics["response_times"].append(elapsed)

            if response.status_code == 200:
                self.metrics["health_checks"]["success"] += 1
                return True, elapsed, response.json()
            else:
                self.metrics["health_checks"]["failed"] += 1
                return False, elapsed, {"error": f"Status {response.status_code}"}

        except requests.exceptions.Timeout:
            self.metrics["health_checks"]["failed"] += 1
            self.metrics["errors"].append(("Health Check", "Timeout after 10s"))
            return False, 10000, {"error": "Timeout"}
        except Exception as e:
            self.metrics["health_checks"]["failed"] += 1
            self.metrics["errors"].append(("Health Check", str(e)))
            return False, 0, {"error": str(e)}

    def test_disc_api(self):
        """Test DISC API endpoints."""
        try:
            # Test GET /api/disc/test
            start = time.time()
            response = requests.get(f"{self.base_url}/api/disc/test", timeout=10)
            elapsed = (time.time() - start) * 1000

            self.metrics["response_times"].append(elapsed)

            if response.status_code == 200:
                self.metrics["api_calls"]["success"] += 1
                return True, elapsed
            else:
                self.metrics["api_calls"]["failed"] += 1
                return False, elapsed

        except Exception as e:
            self.metrics["api_calls"]["failed"] += 1
            self.metrics["errors"].append(("DISC API", str(e)))
            return False, 0

    def print_metrics_dashboard(self):
        """Print real-time metrics dashboard."""
        os.system('cls' if os.name == 'nt' else 'clear')

        print(f"{Colors.HEADER}{Colors.BOLD}")
        print("╔════════════════════════════════════════════════════════╗")
        print("║                                                        ║")
        print("║         STAGING ENVIRONMENT MONITOR                    ║")
        print("║         Real-time Health Dashboard                     ║")
        print("║                                                        ║")
        print("╚════════════════════════════════════════════════════════╝")
        print(f"{Colors.ENDC}\n")

        # Uptime
        uptime = datetime.now() - self.start_time
        print(f"{Colors.OKBLUE}Monitoring Duration:{Colors.ENDC} {uptime}")
        print(f"{Colors.OKBLUE}Base URL:{Colors.ENDC} {self.base_url}")
        print(f"{Colors.OKBLUE}Last Check:{Colors.ENDC} {datetime.now().strftime('%H:%M:%S')}\n")

        # Health Check Status
        total_health = self.metrics["health_checks"]["success"] + self.metrics["health_checks"]["failed"]
        if total_health > 0:
            health_rate = (self.metrics["health_checks"]["success"] / total_health) * 100
            health_color = Colors.OKGREEN if health_rate >= 95 else (Colors.WARNING if health_rate >= 80 else Colors.FAIL)

            print(f"{Colors.BOLD}Health Checks:{Colors.ENDC}")
            print(f"  Success: {Colors.OKGREEN}{self.metrics['health_checks']['success']}{Colors.ENDC}")
            print(f"  Failed:  {Colors.FAIL}{self.metrics['health_checks']['failed']}{Colors.ENDC}")
            print(f"  Rate:    {health_color}{health_rate:.1f}%{Colors.ENDC}\n")

        # API Call Status
        total_api = self.metrics["api_calls"]["success"] + self.metrics["api_calls"]["failed"]
        if total_api > 0:
            api_rate = (self.metrics["api_calls"]["success"] / total_api) * 100
            api_color = Colors.OKGREEN if api_rate >= 95 else (Colors.WARNING if api_rate >= 80 else Colors.FAIL)

            print(f"{Colors.BOLD}API Calls:{Colors.ENDC}")
            print(f"  Success: {Colors.OKGREEN}{self.metrics['api_calls']['success']}{Colors.ENDC}")
            print(f"  Failed:  {Colors.FAIL}{self.metrics['api_calls']['failed']}{Colors.ENDC}")
            print(f"  Rate:    {api_color}{api_rate:.1f}%{Colors.ENDC}\n")

        # Response Times
        if self.metrics["response_times"]:
            avg_time = sum(self.metrics["response_times"]) / len(self.metrics["response_times"])
            min_time = min(self.metrics["response_times"])
            max_time = max(self.metrics["response_times"])

            time_color = Colors.OKGREEN if avg_time < 200 else (Colors.WARNING if avg_time < 500 else Colors.FAIL)

            print(f"{Colors.BOLD}Response Times:{Colors.ENDC}")
            print(f"  Average: {time_color}{avg_time:.0f}ms{Colors.ENDC}")
            print(f"  Min:     {Colors.OKGREEN}{min_time:.0f}ms{Colors.ENDC}")
            print(f"  Max:     {Colors.WARNING}{max_time:.0f}ms{Colors.ENDC}\n")

        # Recent Errors
        if self.metrics["errors"]:
            print(f"{Colors.FAIL}{Colors.BOLD}Recent Errors ({len(self.metrics['errors'])}):{Colors.ENDC}")
            for endpoint, error in self.metrics["errors"][-5:]:  # Last 5 errors
                print(f"  • {endpoint}: {error}")
            print()

        # Status Indicator
        if total_health > 0:
            if health_rate >= 95 and avg_time < 500:
                print(f"{Colors.OKGREEN}{Colors.BOLD}Status: HEALTHY ✅{Colors.ENDC}")
            elif health_rate >= 80:
                print(f"{Colors.WARNING}{Colors.BOLD}Status: DEGRADED ⚠️{Colors.ENDC}")
            else:
                print(f"{Colors.FAIL}{Colors.BOLD}Status: UNHEALTHY ❌{Colors.ENDC}")

        print(f"\n{Colors.OKCYAN}Press Ctrl+C to stop monitoring...{Colors.ENDC}")

    def continuous_monitor(self, interval=30):
        """Continuously monitor staging environment."""
        print(f"{Colors.OKCYAN}Starting continuous monitoring (interval: {interval}s)...{Colors.ENDC}\n")

        try:
            while True:
                # Run health check
                healthy, elapsed, data = self.health_check()

                # Test API endpoints
                api_ok, api_time = self.test_disc_api()

                # Update dashboard
                self.print_metrics_dashboard()

                # Wait for next check
                time.sleep(interval)

        except KeyboardInterrupt:
            print(f"\n\n{Colors.WARNING}Monitoring stopped by user{Colors.ENDC}")
            self.print_final_report()

    def single_check(self):
        """Run single health check."""
        self.print_header("Single Health Check")

        # Health endpoint
        print(f"{Colors.OKBLUE}Checking /health endpoint...{Colors.ENDC}")
        healthy, elapsed, data = self.health_check()

        if healthy:
            print(f"{Colors.OKGREEN}✅ Health check passed ({elapsed:.0f}ms){Colors.ENDC}")
            print(f"{Colors.OKCYAN}Response:{Colors.ENDC}")
            import json
            print(json.dumps(data, indent=2))
        else:
            print(f"{Colors.FAIL}❌ Health check failed{Colors.ENDC}")
            print(f"{Colors.FAIL}Error: {data.get('error')}{Colors.ENDC}")

        # DISC API endpoint
        print(f"\n{Colors.OKBLUE}Checking /api/disc/test endpoint...{Colors.ENDC}")
        api_ok, api_time = self.test_disc_api()

        if api_ok:
            print(f"{Colors.OKGREEN}✅ API test passed ({api_time:.0f}ms){Colors.ENDC}")
        else:
            print(f"{Colors.FAIL}❌ API test failed{Colors.ENDC}")

        # Summary
        print(f"\n{Colors.BOLD}Summary:{Colors.ENDC}")
        if healthy and api_ok:
            print(f"{Colors.OKGREEN}All checks passed ✅{Colors.ENDC}")
        else:
            print(f"{Colors.FAIL}Some checks failed ❌{Colors.ENDC}")

    def print_final_report(self):
        """Print final monitoring report."""
        self.print_header("Monitoring Summary Report")

        duration = datetime.now() - self.start_time
        print(f"Monitoring Duration: {duration}")
        print(f"Total Checks: {self.metrics['health_checks']['success'] + self.metrics['health_checks']['failed']}")

        if self.metrics["response_times"]:
            avg_time = sum(self.metrics["response_times"]) / len(self.metrics["response_times"])
            print(f"Average Response Time: {avg_time:.0f}ms")

        total_health = self.metrics["health_checks"]["success"] + self.metrics["health_checks"]["failed"]
        if total_health > 0:
            health_rate = (self.metrics["health_checks"]["success"] / total_health) * 100
            print(f"Health Check Success Rate: {health_rate:.1f}%")

        if self.metrics["errors"]:
            print(f"\nTotal Errors: {len(self.metrics['errors'])}")

        # Save report
        report_file = f"monitoring_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(report_file, 'w') as f:
            f.write(f"Staging Environment Monitoring Report\n")
            f.write(f"Generated: {datetime.now()}\n\n")
            f.write(f"Duration: {duration}\n")
            f.write(f"Health Checks: {self.metrics['health_checks']}\n")
            f.write(f"API Calls: {self.metrics['api_calls']}\n")
            if self.metrics["response_times"]:
                f.write(f"Avg Response Time: {avg_time:.0f}ms\n")
            if self.metrics["errors"]:
                f.write(f"\nErrors:\n")
                for endpoint, error in self.metrics["errors"]:
                    f.write(f"  - {endpoint}: {error}\n")

        print(f"\n{Colors.OKCYAN}Report saved: {report_file}{Colors.ENDC}")


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Monitor CV Filtering Backend Staging Environment"
    )
    parser.add_argument(
        '--url',
        default='http://localhost:5000',
        help='Base URL of staging environment'
    )
    parser.add_argument(
        '--interval',
        type=int,
        default=30,
        help='Check interval in seconds (default: 30)'
    )
    parser.add_argument(
        '--single',
        action='store_true',
        help='Run single check instead of continuous monitoring'
    )

    args = parser.parse_args()

    monitor = StagingMonitor(base_url=args.url)

    if args.single:
        monitor.single_check()
    else:
        monitor.continuous_monitor(interval=args.interval)

    return 0


if __name__ == "__main__":
    sys.exit(main())
