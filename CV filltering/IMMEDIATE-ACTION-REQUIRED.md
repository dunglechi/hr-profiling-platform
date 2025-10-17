# IMMEDIATE ACTION REQUIRED: Windows Defender Exclusions

## User Action Steps (Admin Required)

### Step 1: Open Windows Security
1. Press `Win + I` → Update & Security → Windows Security
2. Click "Virus & threat protection"  
3. Click "Manage settings" under "Virus & threat protection settings"
4. Scroll to "Exclusions" → Click "Add or remove exclusions"

### Step 2: Add These Exclusions (CRITICAL)

#### Folder Exclusions:
- **Project Directory**: `C:\Users\Admin\Projects\CV filltering`
- **Python Installation**: `C:\Python*` (all Python versions)

#### Process Exclusions:
- **Python Executable**: `python.exe`

### Step 3: Re-enable Real-time Protection
1. Return to "Virus & threat protection settings"
2. Turn ON "Real-time protection"
3. Confirm it shows "On" status

### Step 4: Verify Flask Still Works
After completing exclusions, run these commands để verify:

```powershell
cd "C:\Users\Admin\Projects\CV filltering\backend"
python src/app.py
# (in another terminal)
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:5000/api/health
```

**Expected Result:** StatusCode 200 với Windows Defender ENABLED

## Status Check
- [ ] Exclusions configured
- [ ] Real-time protection re-enabled  
- [ ] Flask verified working với Defender ON
- [ ] Evidence logged

**DO NOT PROCEED** until these steps completed and verified với 200 response!