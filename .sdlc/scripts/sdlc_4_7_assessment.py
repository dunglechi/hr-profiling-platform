#!/usr/bin/env python3
"""
SDLC 4.7 Compliance Assessment Tool
HR Profiling & Assessment Platform
Version: 4.7.0
"""

import os
import re
import json
import glob
from pathlib import Path
from typing import Dict, List, Tuple

class SDLC47Assessor:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.violations = {
            'document_naming': [],
            'mock_usage': [],
            'folder_structure': [],
            'sdlc_headers': [],
            'test_coverage': []
        }
        
    def assess_project(self) -> Dict:
        """Run complete SDLC 4.7 compliance assessment"""
        print("🚀 SDLC 4.7 Compliance Assessment Starting...")
        
        self.scan_document_names()
        self.detect_mock_patterns()
        self.validate_folder_structure()
        self.check_sdlc_headers()
        self.measure_test_coverage()
        
        compliance_score = self.calculate_compliance()
        report = self.generate_report(compliance_score)
        
        return report
    
    def scan_document_names(self):
        """Scan for prohibited document naming patterns"""
        print("📋 Scanning document names...")
        
        forbidden_patterns = [
            r'SPRINT-\d+',
            r'DAY-\d+',
            r'V\d+\.\d+',
            r'TEAM-\d+',
            r'TEMP|DRAFT|FINAL',
            r'\d{4}-\d{2}-\d{2}'  # Date patterns
        ]
        
        for md_file in self.project_root.rglob('*.md'):
            filename = md_file.name
            for pattern in forbidden_patterns:
                if re.search(pattern, filename, re.IGNORECASE):
                    self.violations['document_naming'].append({
                        'file': str(md_file),
                        'pattern': pattern,
                        'severity': 'MEDIUM'
                    })
    
    def detect_mock_patterns(self):
        """Detect mock usage violations (Zero Mock Policy)"""
        print("🔍 Detecting mock patterns...")
        
        mock_patterns = [
            r'jest\.mock\(',
            r'sinon\.mock\(',
            r'@Mock',
            r'mock\(',
            r'MockRequest',
            r'MockResponse',
            r'fake\w*\(',
            r'stub\w*\('
        ]
        
        for code_file in self.project_root.rglob('*.{ts,js,py}'):
            try:
                content = code_file.read_text(encoding='utf-8')
                for pattern in mock_patterns:
                    matches = re.findall(pattern, content, re.IGNORECASE)
                    if matches:
                        self.violations['mock_usage'].append({
                            'file': str(code_file),
                            'pattern': pattern,
                            'count': len(matches),
                            'severity': 'CRITICAL'
                        })
            except (UnicodeDecodeError, PermissionError):
                continue
    
    def validate_folder_structure(self):
        """Validate SDLC 4.7 folder structure"""
        print("📁 Validating folder structure...")
        
        required_folders = [
            '.sdlc',
            '.sdlc/compliance',
            '.sdlc/ai-roles',
            '.sdlc/scripts'
        ]
        
        for folder in required_folders:
            folder_path = self.project_root / folder
            if not folder_path.exists():
                self.violations['folder_structure'].append({
                    'missing_folder': folder,
                    'severity': 'HIGH'
                })
    
    def check_sdlc_headers(self):
        """Check for SDLC 4.7 compliant headers"""
        print("📄 Checking SDLC headers...")
        
        for md_file in self.project_root.rglob('*.md'):
            try:
                content = md_file.read_text(encoding='utf-8')
                if not self.has_sdlc_header(content):
                    self.violations['sdlc_headers'].append({
                        'file': str(md_file),
                        'issue': 'Missing SDLC 4.7 header',
                        'severity': 'LOW'
                    })
            except (UnicodeDecodeError, PermissionError):
                continue
    
    def has_sdlc_header(self, content: str) -> bool:
        """Check if content has proper SDLC 4.7 header"""
        header_indicators = [
            'Version:',
            'Date:',
            'Status:',
            'SDLC 4.7'
        ]
        
        first_lines = content.split('\n')[:10]
        found_indicators = 0
        
        for line in first_lines:
            for indicator in header_indicators:
                if indicator in line:
                    found_indicators += 1
        
        return found_indicators >= 2
    
    def measure_test_coverage(self):
        """Measure test coverage"""
        print("🧪 Measuring test coverage...")
        
        test_files = list(self.project_root.rglob('*.test.{ts,js,py}'))
        source_files = list(self.project_root.rglob('*.{ts,js,py}'))
        
        # Exclude test files from source count
        source_files = [f for f in source_files if '.test.' not in f.name]
        
        if len(source_files) > 0:
            coverage_ratio = len(test_files) / len(source_files)
            if coverage_ratio < 0.8:  # 80% threshold
                self.violations['test_coverage'].append({
                    'test_files': len(test_files),
                    'source_files': len(source_files),
                    'coverage_ratio': coverage_ratio,
                    'severity': 'HIGH'
                })
    
    def calculate_compliance(self) -> float:
        """Calculate overall compliance score"""
        total_violations = sum(len(v) for v in self.violations.values())
        
        # Weight violations by severity
        severity_weights = {
            'CRITICAL': 10,
            'HIGH': 5,
            'MEDIUM': 2,
            'LOW': 1
        }
        
        weighted_score = 0
        for violation_type, violations in self.violations.items():
            for violation in violations:
                weight = severity_weights.get(violation.get('severity', 'LOW'), 1)
                weighted_score += weight
        
        # Calculate compliance percentage (100 - penalty)
        max_score = 100
        penalty = min(weighted_score * 2, max_score)  # Cap at 100%
        compliance = max(0, max_score - penalty)
        
        return compliance
    
    def generate_report(self, compliance_score: float) -> Dict:
        """Generate compliance report"""
        report = {
            'project': 'HR Profiling & Assessment Platform',
            'assessment_date': '2025-10-11',
            'sdlc_version': '4.7.0',
            'compliance_score': compliance_score,
            'violations': self.violations,
            'recommendations': self.get_recommendations()
        }
        
        # Save report
        report_path = self.project_root / '.sdlc' / 'compliance' / 'assessment-report.json'
        report_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        self.print_summary(compliance_score)
        return report
    
    def get_recommendations(self) -> List[str]:
        """Get improvement recommendations"""
        recommendations = []
        
        if self.violations['mock_usage']:
            recommendations.append("CRITICAL: Implement Zero Mock Policy - replace all mocks with real implementations")
        
        if self.violations['document_naming']:
            recommendations.append("MEDIUM: Rename documents to follow permanent naming conventions")
        
        if self.violations['folder_structure']:
            recommendations.append("HIGH: Create missing SDLC 4.7 folder structure")
        
        if self.violations['test_coverage']:
            recommendations.append("HIGH: Increase test coverage to minimum 80%")
        
        if self.violations['sdlc_headers']:
            recommendations.append("LOW: Add SDLC 4.7 headers to documentation")
        
        return recommendations
    
    def print_summary(self, compliance_score: float):
        """Print assessment summary"""
        print("\n" + "="*50)
        print("🎯 SDLC 4.7 COMPLIANCE ASSESSMENT RESULTS")
        print("="*50)
        print(f"Project: HR Profiling & Assessment Platform")
        print(f"Compliance Score: {compliance_score:.1f}%")
        
        if compliance_score >= 95:
            print("✅ EXCELLENT - Ready for production")
        elif compliance_score >= 80:
            print("⚠️  GOOD - Minor improvements needed")
        elif compliance_score >= 60:
            print("🔧 NEEDS WORK - Significant improvements required")
        else:
            print("❌ CRITICAL - Major compliance issues")
        
        print("\nViolation Summary:")
        for violation_type, violations in self.violations.items():
            if violations:
                print(f"  {violation_type}: {len(violations)} issues")
        
        print(f"\nReport saved to: .sdlc/compliance/assessment-report.json")
        print("="*50)

if __name__ == "__main__":
    import sys
    
    project_root = sys.argv[1] if len(sys.argv) > 1 else "."
    assessor = SDLC47Assessor(project_root)
    report = assessor.assess_project()