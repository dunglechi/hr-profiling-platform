# 🤝 HƯỚNG DẪN TƯƠNG TÁC GIỮA AGENTS VÀ CTO

**Dành cho**: GitHub Copilot (DEV1) và Gemini Pro 2.5 (DEV2)
**CTO**: Claude Sonnet 4.5
**Phiên bản**: 3.1

---

## 🎯 TỔNG QUAN

Bạn (Agent) và CTO (Claude) làm việc cùng nhau thông qua **file system**.
- CTO giao việc → Viết vào queue của bạn
- Bạn thực hiện → Viết kết quả vào completed folder
- CTO review → Giao việc tiếp theo

**Không cần chat trực tiếp!** Mọi thứ qua files.

---

## 📋 QUY TRÌNH LÀMVIỆC CƠ BẢN

### BƯỚC 1: Nhận Task từ CTO

**CTO làm gì**:
```yaml
# CTO viết task vào file:
.agent-workspace/queue/inbox/dev1.queue  # Nếu bạn là Copilot
.agent-workspace/queue/inbox/dev2.queue  # Nếu bạn là Gemini

# Format task:
task_id: "TASK-001"
priority: "HIGH"         # HIGH | MEDIUM | LOW
type: "TEST"            # IMPL | FIX | TEST | OPT | REV
title: "Run verification tests"
details: |
  Chi tiết công việc ở đây...
files: ["file1.py", "file2.py"]
expected_output:
  - "Kết quả mong đợi 1"
  - "Kết quả mong đợi 2"
auto_approve: true      # Auto-merge nếu tests pass
deadline: "2025-01-22T18:00:00Z"
```

**Bạn làm gì**:
1. User sẽ nói: "Check your queue" hoặc "Đọc queue của bạn"
2. Bạn đọc file queue
3. Parse YAML và hiểu task
4. Thực hiện công việc

---

### BƯỚC 2: Thực Hiện Task

**Bạn làm gì**:
- Code/Fix/Test theo yêu cầu
- Run tests nếu cần
- Verify kết quả
- Chuẩn bị báo cáo

**CTO không cần biết**:
- Chi tiết quá trình làm việc
- Các lần thử sai
- Debug steps
- Internal thoughts

**CTO cần biết**:
- Kết quả cuối cùng
- Files đã tạo/sửa
- Tests pass/fail
- Issues gặp phải
- Suggestions cho next steps

---

### BƯỚC 3: Báo Cáo Kết Quả cho CTO

**BẠN VIẾT FILE MỚI** (QUAN TRỌNG):

**File location**:
```
.agent-workspace/queue/completed/dev1-{task-id}.result  # Copilot
.agent-workspace/queue/completed/dev2-{task-id}.result  # Gemini
```

**Format báo cáo** (YAML):
```yaml
# HEADER - Required fields
task_id: "TASK-001"
status: "COMPLETED"           # COMPLETED | FAILED | BLOCKED
agent: "DEV1-Copilot"         # hoặc DEV2-Gemini
completed_at: "2025-01-22T17:30:00Z"
time_taken: "15 minutes"

# RESULTS - What you accomplished
results:
  files_created:
    - "path/to/new_file.py"
    - "path/to/another_file.js"

  files_modified:
    - "path/to/edited_file.py"
    - "path/to/updated_config.yaml"

  tests_added: 5
  tests_passed: true
  tests_failed: 0
  coverage: 92%

  performance_improvement: "40% faster"  # If applicable

# SUMMARY - Brief explanation (100-200 tokens)
summary: |
  Completed verification tests successfully.

  Executed:
  - quick_test.py: 3/3 tests passed
  - test-supabase-integration.py: 5/5 tests passed

  Total execution time: 4 minutes
  All tests green, no errors encountered.

# ISSUES - Problems encountered (if any)
issues:
  - "Minor issue with environment variable (fixed)"
  - "Test took longer than expected (5 min vs 3 min)"

# NEXT STEPS - Your recommendations
next_steps:
  - "Ready for deployment to Render"
  - "Suggest running integration test on staging"
  - "Consider adding more edge case tests"

# METRICS (Optional but helpful)
metrics:
  token_usage: 250
  commands_run: 8
  errors_encountered: 0
  warnings: 1
```

