#!/usr/bin/env python3
"""
HR Platform Performance Monitor - SDLC 4.7
Real-time performance monitoring for HR assessment platform
Version: 4.7.0
"""

import time
import psutil
import requests
import json
import asyncio
import aiohttp
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

class HRPlatformMonitor:
    def __init__(self):
        self.metrics = {
            'api_performance': {},
            'system_resources': {},
            'database_performance': {},
            'assessment_accuracy': {},
            'user_experience': {}
        }
        
        # Performance targets from SDLC 4.7
        self.targets = {
            'api_response_time': 50,  # ms
            'cpu_usage': 80,          # percentage
            'memory_usage': 80,       # percentage
            'assessment_accuracy': 95, # percentage
            'uptime': 99.9            # percentage
        }
    
    async def monitor_api_performance(self):
        """Monitor API endpoints for <50ms performance target"""
        print("🚀 Monitoring API Performance...")
        
        api_endpoints = [
            {'url': 'http://localhost:3000/api/health', 'name': 'Health Check'},
            {'url': 'http://localhost:3000/api/assessments', 'name': 'Assessments API'},
            {'url': 'http://localhost:3000/api/candidates', 'name': 'Candidates API'},
            {'url': 'http://localhost:3000/api/reports', 'name': 'Reports API'}
        ]
        
        async with aiohttp.ClientSession() as session:
            for endpoint in api_endpoints:
                try:
                    start_time = time.time()
                    async with session.get(endpoint['url'], timeout=5) as response:
                        response_time = (time.time() - start_time) * 1000  # Convert to ms
                        
                        self.metrics['api_performance'][endpoint['name']] = {
                            'response_time_ms': round(response_time, 2),
                            'status_code': response.status,
                            'target_met': response_time < self.targets['api_response_time'],
                            'timestamp': datetime.now().isoformat()
                        }
                        
                        status = "✅" if response_time < self.targets['api_response_time'] else "❌"
                        print(f"  {status} {endpoint['name']}: {response_time:.2f}ms (Target: <{self.targets['api_response_time']}ms)")
                
                except Exception as e:
                    self.metrics['api_performance'][endpoint['name']] = {
                        'response_time_ms': None,
                        'status_code': None,
                        'error': str(e),
                        'target_met': False,
                        'timestamp': datetime.now().isoformat()
                    }
                    print(f"  ❌ {endpoint['name']}: Error - {e}")
    
    def monitor_system_resources(self):
        """Monitor system CPU, memory, and disk usage"""
        print("💻 Monitoring System Resources...")
        
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_status = "✅" if cpu_percent < self.targets['cpu_usage'] else "❌"
        
        # Memory usage
        memory = psutil.virtual_memory()
        memory_status = "✅" if memory.percent < self.targets['memory_usage'] else "❌"
        
        # Disk usage
        disk = psutil.disk_usage('/')
        disk_percent = (disk.used / disk.total) * 100
        
        self.metrics['system_resources'] = {
            'cpu_usage_percent': cpu_percent,
            'memory_usage_percent': memory.percent,
            'memory_available_gb': round(memory.available / (1024**3), 2),
            'disk_usage_percent': round(disk_percent, 2),
            'disk_free_gb': round(disk.free / (1024**3), 2),
            'timestamp': datetime.now().isoformat()
        }
        
        print(f"  {cpu_status} CPU Usage: {cpu_percent}% (Target: <{self.targets['cpu_usage']}%)")
        print(f"  {memory_status} Memory Usage: {memory.percent}% (Target: <{self.targets['memory_usage']}%)")
        print(f"  📁 Disk Usage: {disk_percent:.1f}% (Free: {disk.free / (1024**3):.1f}GB)")
    
    def simulate_assessment_accuracy(self):
        """Simulate assessment accuracy monitoring"""
        print("🧠 Simulating Assessment Accuracy...")
        
        # Simulate DISC, MBTI, Numerology accuracy
        import random
        
        assessments = {
            'DISC': random.uniform(94, 98),
            'MBTI': random.uniform(92, 96),
            'Numerology': random.uniform(96, 99),
            'CV_Analysis': random.uniform(93, 97)
        }
        
        for assessment, accuracy in assessments.items():
            status = "✅" if accuracy >= self.targets['assessment_accuracy'] else "❌"
            self.metrics['assessment_accuracy'][assessment] = {
                'accuracy_percent': round(accuracy, 2),
                'target_met': accuracy >= self.targets['assessment_accuracy'],
                'timestamp': datetime.now().isoformat()
            }
            print(f"  {status} {assessment}: {accuracy:.2f}% (Target: ≥{self.targets['assessment_accuracy']}%)")
    
    def simulate_database_performance(self):
        """Simulate database performance metrics"""
        print("🗄️ Simulating Database Performance...")
        
        import random
        
        db_metrics = {
            'query_response_time_ms': random.uniform(20, 40),
            'connection_pool_usage': random.uniform(50, 75),
            'slow_queries_count': random.randint(0, 5),
            'cache_hit_ratio': random.uniform(85, 95)
        }
        
        self.metrics['database_performance'] = {
            **db_metrics,
            'timestamp': datetime.now().isoformat()
        }
        
        query_status = "✅" if db_metrics['query_response_time_ms'] < 30 else "❌"
        pool_status = "✅" if db_metrics['connection_pool_usage'] < 80 else "❌"
        slow_status = "✅" if db_metrics['slow_queries_count'] == 0 else "⚠️"
        
        print(f"  {query_status} Query Response Time: {db_metrics['query_response_time_ms']:.2f}ms")
        print(f"  {pool_status} Connection Pool Usage: {db_metrics['connection_pool_usage']:.1f}%")
        print(f"  {slow_status} Slow Queries: {db_metrics['slow_queries_count']}")
        print(f"  📊 Cache Hit Ratio: {db_metrics['cache_hit_ratio']:.1f}%")
    
    def calculate_overall_health_score(self):
        """Calculate overall platform health score"""
        scores = []
        
        # API Performance Score
        api_scores = []
        for endpoint, metrics in self.metrics['api_performance'].items():
            if metrics.get('target_met'):
                api_scores.append(100)
            elif metrics.get('response_time_ms'):
                # Partial score based on how close to target
                score = max(0, 100 - (metrics['response_time_ms'] - self.targets['api_response_time']))
                api_scores.append(score)
            else:
                api_scores.append(0)
        
        if api_scores:
            scores.append(sum(api_scores) / len(api_scores))
        
        # System Resources Score
        cpu_score = max(0, 100 - max(0, self.metrics['system_resources']['cpu_usage_percent'] - self.targets['cpu_usage']))
        memory_score = max(0, 100 - max(0, self.metrics['system_resources']['memory_usage_percent'] - self.targets['memory_usage']))
        scores.extend([cpu_score, memory_score])
        
        # Assessment Accuracy Score
        accuracy_scores = []
        for assessment, metrics in self.metrics['assessment_accuracy'].items():
            if metrics['target_met']:
                accuracy_scores.append(100)
            else:
                # Partial score
                score = (metrics['accuracy_percent'] / self.targets['assessment_accuracy']) * 100
                accuracy_scores.append(min(100, score))
        
        if accuracy_scores:
            scores.append(sum(accuracy_scores) / len(accuracy_scores))
        
        overall_score = sum(scores) / len(scores) if scores else 0
        return round(overall_score, 1)
    
    def generate_performance_report(self):
        """Generate comprehensive performance report"""
        overall_score = self.calculate_overall_health_score()
        
        report = {
            'report_timestamp': datetime.now().isoformat(),
            'project': 'HR Profiling & Assessment Platform',
            'sdlc_version': '4.7.0',
            'overall_health_score': overall_score,
            'performance_metrics': self.metrics,
            'targets': self.targets,
            'recommendations': self.generate_recommendations()
        }
        
        return report
    
    def generate_recommendations(self):
        """Generate improvement recommendations based on metrics"""
        recommendations = []
        
        # API Performance Recommendations
        for endpoint, metrics in self.metrics['api_performance'].items():
            if not metrics.get('target_met') and metrics.get('response_time_ms'):
                recommendations.append(f"Optimize {endpoint} - Current: {metrics['response_time_ms']}ms, Target: <{self.targets['api_response_time']}ms")
        
        # System Resource Recommendations
        if self.metrics['system_resources']['cpu_usage_percent'] > self.targets['cpu_usage']:
            recommendations.append(f"High CPU usage detected: {self.metrics['system_resources']['cpu_usage_percent']}% - Consider scaling or optimization")
        
        if self.metrics['system_resources']['memory_usage_percent'] > self.targets['memory_usage']:
            recommendations.append(f"High memory usage detected: {self.metrics['system_resources']['memory_usage_percent']}% - Monitor for memory leaks")
        
        # Assessment Accuracy Recommendations
        for assessment, metrics in self.metrics['assessment_accuracy'].items():
            if not metrics['target_met']:
                recommendations.append(f"Improve {assessment} accuracy - Current: {metrics['accuracy_percent']}%, Target: ≥{self.targets['assessment_accuracy']}%")
        
        return recommendations
    
    def print_dashboard(self):
        """Print real-time dashboard"""
        overall_score = self.calculate_overall_health_score()
        
        print("\n" + "="*60)
        print("🎯 HR PLATFORM PERFORMANCE DASHBOARD - SDLC 4.7")
        print("="*60)
        print(f"📊 Overall Health Score: {overall_score}%")
        
        if overall_score >= 90:
            print("✅ EXCELLENT - Platform performing optimally")
        elif overall_score >= 75:
            print("⚠️ GOOD - Minor optimizations needed")
        elif overall_score >= 60:
            print("🔧 NEEDS ATTENTION - Performance issues detected")
        else:
            print("❌ CRITICAL - Immediate action required")
        
        print(f"🕒 Report Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)
        
        # Recommendations
        recommendations = self.generate_recommendations()
        if recommendations:
            print("\n📋 RECOMMENDATIONS:")
            for i, rec in enumerate(recommendations, 1):
                print(f"  {i}. {rec}")
        else:
            print("\n✅ NO RECOMMENDATIONS - All targets met!")
        
        print("="*60)
    
    async def run_monitoring_cycle(self):
        """Run complete monitoring cycle"""
        print("🚀 Starting SDLC 4.7 Performance Monitoring Cycle...")
        print("Project: HR Profiling & Assessment Platform")
        print("="*60)
        
        # Run all monitoring tasks
        await self.monitor_api_performance()
        self.monitor_system_resources()
        self.simulate_assessment_accuracy()
        self.simulate_database_performance()
        
        # Generate and save report
        report = self.generate_performance_report()
        
        # Save report
        report_path = Path('.sdlc/compliance/performance-report.json')
        report_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Print dashboard
        self.print_dashboard()
        
        print(f"\n📁 Report saved to: {report_path}")
        
        return report

async def main():
    """Main monitoring function"""
    monitor = HRPlatformMonitor()
    report = await monitor.run_monitoring_cycle()
    
    # Optional: Run continuous monitoring
    print("\n🔄 Run continuous monitoring? (y/n):", end=" ")
    try:
        import sys
        if sys.stdin.readable():
            choice = input().lower()
            if choice == 'y':
                print("🔄 Starting continuous monitoring (Ctrl+C to stop)...")
                try:
                    while True:
                        await asyncio.sleep(60)  # Wait 1 minute
                        print("\n" + "⏰ " + "="*20 + " HOURLY CHECK " + "="*20)
                        await monitor.run_monitoring_cycle()
                except KeyboardInterrupt:
                    print("\n🛑 Monitoring stopped by user")
        else:
            print("Single monitoring cycle completed.")
    except:
        print("Single monitoring cycle completed.")

if __name__ == "__main__":
    asyncio.run(main())