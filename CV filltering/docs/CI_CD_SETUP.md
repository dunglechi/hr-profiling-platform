# CI/CD Setup Guide
**CV Filtering Backend - Continuous Integration & Deployment**

**Date:** 2025-10-22
**Status:** Ready for Implementation

---

## Overview

This document describes the CI/CD setup for the CV Filtering Backend, including automated testing, code quality checks, and deployment pipelines.

### Components
- ✅ GitHub Actions workflows
- ✅ Pre-commit hooks
- ✅ Automated testing
- ✅ Code quality checks
- ✅ Security scanning
- ✅ Coverage reporting

---

## GitHub Actions Workflows

### Test Suite CI (`.github/workflows/tests.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**

#### 1. Test Job
**Purpose:** Run all tests across multiple Python versions

**Matrix Strategy:**
```yaml
python-version: ['3.9', '3.10', '3.11']
```

**Steps:**
1. Checkout code
2. Setup Python (3.9, 3.10, 3.11)
3. Cache pip dependencies
4. Install dependencies
5. Run verification tests
6. Run unit tests
7. Run tests with coverage
8. Upload coverage to Codecov
9. Archive test results

**Caching:**
- Pip dependencies cached for faster builds
- Cache key: `${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}`

#### 2. Lint Job
**Purpose:** Check code quality and formatting

**Tools:**
- `flake8` - Python linting
- `black` - Code formatting
- `isort` - Import sorting

**Checks:**
- Python syntax errors
- Undefined names
- Code complexity
- Line length (127 chars)
- Formatting consistency

#### 3. Security Job
**Purpose:** Scan for security vulnerabilities

**Tools:**
- `bandit` - Security issue scanner
- `safety` - Known vulnerability checker

**Reports:**
- Bandit JSON report
- Safety vulnerability report
- Artifacts uploaded for review

---

## Pre-commit Hooks

### Installation

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run manually on all files
pre-commit run --all-files
```

### Configured Hooks

#### 1. General File Checks
```yaml
- trailing-whitespace     # Remove trailing spaces
- end-of-file-fixer      # Ensure files end with newline
- check-yaml             # Validate YAML syntax
- check-json             # Validate JSON syntax
- check-added-large-files # Prevent large files (>1MB)
- check-merge-conflict   # Detect merge conflict markers
- detect-private-key     # Prevent committing private keys
- mixed-line-ending      # Ensure consistent line endings
```

#### 2. Python Code Formatting
```yaml
- black                  # Auto-format code
  - Line length: 127
  - Files: backend/src/
```

#### 3. Import Sorting
```yaml
- isort                  # Sort imports
  - Profile: black
  - Line length: 127
```

#### 4. Linting
```yaml
- flake8                 # Python linting
  - Max line length: 127
  - Ignore: E203, W503
```

#### 5. Security Scanning
```yaml
- bandit                 # Security scanner
  - Target: backend/src
```

#### 6. Custom Hooks
```yaml
- verify-fixes          # Run on commit
  - Verifies critical bug fixes
  - Quick smoke test

- run-unit-tests        # Run on push
  - Runs unit test suite
  - Ensures code quality
```

---

## Automated Testing Strategy

### Test Levels

#### Level 1: Pre-commit (Local)
**When:** Before each commit
**Duration:** ~10 seconds
**Tests:**
- `verify_fixes.py` - Critical bug verification
**Purpose:** Catch obvious breakage early

#### Level 2: Pre-push (Local)
**When:** Before push to remote
**Duration:** ~30 seconds
**Tests:**
- `test_fixes_verification.py` - All critical fixes
**Purpose:** Ensure fixes remain working

#### Level 3: CI Pipeline (GitHub Actions)
**When:** On push/PR to main/develop
**Duration:** ~2-3 minutes
**Tests:**
- All unit tests
- All integration tests
- Coverage analysis
**Purpose:** Full validation

---

## Coverage Reporting

### Codecov Integration

**Setup:**
1. Sign up at https://codecov.io
2. Connect GitHub repository
3. Token automatically provided via GitHub Actions

**Configuration:**
```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./backend/coverage.xml
    flags: unittests
    fail_ci_if_error: false
```

**Coverage Targets:**
- Overall: 90%+
- New code: 95%+
- Critical paths: 100%

**Reports:**
- Coverage badge in README
- PR comments with coverage diff
- Detailed HTML reports

---

## Running Tests Locally

### Quick Verification
```bash
# Verify all critical fixes (fastest)
python verify_fixes.py
```

### Specific Test Suites
```bash
# Batch insert tests
cd backend
python -m pytest src/__tests__/test_database_service_batch.py -v

# DISC pipeline tests
python -m pytest src/__tests__/test_disc_pipeline_comprehensive.py -v

# Security tests
python -m pytest src/__tests__/test_security_validation.py -v

# Verification tests
python -m pytest src/__tests__/test_fixes_verification.py -v
```

### With Coverage
```bash
cd backend
python -m pytest src/__tests__/ \
  --cov=src/services \
  --cov=src/routes \
  --cov-report=html \
  --cov-report=term
```

### Using Test Runner
```bash
# Interactive menu
python run_tests.py