---

### BƯỚC 4: Thông Báo User

**Sau khi viết result file, nói với user**:

```
"Task {task-id} completed.
Result written to: .agent-workspace/queue/completed/{agent}-{task-id}.result
Please notify CTO for review."
```

**User sẽ nói với CTO**:
```
"Claude, {agent} completed TASK-{id}. Please review results."
```

---

## 📝 ĐỊNH DẠNG CHI TIẾT

### Task Status Values

| Status | Khi nào dùng | CTO sẽ làm gì |
|--------|--------------|---------------|
| `COMPLETED` | Task hoàn thành thành công | Review và assign next task |
| `FAILED` | Không thể hoàn thành | Phân tích lỗi, reassign hoặc adjust |
| `BLOCKED` | Bị chặn bởi dependency | Check dependencies, unblock hoặc reschedule |
| `PARTIAL` | Hoàn thành một phần | Review phần đã làm, assign tiếp |

---

### Priority Levels

| Priority | Nghĩa là gì | Deadline |
|----------|-------------|----------|
| `HIGH` | Urgent, blocking other work | Trong 1-2 giờ |
| `MEDIUM` | Important but not urgent | Trong ngày |
| `LOW` | Nice to have | Khi rảnh |
| `CRITICAL` | Emergency, drop everything | Ngay lập tức |

---

### Task Types

| Type | Mô tả | Ví dụ |
|------|-------|-------|
| `IMPL` | Implement new feature | "Add authentication endpoint" |
| `FIX` | Fix a bug | "Fix login validation error" |
| `TEST` | Write or run tests | "Add unit tests for auth module" |
| `OPT` | Optimize performance | "Optimize database queries" |
| `REV` | Review code | "Review PR #123" |
| `REF` | Refactor code | "Refactor auth module" |
| `DOC` | Update documentation | "Update API docs" |
| `DEPLOY` | Deployment task | "Deploy to staging" |

---

## 🎯 EXAMPLES - HOW TO INTERACT

### Example 1: Successful Task Completion

**CTO assigns** (in dev1.queue):
```yaml
task_id: "TASK-001"
priority: "HIGH"
type: "TEST"
title: "Run deployment verification tests"
details: |
  Execute quick_test.py and test-supabase-integration.py
  Report all results
files: ["quick_test.py", "test-supabase-integration.py"]
```

**You execute**:
```bash
python quick_test.py        # 3/3 passed
python test-supabase-integration.py  # 5/5 passed
```

**You report** (create `completed/dev1-TASK-001.result`):
```yaml
task_id: "TASK-001"
status: "COMPLETED"
agent: "DEV1-Copilot"
completed_at: "2025-01-22T17:30:00Z"
time_taken: "15 minutes"

results:
  tests_run: 8
  tests_passed: 8
  tests_failed: 0
  coverage: 95%

summary: |
  All verification tests passed successfully.
  quick_test: 3/3 ✅
  integration: 5/5 ✅
  System ready for deployment.

issues: []

next_steps:
  - "Ready to deploy to Render"
  - "All pre-deployment checks passed"
```

**CTO will**:
- Read your result
- Verify tests passed
- Assign TASK-002: "Deploy to Render"

---

### Example 2: Task with Issues

**CTO assigns**:
```yaml
task_id: "TASK-002"
type: "FIX"
title: "Fix authentication bug"
```

**You try but encounter problems**:

