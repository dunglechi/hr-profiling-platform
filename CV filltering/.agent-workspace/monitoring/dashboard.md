# AI Orchestration Health Dashboard

**Last Updated:** {{LAST_UPDATED}}

---

## 📊 System Status

| Metric                | Value | Status |
|-----------------------|-------|--------|
| **Pending Tasks**     | `{{PENDING_TASKS}}`   | {{PENDING_STATUS}}   |
| **Active Agents**     | `{{ACTIVE_AGENTS}}`   | ✅      |
| **Avg. Task Latency** | `{{AVG_LATENCY}}` | {{LATENCY_STATUS}} |
| **Claude API Calls**  | `{{CLAUDE_CALLS}}`  | ✅      |
| **Errors (Last 24h)** | `{{ERROR_COUNT}}`   | {{ERROR_STATUS}}   |

---

## 🚦 Agent-Specific Metrics

| Agent              | Tasks Processed | Errors |
|--------------------|-----------------|--------|
| **GEMINI_CTO**     | `{{GEMINI_TASKS}}`    | `{{GEMINI_ERRORS}}`  |
| **CLAUDE_REVIEWER**| `{{CLAUDE_TASKS}}`    | `{{CLAUDE_ERRORS}}`  |
| **COPILOT_DEV**    | `{{COPILOT_TASKS}}`   | `{{COPILOT_ERRORS}}` |

---

## 📋 Recent Decisions

*Auto-populated from decisions.log*

```
{{RECENT_DECISIONS}}
```