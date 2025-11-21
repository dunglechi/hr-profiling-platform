"""
One-Command Deployment Script

This script guides you through the complete deployment process:
1. Verify deployment readiness
2. Run integration tests
3. Provide Render deployment instructions
4. Set up monitoring

Usage:
    python deploy_now.py
"""

import os
import sys
import subprocess
from pathlib import Path
from datetime import datetime

# Colors
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
CYAN = '\033[96m'
BOLD = '\033[1m'
RESET = '\033[0m'

def print_banner():
    """Print welcome banner."""
    print(f"\n{CYAN}{'='*70}{RESET}")
    print(f"{CYAN}{BOLD}  CV FILTERING BACKEND - DEPLOYMENT WIZARD{RESET}")
    print(f"{CYAN}  Automated deployment to Render with Supabase{RESET}")
    print(f"{CYAN}{'='*70}{RESET}\n")

def print_step(number, title):
    """Print step header."""
    print(f"\n{BLUE}{BOLD}━━━ Step {number}: {title} ━━━{RESET}\n")

def print_success(text):
    """Print success message."""
    print(f"{GREEN}✅ {text}{RESET}")

def print_error(text):
    """Print error message."""
    print(f"{RED}❌ {text}{RESET}")

def print_warning(text):
    """Print warning message."""
    print(f"{YELLOW}⚠️  {text}{RESET}")

def print_info(text):
    """Print info message."""
    print(f"{CYAN}ℹ️  {text}{RESET}")

def ask_yes_no(question):
    """Ask user a yes/no question."""
    while True:
        response = input(f"{YELLOW}❓ {question} (y/n): {RESET}").lower().strip()
        if response in ['y', 'yes']:
            return True
        elif response in ['n', 'no']:
            return False
        else:
            print("Please answer 'y' or 'n'")

def run_command(command, description, timeout=60):
    """Run a command and return success status."""
    print(f"{CYAN}Running: {description}...{RESET}")
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=timeout,
            shell=True
        )
        if result.returncode == 0:
            print_success(f"{description} completed")
            return True, result.stdout
        else:
            print_error(f"{description} failed")
            if result.stderr:
                print(f"{RED}{result.stderr}{RESET}")
            return False, result.stderr
    except subprocess.TimeoutExpired:
        print_error(f"{description} timed out after {timeout} seconds")
        return False, "Timeout"
    except Exception as e:
        print_error(f"{description} error: {e}")
        return False, str(e)

def step1_supabase_tables():
    """Step 1: Create Supabase tables."""
    print_step(1, "Supabase Database Tables")

    schema_file = Path("docs/supabase-schema.sql")
    if not schema_file.exists():
        print_error("Schema file not found: docs/supabase-schema.sql")
        return False

    print_info("Database schema is ready at: docs/supabase-schema.sql")
    print_info("This file contains 6 tables: candidates, cv_analyses, numerology_data,")
    print_info("disc_assessments, activity_logs, screening_results")

    print(f"\n{YELLOW}ACTION REQUIRED:{RESET}")
    print("1. Open https://supabase.com/dashboard")
    print("2. Select your project (cgvxogztpbzvhncwzodr)")
    print("3. Click 'SQL Editor' in the left menu")
    print("4. Click 'New Query'")
    print("5. Copy the entire content from docs/supabase-schema.sql")
    print("6. Paste into the SQL Editor")
    print("7. Click 'Run' (bottom right)\n")

    return ask_yes_no("Have you created the Supabase tables?")

def step2_verify_readiness():
    """Step 2: Verify deployment readiness."""
    print_step(2, "Verify Deployment Readiness")

    verify_script = Path("verify_deployment_ready.py")
    if not verify_script.exists():
        print_error("Verification script not found")
        return False

    print_info("Running comprehensive verification checks...")

    success, output = run_command(
        f"{sys.executable} verify_deployment_ready.py",
        "Deployment readiness verification",
        timeout=30
    )

    if output:
        print(output)

    if success:
        print_success("All verification checks passed!")
        return True
    else:
        print_error("Some verification checks failed")
        print_info("Please fix the issues above before continuing")
        return ask_yes_no("Do you want to continue anyway? (Not recommended)")