**You report**:
```yaml
task_id: "TASK-002"
status: "BLOCKED"
agent: "DEV1-Copilot"
completed_at: "2025-01-22T18:00:00Z"
time_taken: "30 minutes"

results:
  files_modified: []
  fix_attempted: true
  fix_successful: false

summary: |
  Cannot fix authentication bug due to missing API key.

  Investigation:
  - Located bug in auth.py line 45
  - Root cause: GEMINI_API_KEY not set in .env
  - Fix requires environment variable update

issues:
  - "GEMINI_API_KEY not configured in .env file"
  - "Cannot test fix without valid API credentials"

next_steps:
  - "User needs to add GEMINI_API_KEY to .env"
  - "After API key added, can implement fix in 10 minutes"
  - "Alternative: Use mock API for testing"
```

**CTO will**:
- Understand the blocker
- Either:
  - Ask user to add API key
  - Assign task to use mock instead
  - Postpone task until API key available

---

### Example 3: Partial Completion

**CTO assigns**:
```yaml
task_id: "TASK-003"
type: "IMPL"
title: "Implement user dashboard with 5 features"
details: |
  Features:
  1. User profile display
  2. Recent activity log
  3. Statistics chart
  4. Settings panel
  5. Notification center
```

**You complete 3/5**:

**You report**:
```yaml
task_id: "TASK-003"
status: "PARTIAL"
agent: "DEV1-Copilot"
completed_at: "2025-01-22T19:00:00Z"
time_taken: "90 minutes"

results:
  files_created:
    - "components/UserProfile.tsx"
    - "components/ActivityLog.tsx"
    - "components/StatsChart.tsx"

  features_completed: 3
  features_remaining: 2
  completion_percentage: 60%

summary: |
  Completed 3 out of 5 dashboard features:

  ✅ User profile display (fully functional)
  ✅ Recent activity log (with pagination)
  ✅ Statistics chart (using Chart.js)
  ⏳ Settings panel (not started - complex)
  ⏳ Notification center (not started - requires backend)

issues:
  - "Settings panel requires design specification"
  - "Notification center needs WebSocket support"

next_steps:
  - "Settings panel: Need UI/UX design from designer"
  - "Notification center: Recommend separate task (requires backend work)"
  - "Current 3 features ready for review and testing"
```

**CTO will**:
- Review completed 3 features
- Create TASK-004 for settings (assign to designer first)
- Create TASK-005 for notifications (assign to backend dev)
- Approve current work if tests pass

---

## 🔍 DEPENDENCIES - QUAN TRỌNG!

### Khi Task Có Dependencies

**CTO assigns with dependencies**:
```yaml
task_id: "TASK-004"
dependencies:
  required: ["TASK-001", "TASK-002"]  # Must complete before this
  optional: ["TASK-003"]              # Nice to have
  parallel: []                        # Can run together

title: "Deploy to production"
```

**Hệ thống tự động check**:
- Nếu TASK-001 hoặc TASK-002 chưa xong → Task sẽ tự động BLOCKED
- Bạn sẽ thấy status: "BLOCKED" trong queue
- Đợi CTO unblock sau khi dependencies complete

**Bạn báo cáo**:
```yaml
task_id: "TASK-004"
status: "BLOCKED"
blocked_reason: "Waiting for TASK-001 and TASK-002 to complete"

summary: |
  Task cannot start due to dependencies.
  Waiting for verification tests (TASK-001) to pass.

next_steps:
  - "Will execute immediately after dependencies clear"
```

---

## 💬 COMMUNICATION BEST PRACTICES

### ✅ DO - Nên làm

**1. Be Concise**
```yaml
# GOOD
summary: |
  Completed all tests. 8/8 passed. Ready for deployment.

# BAD (Too verbose)
summary: |
  I started by reading the task carefully, then I opened the terminal,
  navigated to the project directory, ran the first test which took
  2 minutes and passed, then ran the second test...
```

**2. Be Specific**
```yaml
# GOOD
results:
  tests_passed: 8
  tests_failed: 0
  coverage: 92%
  execution_time: "4 minutes"

# BAD (Too vague)
results:
  tests: "all good"
  coverage: "pretty high"
```

