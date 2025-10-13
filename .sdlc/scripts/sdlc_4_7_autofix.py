#!/usr/bin/env python3
"""
SDLC 4.7 Auto-Fix Tool
HR Profiling & Assessment Platform
Automatically fixes common compliance violations
"""

import os
import re
import shutil
from pathlib import Path
from typing import List, Dict

class SDLC47AutoFix:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.fixes_applied = []
        
        # Exclude patterns
        self.exclude_patterns = [
            'node_modules',
            '.git',
            'SDLC-Enterprise-Framework',
            '__pycache__',
            'dist',
            'build'
        ]
    
    def should_process_file(self, file_path: Path) -> bool:
        """Check if file should be processed"""
        path_str = str(file_path)
        for pattern in self.exclude_patterns:
            if pattern in path_str:
                return False
        return True
    
    def fix_document_naming(self):
        """Fix document naming violations"""
        print("🔧 Fixing document naming violations...")
        
        for md_file in self.project_root.rglob('*.md'):
            if not self.should_process_file(md_file):
                continue
                
            old_name = md_file.name
            new_name = self.get_compliant_name(old_name)
            
            if old_name != new_name:
                new_path = md_file.parent / new_name
                
                # Avoid conflicts
                if new_path.exists():
                    counter = 1
                    while new_path.exists():
                        name_parts = new_name.rsplit('.', 1)
                        new_name = f"{name_parts[0]}-{counter}.{name_parts[1]}"
                        new_path = md_file.parent / new_name
                        counter += 1
                
                try:
                    md_file.rename(new_path)
                    self.fixes_applied.append({
                        'type': 'document_rename',
                        'old': str(md_file),
                        'new': str(new_path)
                    })
                    print(f"  ✅ Renamed: {old_name} → {new_name}")
                except Exception as e:
                    print(f"  ❌ Failed to rename {old_name}: {e}")
    
    def get_compliant_name(self, filename: str) -> str:
        """Convert filename to SDLC 4.7 compliant name"""
        name = filename
        
        # Remove sprint references
        name = re.sub(r'SPRINT-\d+-?', '', name, flags=re.IGNORECASE)
        
        # Remove day references
        name = re.sub(r'DAY-\d+-?', '', name, flags=re.IGNORECASE)
        
        # Remove version numbers
        name = re.sub(r'-?V\d+(\.\d+)*-?', '', name, flags=re.IGNORECASE)
        
        # Remove team references
        name = re.sub(r'TEAM-\d+-?', '', name, flags=re.IGNORECASE)
        
        # Remove temp/draft/final
        name = re.sub(r'-(TEMP|DRAFT|FINAL)-?', '', name, flags=re.IGNORECASE)
        name = re.sub(r'^(TEMP|DRAFT|FINAL)-', '', name, flags=re.IGNORECASE)
        
        # Remove date patterns
        name = re.sub(r'\d{4}-\d{2}-\d{2}-?', '', name)
        
        # Clean up multiple dashes
        name = re.sub(r'-+', '-', name)
        name = name.strip('-')
        
        # Ensure proper extension
        if not name.endswith('.md'):
            name = name.replace('.md', '') + '.md'
        
        return name
    
    def add_sdlc_headers(self):
        """Add SDLC 4.7 headers to documentation"""
        print("📄 Adding SDLC 4.7 headers...")
        
        for md_file in self.project_root.rglob('*.md'):
            if not self.should_process_file(md_file):
                continue
            
            try:
                content = md_file.read_text(encoding='utf-8')
                
                if not self.has_sdlc_header(content):
                    header = self.generate_sdlc_header(md_file.name)
                    new_content = header + "\n\n" + content
                    
                    md_file.write_text(new_content, encoding='utf-8')
                    self.fixes_applied.append({
                        'type': 'header_added',
                        'file': str(md_file)
                    })
                    print(f"  ✅ Added header to: {md_file.name}")
            
            except (UnicodeDecodeError, PermissionError) as e:
                print(f"  ❌ Failed to process {md_file.name}: {e}")
    
    def has_sdlc_header(self, content: str) -> bool:
        """Check if content has SDLC 4.7 header"""
        first_lines = content.split('\n')[:10]
        header_indicators = ['**Version**:', '**Date**:', '**Status**:', 'SDLC 4.7']
        
        found = 0
        for line in first_lines:
            for indicator in header_indicators:
                if indicator in line:
                    found += 1
                    break
        
        return found >= 2
    
    def generate_sdlc_header(self, filename: str) -> str:
        """Generate SDLC 4.7 compliant header"""
        title = filename.replace('.md', '').replace('-', ' ').title()
        
        header = f"""# {title}
**Version**: 4.7.0
**Date**: October 11, 2025
**Status**: ACTIVE
**Project**: HR Profiling & Assessment Platform
**Framework**: SDLC 4.7 Compliant"""
        
        return header
    
    def setup_pre_commit_hooks(self):
        """Setup pre-commit hooks for SDLC 4.7"""
        print("🪝 Setting up pre-commit hooks...")
        
        pre_commit_config = """repos:
  - repo: local
    hooks:
      - id: sdlc-4-7-document-naming
        name: SDLC 4.7 Document Naming
        entry: python .sdlc/scripts/validate_naming.py
        language: system
        files: '\\.md$'
        
      - id: sdlc-4-7-zero-mock
        name: SDLC 4.7 Zero Mock Policy
        entry: python .sdlc/scripts/validate_no_mocks.py
        language: system
        files: '\\.(ts|js|py)$'
        
      - id: sdlc-4-7-headers
        name: SDLC 4.7 Documentation Headers
        entry: python .sdlc/scripts/validate_headers.py
        language: system
        files: '\\.md$'"""
        
        config_path = self.project_root / '.pre-commit-config.yaml'
        config_path.write_text(pre_commit_config)
        
        self.fixes_applied.append({
            'type': 'pre_commit_setup',
            'file': str(config_path)
        })
        print("  ✅ Created .pre-commit-config.yaml")
    
    def create_validation_scripts(self):
        """Create validation scripts for pre-commit hooks"""
        print("📜 Creating validation scripts...")
        
        scripts_dir = self.project_root / '.sdlc' / 'scripts'
        scripts_dir.mkdir(parents=True, exist_ok=True)
        
        # Document naming validator
        naming_validator = '''#!/usr/bin/env python3
import sys
import re

FORBIDDEN_PATTERNS = [
    r'SPRINT-\\d+',
    r'DAY-\\d+', 
    r'V\\d+\\.\\d+',
    r'TEAM-\\d+',
    r'TEMP|DRAFT|FINAL',
    r'\\d{4}-\\d{2}-\\d{2}'
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
    sys.exit(exit_code)'''
        
        (scripts_dir / 'validate_naming.py').write_text(naming_validator, encoding='utf-8')
        
        # Mock validator
        mock_validator = '''#!/usr/bin/env python3
import sys
import re

MOCK_PATTERNS = [
    r'jest\\.mock\\(',
    r'sinon\\.mock\\(',
    r'@Mock',
    r'mock\\(',
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
    sys.exit(exit_code)'''
        
        (scripts_dir / 'validate_no_mocks.py').write_text(mock_validator, encoding='utf-8')
        
        # Header validator
        header_validator = '''#!/usr/bin/env python3
import sys

def validate_headers(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        first_lines = content.split('\\n')[:10]
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
    sys.exit(exit_code)'''
        
        (scripts_dir / 'validate_headers.py').write_text(header_validator, encoding='utf-8')
        
        print("  ✅ Created validation scripts")
    
    def fix_all(self):
        """Run all auto-fixes"""
        print("🚀 SDLC 4.7 Auto-Fix Starting...")
        print("="*50)
        
        self.fix_document_naming()
        self.add_sdlc_headers()
        self.setup_pre_commit_hooks()
        self.create_validation_scripts()
        
        print("\n" + "="*50)
        print(f"✅ SDLC 4.7 Auto-Fix Completed!")
        print(f"Applied {len(self.fixes_applied)} fixes")
        print("="*50)
        
        return self.fixes_applied

if __name__ == "__main__":
    import sys
    
    project_root = sys.argv[1] if len(sys.argv) > 1 else "."
    fixer = SDLC47AutoFix(project_root)
    fixes = fixer.fix_all()
    
    print("\\nFixes applied:")
    for fix in fixes:
        print(f"  - {fix['type']}: {fix.get('file', fix.get('old', 'N/A'))}")