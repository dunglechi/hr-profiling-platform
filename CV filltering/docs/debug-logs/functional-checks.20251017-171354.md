# Functional checks - 20251017-171354

- Environment: local dev server

## Results

### POST /api/numerology/calculate (full)
- Raw: C:\Users\Admin\Projects\CV filltering\docs\debug-logs\func_numerology_full.20251017-171354.txt
- Status: 0

> Note: This first run used an incorrect payload key (`birthdate` instead of `birth_date`) which caused the request to fail. See the corrected run below for a successful call. The original raw file is retained for audit.

### POST /api/numerology/calculate (missing)
- Raw: C:\Users\Admin\Projects\CV filltering\docs\debug-logs\func_numerology_missing.20251017-171354.txt
- Status: 0

> Note: This test intentionally submitted a payload missing required fields to validate validation behavior; an HTTP 4xx response is expected here.

### POST /api/disc/manual-input
- Raw: C:\Users\Admin\Projects\CV filltering\docs\debug-logs\func_disc_manual.20251017-171354.txt
- Status: 0

### GET /api/disc/test
- Raw: C:\Users\Admin\Projects\CV filltering\docs\debug-logs\func_disc_test.20251017-171354.txt


### Re-run POST /api/numerology/calculate (corrected payload)
- Raw: C:\Users\Admin\Projects\CV filltering\docs\debug-logs\func_numerology_full_corrected.20251017-172633.txt
- Saved at: C:\Users\Admin\Projects\CV filltering\docs\debug-logs\func_numerology_full_corrected.20251017-172633.txt

**Outcome:** Successful. The corrected payload used `birth_date` and the endpoint returned a success response — see the raw file above for details.