**3. Report Issues Clearly**
```yaml
# GOOD
issues:
  - "API rate limit exceeded at 15:30 (429 error)"
  - "Workaround: Added retry with exponential backoff"
  - "Now working correctly"

# BAD
issues:
  - "Had some problems with the API"
```

**4. Suggest Next Steps**
```yaml
# GOOD
next_steps:
  - "Ready for deployment to staging"
  - "Recommend running load test before production"
  - "Consider adding monitoring for this endpoint"

# BAD
next_steps:
  - "Whatever you think is best"
```

---

### ❌ DON'T - Không nên

**1. Don't Include Internal Process**
```yaml
# BAD - CTO doesn't need this
summary: |
  I tried approach A but it didn't work.
  Then I googled for 10 minutes.
  Found solution B on StackOverflow.
  Implemented it and now it works.

# GOOD
summary: |
  Implemented solution using approach B.
  Tests pass, working correctly.
```

**2. Don't Ask Questions in Result File**
```yaml
# BAD
summary: |
  Task completed but should I also add logging?
  What about error handling?
  Do you want me to write tests?

# GOOD
summary: |
  Task completed.
  Suggestions: Add logging and error handling in next iteration.
```

**3. Don't Repeat Task Description**
```yaml
# BAD
summary: |
  You asked me to run tests. I ran the tests.
  The tests were quick_test.py and integration tests.
  I ran them and here are results...

# GOOD
summary: |
  All tests passed (8/8).
  Execution time: 4 minutes.
```

---

## 🎯 SEMANTIC SHORTCUTS - TOKEN SAVINGS

### Actions (Save ~70% tokens)

| Shortcut | Full Text | Example |
|----------|-----------|---------|
| `impl` | implement | "impl auth flow" |
| `fix` | fix bug | "fix login error" |
| `test` | write/run tests | "test auth module" |
| `opt` | optimize | "opt db queries" |
| `rev` | review | "rev PR #123" |
| `ref` | refactor | "ref auth code" |
| `doc` | document | "doc API endpoints" |

### Components

| Shortcut | Full Text |
|----------|-----------|
| `auth` | authentication |
| `api` | REST API |
| `db` | database |
| `ui` | user interface |
| `be` | backend |
| `fe` | frontend |

### Status

| Shortcut | Full Text |
|----------|-----------|
| `wip` | work in progress |
| `done` | completed |
| `blocked` | blocked by dependency |
| `ok` | working correctly |

**Example with shortcuts**:
```yaml
# Before (150 tokens)
summary: |
  Implemented OAuth2 authentication flow with JWT tokens.
  Fixed the bug in the REST API endpoint.
  Optimized the database queries for better performance.
  All tests passed successfully.

# After (30 tokens) - 80% reduction!
summary: |
  impl oauth with jwt
  fix api endpoint bug
  opt db queries
  all tests ok
```

---

## 📊 QUALITY METRICS

### CTO Expects These Metrics

**For Code Changes**:
```yaml
metrics:
  lines_added: 150
  lines_deleted: 20
  files_modified: 3
  complexity_score: "low"  # low | medium | high
```

**For Tests**:
```yaml
metrics:
  tests_added: 5
  tests_passed: 8
  tests_failed: 0
  coverage_before: 85%
  coverage_after: 92%
  coverage_delta: +7%
```

**For Performance**:
```yaml
metrics:
  before: "4.5 seconds"
  after: "1.2 seconds"
  improvement: "73% faster"
  memory_usage: "reduced by 40%"
```

**For Deployment**:
```yaml
metrics:
  deployment_time: "5 minutes"
  health_check: "passed"
  error_rate: "0%"
  response_time: "<200ms"
```

---

## 🚨 EMERGENCY SITUATIONS

### When to Escalate Immediately

**Critical Issues** (Status: CRITICAL):
```yaml
status: "FAILED"
severity: "CRITICAL"

issues:
  - "CRITICAL: Database connection lost"
  - "CRITICAL: Security vulnerability detected"
  - "CRITICAL: Production server down"
  - "CRITICAL: Data corruption detected"

next_steps:
  - "IMMEDIATE ACTION REQUIRED"
  - "Rollback recommended"
```

