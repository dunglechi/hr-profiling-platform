# Windows Defender Exclusion Configuration Guide

## Thời gian: 16/10/2025 17:39

## Manual Windows Defender Exclusion Setup (Requires Admin)

### Step 1: Open Windows Security
1. Press `Win + I` → Update & Security → Windows Security
2. Click "Virus & threat protection"
3. Click "Manage settings" under "Virus & threat protection settings"
4. Scroll down to "Exclusions" → Click "Add or remove exclusions"

### Step 2: Add File/Folder Exclusions
Add these paths (click "Add an exclusion" → "Folder" or "File"):

#### Python Executables
- `C:\Python310\python.exe` (adjust version number)
- `C:\Python311\python.exe` (if multiple versions)
- `%LOCALAPPDATA%\Programs\Python\Python*\python.exe`

#### Project Directory
- `C:\Users\Admin\Projects\CV filltering`

#### Virtual Environment (if exists)
- `C:\Users\Admin\Projects\CV filltering\.venv`
- `C:\Users\Admin\Projects\CV filltering\backend\.venv`

### Step 3: Add Process Exclusions
Add these processes (click "Add an exclusion" → "Process"):
- `python.exe`
- `flask.exe` (if exists)

### Step 4: Port Exclusions (if available)
- Windows Defender may not support port exclusions directly
- Alternative: Use Windows Firewall Advanced settings

## Verification Commands

After adding exclusions, run these to verify:

```powershell
# Check current exclusions
Get-MpPreference | Select-Object -ExpandProperty ExclusionPath

# Test Flask with Real-time protection enabled
curl http://127.0.0.1:5000/api/health
```

## Alternative Solutions if Exclusions Don't Work

1. **WSL2 Development Environment**
2. **Docker Container Development**
3. **Different Antivirus Software**
4. **Windows Sandbox for Development**

## Current Evidence of Issue

### Before Exclusions (Windows Defender DISABLED)
- Flask Health Endpoint: ✅ 200 OK
- API Discovery: ✅ Working
- Timestamp: 16/10/2025 17:37:52

### After Exclusions (Windows Defender ENABLED)
- Status: PENDING VERIFICATION
- Commands ready for testing