def step3_integration_tests():
    """Step 3: Run integration tests."""
    print_step(3, "Integration Tests")

    test_script = Path("test-supabase-integration.py")
    if not test_script.exists():
        print_error("Integration test script not found")
        return False

    print_info("Running integration tests with real Supabase...")

    success, output = run_command(
        f"{sys.executable} test-supabase-integration.py",
        "Supabase integration tests",
        timeout=60
    )

    if output:
        print(output)

    if success:
        print_success("All integration tests passed!")
        return True
    else:
        print_error("Integration tests failed")
        print_info("Check the output above for details")
        return ask_yes_no("Do you want to continue to deployment anyway?")

def step4_render_deployment():
    """Step 4: Deploy to Render."""
    print_step(4, "Deploy to Render")

    render_config = Path("render.yaml")
    if not render_config.exists():
        print_error("render.yaml not found")
        return False

    print_success("render.yaml configuration found")

    print(f"\n{YELLOW}DEPLOYMENT INSTRUCTIONS:{RESET}")
    print("\n1. PREPARE ENVIRONMENT VARIABLES:")
    print("   Before deploying, prepare these values (copy from .env):")
    print(f"   {CYAN}SUPABASE_URL{RESET}: Your Supabase project URL")
    print(f"   {CYAN}SUPABASE_KEY{RESET}: Your Supabase API key")
    print(f"   {CYAN}SECRET_KEY{RESET}: Generate new for production:")

    # Generate a new secret key suggestion
    import secrets
    suggested_key = secrets.token_hex(32)
    print(f"   {GREEN}Suggested SECRET_KEY: {suggested_key}{RESET}")

    print(f"   {CYAN}GEMINI_API_KEY{RESET}: Your Gemini API key (if using)")

    print("\n2. GO TO RENDER DASHBOARD:")
    print("   Open: https://dashboard.render.com")

    print("\n3. CREATE NEW BLUEPRINT:")
    print("   - Click 'New +' button")
    print("   - Select 'Blueprint'")
    print("   - Connect your GitHub account (if not already connected)")
    print("   - Select repository: 'CV filltering'")
    print("   - Render will automatically detect render.yaml")

    print("\n4. CONFIGURE ENVIRONMENT VARIABLES:")
    print("   Render will prompt for environment variables")
    print("   Enter the values you prepared in step 1")

    print("\n5. DEPLOY:")
    print("   - Click 'Apply' to start deployment")
    print("   - Wait 3-5 minutes for build to complete")
    print("   - Render will provide a URL like:")
    print(f"     {GREEN}https://cv-filtering-backend.onrender.com{RESET}")

    print(f"\n6. VERIFY DEPLOYMENT:")
    print("   Test the health endpoint:")
    print(f"   {CYAN}curl https://YOUR-APP.onrender.com/health{RESET}")

    return ask_yes_no("\nHave you successfully deployed to Render?")