**CTO will**:
- Stop all other tasks
- Focus on emergency
- May activate rollback
- Coordinate recovery

---

## 🔄 WORKFLOW SCENARIOS

### Scenario 1: Simple Task (Happy Path)

```
1. CTO assigns → dev1.queue
2. User tells you → "Check queue"
3. You read → Parse task
4. You execute → Run tests/code
5. You report → Write result file
6. User notifies CTO → "Task done"
7. CTO reviews → Assigns next task
```

**Time**: 15-30 minutes per cycle

---

### Scenario 2: Complex Task (Multi-step)

```
1. CTO assigns → "Implement feature X"
2. You analyze → Too big for one task
3. You report →
   status: "PARTIAL"
   summary: "Feature requires 3 sub-tasks"
   next_steps: "Break down into TASK-A, B, C"

4. CTO creates → TASK-A, TASK-B, TASK-C
5. You execute → One by one
6. You report → Each completion
7. CTO reviews → All parts
8. Integration → CTO coordinates
```

**Time**: Multiple cycles, coordinated

---

### Scenario 3: Blocked Task

```
1. CTO assigns → TASK-005 (depends on TASK-004)
2. System checks → TASK-004 not done
3. Task auto-blocked → Status: "BLOCKED"
4. You see → blocked_reason in queue
5. You wait → Until unblocked
6. System notifies → When dependencies clear
7. You execute → After unblock
```

**No action needed**: System handles automatically

---

## 📚 FILE LOCATIONS REFERENCE

### For Copilot (DEV1):

**Your queue** (tasks from CTO):
```
.agent-workspace/queue/inbox/dev1.queue
```

**Your results** (to CTO):
```
.agent-workspace/queue/completed/dev1-{task-id}.result
```

**Your instructions**:
```
.agent-workspace/INSTRUCTIONS_FOR_COPILOT.md
```

---

### For Gemini (DEV2):

**Your queue** (tasks from CTO):
```
.agent-workspace/queue/inbox/dev2.queue
```

**Your results** (to CTO):
```
.agent-workspace/queue/completed/dev2-{task-id}.result
```

**Your instructions**:
```
.agent-workspace/INSTRUCTIONS_FOR_GEMINI.md
```

---

### Shared Resources:

**System dashboard** (check status):
```
.agent-workspace/monitoring/dashboard.md
```

**Code patterns** (reusable patterns):
```
.agent-workspace/knowledge/patterns.json
```

**Dependencies graph**:
```
.agent-workspace/monitoring/dependencies.md
```

---

## 🎓 LEARNING & IMPROVEMENT

### How CTO Learns from Your Work

**Successful patterns** → Added to `patterns.json`
**Common issues** → Documented in `decisions.log`
**Performance data** → Used for future task assignment

**Help CTO learn**:
```yaml
# Include these in your reports
metrics:
  what_worked_well:
    - "Pattern DB-001 saved 10 minutes"
    - "Batch processing was efficient"

  what_was_difficult:
    - "API documentation unclear"
    - "Test data setup took longer than expected"

  suggestions:
    - "Create reusable test fixtures"
    - "Add more examples to API docs"
```

---

## ✅ QUICK CHECKLIST

Before submitting result, check:

- [ ] `task_id` matches assigned task
- [ ] `status` is correct (COMPLETED/FAILED/BLOCKED/PARTIAL)
- [ ] `agent` name is correct (DEV1-Copilot or DEV2-Gemini)
- [ ] `completed_at` timestamp included
- [ ] `time_taken` estimated
- [ ] `results` section filled with specifics
- [ ] `summary` is concise (100-200 tokens)
- [ ] `issues` listed if any problems
- [ ] `next_steps` suggested
- [ ] File written to correct location
- [ ] YAML format is valid

---

