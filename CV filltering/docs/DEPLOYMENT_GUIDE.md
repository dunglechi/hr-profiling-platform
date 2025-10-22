# Deployment Guide - Staging & Production
**CV Filtering Backend - Complete Deployment Procedures**

**Last Updated:** 2025-10-22
**Status:** Production Ready

---

## 🚀 Quick Start - Deploy to Staging

```bash
# One-command deployment
python deploy_staging.py
```

That's it! The script will handle everything automatically.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Staging Deployment](#staging-deployment)
3. [Monitoring & Validation](#monitoring--validation)
4. [Rollback Procedures](#rollback-procedures)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Automated Checks ✅

The deployment script automatically runs:
- ✅ All critical bug fix verification
- ✅ Unit test suite
- ✅ Code formatting check
- ✅ Git status validation

### Manual Verification 👤

Before deploying, ensure:

```bash
# 1. All tests pass locally
python verify_fixes.py

# 2. Coverage is acceptable
python run_tests.py coverage

# 3. No uncommitted critical changes
git status

# 4. Dependencies are up to date
pip list --outdated
```

**Checklist:**
- [ ] All 7 critical bugs verified as fixed
- [ ] Test coverage >= 90%
- [ ] No failing tests
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Environment variables configured

---

## Staging Deployment

### Method 1: Automated Script (Recommended)

```bash
# Full automated deployment
python deploy_staging.py

# Dry run (no actual changes)
python deploy_staging.py --dry-run

# Skip pre-deployment tests (not recommended)
python deploy_staging.py --skip-tests
```

### What the Script Does:

**Phase 1: Pre-Deployment Checks**
- Runs `verify_fixes.py`
- Executes unit tests
- Checks code formatting
- Validates git status

**Phase 2: Create Backup**
- Creates backup branch: `backup/staging-YYYYMMDD-HHMMSS`
- Preserves current state for easy rollback

**Phase 3: Commit Changes**
- Stages all changes
- Creates detailed commit message
- Includes deployment metadata

**Phase 4: Push to Staging**
- Switches to `develop` branch
- Pushes with `--force-with-lease` (safe force)
- Triggers GitHub Actions CI/CD

**Phase 5: Post-Deployment Validation**
- Waits for deployment to stabilize
- Runs verification tests
- Checks test coverage
- Validates critical paths

### Method 2: Manual Deployment

```bash
# 1. Run tests
python verify_fixes.py
python run_tests.py all

# 2. Create backup
git branch backup/manual-$(date +%Y%m%d-%H%M%S)

# 3. Commit changes
git add .
git commit -m "deploy: Staging deployment"

# 4. Push to staging
git checkout develop
git push origin develop

# 5. Monitor GitHub Actions
# Visit: https://github.com/your-repo/actions
```

---

## Monitoring & Validation

### Automated Monitoring Script

```bash
# Start continuous monitoring (30s interval)
python monitor_staging.py

# Custom interval (60s)
python monitor_staging.py --interval 60

# Custom URL
python monitor_staging.py --url https://staging.yourdomain.com

# Single health check
python monitor_staging.py --single
```

### Monitoring Dashboard

The script provides real-time dashboard showing:

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║         STAGING ENVIRONMENT MONITOR                    ║
║         Real-time Health Dashboard                     ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

Monitoring Duration: 0:05:23
Base URL: http://localhost:5000
Last Check: 14:32:15

Health Checks:
  Success: 11
  Failed:  0
  Rate:    100.0%

API Calls:
  Success: 11
  Failed:  0
  Rate:    100.0%

Response Times:
  Average: 145ms
  Min:     98ms
  Max:     234ms

Status: HEALTHY ✅
```

### Manual Health Checks

```bash
# Check health endpoint
curl http://localhost:5000/health

# Check DISC API
curl http://localhost:5000/api/disc/test

# Run verification tests
python verify_fixes.py
```

### 48-Hour Monitoring Period

**Recommended monitoring schedule:**

**Day 1 (Deployment Day):**
- ✅ Hour 0-2: Continuous monitoring (5-minute intervals)
- ✅ Hour 2-8: Every 15 minutes
- ✅ Hour 8-24: Every 30 minutes

**Day 2:**
- ✅ Every hour

**Day 3:**
- ✅ Every 2 hours
- ✅ Final validation before production

**Key Metrics to Watch:**
- Health check success rate (target: >99%)
- Average response time (target: <500ms)
- Error rate (target: <0.1%)
- Memory usage (target: stable)
- CPU usage (target: <70%)

---

## Rollback Procedures

### Automatic Rollback

If deployment fails, the script automatically:
- ✅ Preserves backup branch
- ✅ Logs all errors
- ✅ Provides rollback instructions

### Manual Rollback

#### Quick Rollback (to backup)

```bash
# 1. Find backup branch
git branch | grep backup/staging

# 2. Restore from backup
git checkout backup/staging-20251022-143000

# 3. Force push to staging
git push origin develop --force

# 4. Verify rollback
python monitor_staging.py --single
```

#### Rollback to Specific Commit

```bash
# 1. Find commit hash
git log --oneline -10

# 2. Reset to commit
git reset --hard <commit-hash>

# 3. Force push
git push origin develop --force

# 4. Verify
python verify_fixes.py
```

#### Emergency Rollback (Nuclear Option)

```bash
# Revert last commit
git revert HEAD
git push origin develop

# Or reset to previous deploy
git reset --hard HEAD~1
git push origin develop --force
```

### Post-Rollback Validation

```bash
# 1. Run health check
python monitor_staging.py --single

# 2. Verify tests pass
python verify_fixes.py

# 3. Check logs
tail -f deployment_log_*.txt
```

---

## Production Deployment

### Prerequisites

- [ ] Staging deployment successful
- [ ] 48-hour monitoring period completed
- [ ] All health checks passing
- [ ] No critical errors observed
- [ ] Performance metrics acceptable
- [ ] Team approval obtained

### Production Deployment Steps

#### 1. Final Pre-Production Validation

```bash
# Run full test suite
python run_tests.py all

# Run security tests
python run_tests.py security

# Check coverage
python run_tests.py coverage
```

#### 2. Create Production Release

```bash
# 1. Checkout main branch
git checkout main

# 2. Merge from develop
git merge develop

# 3. Create release tag
git tag -a v1.0.0 -m "Release v1.0.0 - Bug fixes and optimizations"

# 4. Push to production
git push origin main --tags
```

#### 3. Production Monitoring

```bash
# Monitor production environment
python monitor_staging.py --url https://production.yourdomain.com

# Watch for 24 hours minimum
```

#### 4. Post-Production Validation

```bash
# Run smoke tests on production
python verify_fixes.py

# Check all critical endpoints
curl https://production.yourdomain.com/health
curl https://production.yourdomain.com/api/disc/test
```

---

## Troubleshooting

### Deployment Script Fails

**Error:** Pre-deployment checks failed

**Solution:**
```bash
# Review specific error
cat deployment_log_*.txt

# Fix issues
python verify_fixes.py

# Re-run deployment
python deploy_staging.py
```

**Error:** Git push failed

**Solution:**
```bash
# Check git status
git status

# Pull latest changes
git pull origin develop --rebase

# Re-run deployment
python deploy_staging.py
```

### Monitoring Issues

**Error:** Cannot connect to staging

**Solution:**
```bash
# Check if service is running
curl http://localhost:5000/health

# Check logs
tail -f logs/application.log

# Restart service if needed
# (depends on your hosting setup)
```

**Error:** High response times

**Solution:**
```bash
# Check system resources
top
df -h

# Review application logs
grep ERROR logs/application.log

# Check database performance
# (run database-specific diagnostics)
```

### Test Failures Post-Deployment

**Error:** Tests pass locally but fail in staging

**Solution:**
```bash
# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_KEY

# Verify Python version
python --version

# Check dependencies
pip freeze > requirements-staging.txt
diff requirements.txt requirements-staging.txt

# Re-run tests with verbose output
pytest -vv
```

---

## Environment Configuration

### Required Environment Variables

**Staging:**
```bash
# .env.staging
SUPABASE_URL=https://your-staging-project.supabase.co
SUPABASE_KEY=your-staging-anon-key
FLASK_ENV=staging
LOG_LEVEL=INFO
DISC_CSV_MAX_ROWS=1000
TESSERACT_CONFIG="--oem 3 --psm 6"
```

**Production:**
```bash
# .env.production
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_KEY=your-production-anon-key
FLASK_ENV=production
LOG_LEVEL=WARNING
DISC_CSV_MAX_ROWS=1000
TESSERACT_CONFIG="--oem 3 --psm 6"
SENTRY_DSN=your-sentry-dsn  # Optional: Error tracking
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

**Automatically triggered on:**
- Push to `develop` (staging)
- Push to `main` (production)
- Pull requests

**Pipeline Jobs:**
1. **Test** - Run all tests (Python 3.9, 3.10, 3.11)
2. **Lint** - Code quality checks
3. **Security** - Vulnerability scanning
4. **Deploy** - Automatic deployment (if configured)

**Monitor at:** `https://github.com/your-repo/actions`

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database migrations ready (if any)
- [ ] Backup created

### During Deployment
- [ ] Deployment script executed successfully
- [ ] GitHub Actions pipeline passed
- [ ] No errors in deployment logs
- [ ] Backup branch created

### Post-Deployment
- [ ] Health checks passing
- [ ] API endpoints responding
- [ ] No errors in logs
- [ ] Monitoring dashboard healthy
- [ ] Team notified of deployment

### 48-Hour Monitoring
- [ ] Day 1: Hourly checks completed
- [ ] Day 2: No critical issues
- [ ] Performance metrics stable
- [ ] Error rate acceptable
- [ ] Ready for production

---

## Support & Escalation

### Deployment Issues

**Level 1 - Self Service:**
- Review deployment logs
- Check troubleshooting guide
- Run rollback if needed

**Level 2 - Team Support:**
- Slack: #backend-deployments
- Email: dev-team@company.com
- On-call: (rotation schedule)

**Level 3 - Emergency:**
- Critical production issues
- Data integrity concerns
- Security incidents

---

## Deployment History

Track all deployments:

```bash
# View deployment logs
ls -lt deployment_log_*.txt

# View git tags
git tag -l

# View commit history
git log --oneline --graph --all
```

---

## Best Practices

### Do's ✅
- ✅ Always run tests before deployment
- ✅ Create backup branches
- ✅ Monitor for 48 hours before production
- ✅ Use deployment script for consistency
- ✅ Document any manual changes
- ✅ Communicate with team

### Don'ts ❌
- ❌ Skip pre-deployment tests
- ❌ Deploy on Fridays (avoid weekend issues)
- ❌ Deploy without backup
- ❌ Skip monitoring period
- ❌ Force push without backup
- ❌ Deploy untested code

---

## Quick Reference Commands

```bash
# Deploy to staging
python deploy_staging.py

# Monitor staging
python monitor_staging.py

# Verify fixes
python verify_fixes.py

# Run all tests
python run_tests.py all

# Rollback
git checkout backup/staging-<timestamp>
git push origin develop --force

# Production deploy
git checkout main
git merge develop
git push origin main --tags
```

---

**Document Version:** 1.0
**Last Updated:** 2025-10-22
**Next Review:** 2025-11-22
**Owner:** Development Team

---

## Appendix

### Deployment Timeline

**Typical staging deployment:** 5-10 minutes
**Monitoring period:** 48 hours
**Production deployment:** 10-15 minutes
**Total cycle:** ~2-3 days

### Success Criteria

**Staging:**
- All tests pass
- Health check success rate >99%
- Average response time <500ms
- No critical errors for 48 hours

**Production:**
- All staging criteria met
- Team approval obtained
- Documentation complete
- Rollback plan ready
