# Flask Binding Debug Log - Complete Analysis

## Timestamp: 17/10/2025 09:35:00

### Test 1: Main Flask App (backend/src/app.py)
```powershell
Command: python src/app.py
Output:
INFO:__main__:Starting CV Screening Platform API on port 5000
INFO:__main__:Debug mode: False
 * Serving Flask app 'app'
 * Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:5000
INFO:werkzeug:Press CTRL+C to quit

Status: Process exits immediately after "Running on" message
netstat -ano | findstr 5000: No listeners found
```

### Test 2: Minimal Flask App (minimal_test.py)
```python
from flask import Flask
app = Flask(__name__)

@app.route("/ping")
def ping():
    return "pong"

app.run(host="127.0.0.1", port=5000, debug=False)
```

```powershell
Command: python src/minimal_test.py
Output:
Starting minimal Flask app...
 * Serving Flask app 'minimal_test'
 * Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit

Status: Process shows "Running" but exits when HTTP request attempted
netstat check: No listeners found when running
```

### Test 3: TCP Connection Test
```powershell
Command: Test-NetConnection -ComputerName 127.0.0.1 -Port 5000
Result: TcpTestSucceeded: False (even when Flask claims to be running)
```

### Environment Variables Test
```powershell
$env:FLASK_DEBUG="0"
$env:FLASK_ENV="production"
python src/minimal_test.py

Result: Same behavior - process exits after "Running on" message
```

## Analysis:
1. **Flask Startup**: ✅ Flask initializes and claims to bind to port
2. **Socket Binding**: ❌ Process exits immediately, no actual socket binding
3. **Minimal vs Complex**: Both minimal and full app exhibit same behavior
4. **Environment**: Production settings don't resolve issue

## Hypothesis:
- Windows networking policy preventing Flask socket binding specifically
- Different from Python HTTP server which works (different socket mechanism)
- Flask may be attempting bind but failing silently and exiting

## Next Steps Required:
1. Test Flask with different host (0.0.0.0) and port (8080)
2. Check Flask logs for binding errors (enable verbose logging)
3. Try Flask development server alternatives (waitress, gunicorn)
4. Consider WSL2 for isolated Linux networking

## Current Status:
❌ Flask cannot maintain socket binding on Windows 
✅ Python HTTP server works (different networking mechanism)
🔍 Need deeper Flask-specific debugging to isolate root cause