# Command-line
python run_tests.py all
python run_tests.py coverage
python run_tests.py critical
```

---

## CI/CD Best Practices

### Branch Protection Rules

Recommended settings for `main` branch:
```
✅ Require pull request reviews (1+)
✅ Require status checks to pass:
   - test (Python 3.9, 3.10, 3.11)
   - lint
   - security
✅ Require branches to be up to date
✅ Require linear history
✅ Include administrators
❌ Allow force pushes
❌ Allow deletions
```

### Pull Request Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make Changes**
   - Write code
   - Write tests
   - Run pre-commit hooks

3. **Local Testing**
   ```bash
   python verify_fixes.py
   python run_tests.py all
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: Add new feature"
   # Pre-commit hooks run automatically
   ```

5. **Push**
   ```bash
   git push origin feature/new-feature
   # Pre-push hooks run
   ```

6. **Create PR**
   - GitHub Actions run automatically
   - Review test results
   - Check coverage report
   - Review security scan

7. **Code Review**
   - Address feedback
   - Ensure all checks pass
   - Merge when approved

---

## Troubleshooting CI/CD

### Test Failures

**Symptom:** Tests pass locally but fail in CI

**Common Causes:**
1. **Environment differences**
   - Check Python version
   - Verify dependencies
   - Check environment variables

2. **Path issues**
   - Use absolute imports
   - Check sys.path setup

3. **Timing issues**
   - Add appropriate timeouts
   - Mock time-dependent functions

**Solution:**
```bash
# Run with same Python version as CI
pyenv install 3.9.0
pyenv local 3.9.0
python -m pytest src/__tests__/
```

### Pre-commit Hook Failures

**Symptom:** Hooks fail to run

**Common Causes:**
1. **Not installed**
   ```bash
   pre-commit install
   ```

2. **Outdated hooks**
   ```bash
   pre-commit autoupdate
   ```

3. **Hook execution issues**
   ```bash
   pre-commit run --all-files --verbose
   ```

### Coverage Drops

**Symptom:** Coverage report shows decrease

**Actions:**
1. Review uncovered lines
2. Add missing tests
3. Check for dead code
4. Verify test execution

```bash
# Generate detailed coverage report
pytest --cov=src --cov-report=html
# Open htmlcov/index.html
```

---

## Performance Optimization

### Caching Strategy

**Dependencies:**
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
```

**Benefits:**
- ~30% faster builds
- Reduced API calls
- Lower bandwidth usage

### Parallel Execution

**Matrix Strategy:**
```yaml
strategy:
  matrix:
    python-version: ['3.9', '3.10', '3.11']
```

**Benefits:**
- 3 versions tested simultaneously
- Faster overall pipeline
- Better coverage across versions

### Test Optimization

**Fast Tests First:**
```yaml
# Quick verification (10s)
- python verify_fixes.py

# Unit tests (30s)
- pytest test_fixes_verification.py

# Full suite (2min)
- pytest src/__tests__/ --cov
```

---

## Monitoring & Alerts

### GitHub Notifications

**Configure:**
- Settings → Notifications
- Watch repository
- Custom routing rules

**Events:**
- Workflow failures
- PR status changes
- Security alerts

### Codecov Notifications

**Configure:**
- Project settings
- Notification preferences
- Slack/email integration

**Alerts:**
- Coverage drops >5%
- New uncovered code
- Critical path changes

---

## Deployment Pipeline (Future)

### Staging Deployment

```yaml
deploy-staging:
  needs: [test, lint, security]
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/develop'

  steps:
    - name: Deploy to staging
      run: |
        # Deploy commands here
```

### Production Deployment

```yaml
deploy-production:
  needs: [test, lint, security]
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'

  steps:
    - name: Deploy to production
      run: |
        # Deploy commands here
```

---

## Maintenance

### Weekly Tasks
- Review failed workflows
- Update dependencies
- Check security alerts
- Review coverage trends

### Monthly Tasks
- Update pre-commit hooks
- Review and update workflows
- Performance optimization
- Documentation updates

### Commands
```bash
# Update pre-commit hooks
pre-commit autoupdate

# Update dependencies
pip list --outdated
pip install --upgrade package-name

# Check for security updates
safety check
```

---

## References

### Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Pre-commit Docs](https://pre-commit.com/)
- [Codecov Docs](https://docs.codecov.com/)
- [pytest Docs](https://docs.pytest.org/)

### Tools
- [Black](https://black.readthedocs.io/)
- [isort](https://pycqa.github.io/isort/)
- [flake8](https://flake8.pycqa.org/)
- [bandit](https://bandit.readthedocs.io/)
- [safety](https://pyup.io/safety/)

---

## Quick Reference

### Setup Commands
```bash
# Install pre-commit
pip install pre-commit
pre-commit install

# Run verification
python verify_fixes.py

# Run all tests
python run_tests.py all

# Run with coverage
python run_tests.py coverage
```

### CI Status Badges

Add to README.md:
```markdown
![Tests](https://github.com/username/repo/workflows/Test%20Suite%20CI/badge.svg)
![Coverage](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)
```

---

**Last Updated:** 2025-10-22
**Maintained by:** Development Team
**Review Frequency:** Monthly