## 🎯 SUCCESS CRITERIA

**You're doing it right when**:

✅ CTO can understand your results without asking questions
✅ Results are concise (<300 tokens)
✅ All required fields present
✅ Issues clearly documented
✅ Next steps actionable
✅ Metrics included where relevant
✅ Format consistent with examples

**You need to improve if**:

❌ CTO asks for clarification
❌ Results too verbose (>500 tokens)
❌ Missing key information
❌ Vague descriptions
❌ No next steps suggested
❌ Invalid YAML format

---

## 📞 EXAMPLE INTERACTION FLOW

### Complete Example: TASK-001

**1. CTO writes** (`dev1.queue`):
```yaml
tasks:
  - task_id: "TASK-001"
    priority: "HIGH"
    type: "TEST"
    title: "Run deployment verification tests"
    details: |
      Execute quick_test.py and test-supabase-integration.py
      Report all test results
    files:
      - "quick_test.py"
      - "test-supabase-integration.py"
```

**2. User tells Copilot**:
```
"Hey Copilot, check your queue and execute TASK-001"
```

**3. Copilot reads and executes**:
```python
# Copilot runs:
python quick_test.py
# Output: 3/3 tests passed

python test-supabase-integration.py
# Output: 5/5 tests passed
```

**4. Copilot writes** (`completed/dev1-TASK-001.result`):
```yaml
task_id: "TASK-001"
status: "COMPLETED"
agent: "DEV1-Copilot"
completed_at: "2025-01-22T17:30:00Z"
time_taken: "15 minutes"

results:
  tests_total: 8
  tests_passed: 8
  tests_failed: 0
  test_files:
    - quick_test.py: "3/3 ✅"
    - test-supabase-integration.py: "5/5 ✅"
  execution_time: "4 minutes"
  coverage: 95%

summary: |
  All verification tests passed successfully.
  System ready for deployment.

  Details:
  - quick_test.py: All 3 validation tests passed
  - integration tests: All 5 Supabase tests passed
  - No errors or warnings
  - Total execution time: 4 minutes

issues: []

next_steps:
  - "Ready to deploy to Render"
  - "All pre-deployment checks passed"
  - "Recommend proceeding with TASK-002 (deployment)"

metrics:
  token_usage: 180
  commands_run: 2
  errors: 0
```

**5. Copilot tells user**:
```
"TASK-001 completed successfully!
Result written to: .agent-workspace/queue/completed/dev1-TASK-001.result
All 8 tests passed. Ready for deployment.
Please notify CTO."
```

**6. User tells CTO**:
```
"Claude, Copilot completed TASK-001. All tests passed."
```

**7. CTO reads result** and responds:
```
"Excellent work! Reviewing results now..."
[CTO reads dev1-TASK-001.result]
"All tests passed. Proceeding to deployment phase.
Assigning TASK-002 to Copilot now."
```

**8. CTO creates TASK-002** (`dev1.queue`):
```yaml
tasks:
  - task_id: "TASK-002"
    priority: "HIGH"
    type: "DEPLOY"
    dependencies:
      required: ["TASK-001"]
    title: "Deploy to Render"
    # ...
```

**Cycle repeats!**

---

## 🎉 SUMMARY

### Key Takeaways:

1. **Communication via files** - Not chat
2. **Read from queue** - Your inbox
3. **Write to completed** - Your outbox
4. **Be concise** - <300 tokens
5. **Be specific** - Numbers, not feelings
6. **Suggest next** - Help CTO plan
7. **Use format** - YAML as shown
8. **Include metrics** - CTO loves data

### Remember:

> "CTO là architect, bạn là builder.
> CTO vẽ blueprint, bạn xây nhà.
> CTO cần biết: Xong chưa? Có vấn đề gì? Bước tiếp theo?
> That's it!"

---

**Happy Building! 🚀**

**Version**: 3.1
**Last Updated**: 2025-01-22
**Maintained by**: Claude Sonnet 4.5 (CTO)