def step5_post_deployment():
    """Step 5: Post-deployment verification and monitoring."""
    print_step(5, "Post-Deployment Verification")

    deployment_url = input(f"\n{YELLOW}Enter your Render deployment URL: {RESET}").strip()

    if not deployment_url:
        print_warning("No URL provided, skipping automated verification")
        return True

    # Ensure URL has protocol
    if not deployment_url.startswith('http'):
        deployment_url = f"https://{deployment_url}"

    # Remove trailing slash
    deployment_url = deployment_url.rstrip('/')

    print_info(f"Testing deployment at: {deployment_url}")

    # Test health endpoint
    print("\n1. Testing health endpoint...")
    success, output = run_command(
        f'curl -s {deployment_url}/health',
        "Health check",
        timeout=10
    )

    if success and '"status"' in output.lower():
        print_success("Health endpoint is responding")
        print(f"   Response: {output[:200]}")
    else:
        print_warning("Health endpoint test failed")
        print_info("This might be normal if the service is still starting up")

    # Test API endpoint
    print("\n2. Testing API endpoint...")
    success, output = run_command(
        f'curl -s {deployment_url}/api/disc/recent?limit=1',
        "API endpoint check",
        timeout=10
    )

    if success:
        print_success("API endpoint is accessible")
    else:
        print_warning("API endpoint test failed")

    print(f"\n{CYAN}MONITORING:{RESET}")
    print("1. View logs in Render Dashboard:")
    print(f"   Services → cv-filtering-backend → Logs")
    print("\n2. Monitor with automated script:")
    print(f"   {CYAN}python deploy/monitor_staging.py{RESET}")
    print("\n3. Check Supabase data:")
    print("   Open Supabase Dashboard → Table Editor")
    print("   Check 'screening_results' table for new data")

    print(f"\n{GREEN}✨ Deployment Complete!{RESET}")
    print(f"\nYour API is available at: {BOLD}{deployment_url}{RESET}")

    return True

def main():
    """Main deployment workflow."""
    print_banner()

    print(f"{CYAN}This wizard will guide you through:{RESET}")
    print("  1. Creating Supabase database tables")
    print("  2. Verifying deployment readiness")
    print("  3. Running integration tests")
    print("  4. Deploying to Render")
    print("  5. Post-deployment verification")

    print(f"\n{YELLOW}Estimated time: 15-20 minutes{RESET}")

    if not ask_yes_no("\nReady to begin?"):
        print("\nDeployment cancelled.")
        return

    # Execute deployment steps
    steps = [
        ("Create Supabase Tables", step1_supabase_tables),
        ("Verify Deployment Readiness", step2_verify_readiness),
        ("Run Integration Tests", step3_integration_tests),
        ("Deploy to Render", step4_render_deployment),
        ("Post-Deployment Verification", step5_post_deployment)
    ]

    completed_steps = []

    for i, (step_name, step_func) in enumerate(steps, 1):
        try:
            success = step_func()
            if success:
                completed_steps.append(step_name)
                print_success(f"Step {i} completed: {step_name}")
            else:
                print_error(f"Step {i} incomplete: {step_name}")
                if not ask_yes_no("Continue to next step anyway?"):
                    print("\nDeployment stopped.")
                    break
        except KeyboardInterrupt:
            print(f"\n\n{YELLOW}Deployment interrupted by user{RESET}")
            break
        except Exception as e:
            print_error(f"Step {i} error: {e}")
            if not ask_yes_no("Continue despite error?"):
                break

    # Final summary
    print(f"\n{CYAN}{'='*70}{RESET}")
    print(f"{CYAN}{BOLD}  DEPLOYMENT SUMMARY{RESET}")
    print(f"{CYAN}{'='*70}{RESET}\n")

    print(f"Completed: {len(completed_steps)}/{len(steps)} steps")
    for step in completed_steps:
        print_success(step)

    if len(completed_steps) == len(steps):
        print(f"\n{GREEN}{BOLD}🎉 DEPLOYMENT SUCCESSFUL!{RESET}")
        print(f"\n{CYAN}Next steps:{RESET}")
        print("1. Test your API endpoints")
        print("2. Monitor logs and performance")
        print("3. Check Supabase for data flow")
        print("\nDocumentation:")
        print("  - DEPLOYMENT_CHECKLIST.md - Full checklist")
        print("  - QUICK_DEPLOY_GUIDE.md - Detailed guide")
        print("  - docs/DEPLOYMENT_GUIDE.md - Complete procedures")
    else:
        print(f"\n{YELLOW}Deployment partially completed{RESET}")
        print("Review the errors above and refer to DEPLOYMENT_CHECKLIST.md")

    print(f"\n{CYAN}{'='*70}{RESET}\n")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print_error(f"Deployment wizard error: {e}")
        sys.exit(1)
