# CTO Briefing — 2025-10-17

Mục tiêu tổng thể

Xây dựng nền tảng sàng lọc CV bằng GenAI: so khớp CV với Job Requirement, bổ sung điểm tham chiếu Thần số học và DISC (không bắt buộc), cung cấp dashboard kèm ghi chú lý do chọn/loại.
Đảm bảo hệ thống chạy ổn định cả local lẫn CI, có tài liệu/artefact đầy đủ để CTO và reviewer kiểm chứng.

Trạng thái hiện tại

1. Backend
- Flask chạy ổn định (dev server + waitress); `/api/health` trả 200.
- Dependencies đã được chuẩn hóa (`backend/requirements.txt` includes `pandas`, `Flask-Cors`, v.v.).
- `tools/run-functional-tests.py` và workflow GitHub Actions để chạy các endpoint chính đã được thêm; artifacts (logs + raw responses) được upload.
- `docs/debug-logs/summary-for-cto.md` chứa tóm tắt bằng chứng; repository đã được dọn bớt các log tạm thời.

2. Frontend
- Ứng dụng React hiện ở trạng thái staging với mock data; giao diện tiếng Việt đã được cập nhật nhưng chưa tích hợp trực tiếp với API thực.

3. Các phần chưa hoàn thiện
- DISC pipeline thực tế chưa có (CSV/OCR hiện trả 501) — OCR đặt vào backlog tuần sau.
- CV parser AI vẫn là mock; Supabase/DB chưa tích hợp hoàn chỉnh.

Lộ trình tiếp theo

Hoàn thiện backend tính năng chính
- Thay mock CV parsing bằng tích hợp thực (Gemini hoặc fallback rule-based); chuẩn hóa response schema.
- Implement DISC CSV upload (tối thiểu) và ghi nhận trạng thái; OCR có thể lên backlog tuần sau.
- Thêm Supabase database service thật (nếu có credential) và migrate schema `screening_results`.

Liên kết frontend ↔ backend
- Cập nhật hook `useCVParsing` để gọi API thật và xử lý cảnh báo thiếu dữ liệu.
- Bổ sung UI để hiển thị trạng thái CV / Thần số học / DISC; sửa các lỗi tiếng Việt.
- Viết integration smoke test (Playwright/Cypress nhẹ) cho luồng upload CV → hiển thị kết quả.

Hardening & QA

- Mở rộng `run-functional-tests.py` để cover DISC CSV + numerology manual input; chạy cho mỗi PR.
- Thiết lập reporting (Swagger hoặc `README` API) để CTO/team khác dễ theo dõi.
- Chuẩn bị migrations / IaC cho Supabase nếu cần.

Lộ trình song song (2–3 tuần tới)

Tuần 1: Backend hoàn thiện (CV parsing thực, DISC CSV, DB integration).
Tuần 2: Frontend kết nối API, sửa UI, viết integration tests.
Tuần 3: OCR DISC + email/link workflow, bảo mật (auth, rate limit), triển khai staging.

Ghi chú

Mỗi tuần sẽ có bản tóm tắt ngắn gọn cho CTO kèm artifacts (logs, raw responses, test results). Khi anh giao nhiệm vụ tiếp theo, tôi sẽ lên kế hoạch chi tiết cho từng hạng mục.

---

## Update (2025-10-17): Gemini Parsing Activated

The mock CV parsing has been replaced with a real implementation using the Gemini API.

- **Evidence**:
  - Functional test logs are available at `docs/debug-logs/functional-test-cv-parsing.log`.
  - A direct API call validation log is at `docs/debug-logs/real-api-call-test.log`.
- **Fallback Mechanism**: If the `GEMINI_API_KEY` is not available, the system will revert to a rule-based parser.

### Update (2025-10-18): DISC CSV Upload Activated

The backend now supports bulk DISC score uploads via CSV.

- **Evidence**:
  - Unit test results are available at `docs/debug-logs/unit-test-disc-csv.log`.
  - Functional test logs for the endpoint are at `docs/debug-logs/functional-test-disc-csv.log`.
- **Configuration**: The `DISC_CSV_MAX_ROWS` environment variable can be set to limit the number of rows processed per file.

### Update (2025-10-18): DISC OCR Upload Stub

A new endpoint `/api/disc/upload-ocr-image` has been created to handle image-based DISC surveys.

- **Current Status**: This is a **stub implementation**. The endpoint accepts image uploads but does not perform OCR. It returns a response indicating that manual review is required.
- **Next Steps**: Integration with an OCR engine (e.g., Azure Vision, Tesseract) is required for full functionality.
- **Evidence**:
  - Functional test log confirming the stub behavior: `docs/debug-logs/functional-test-disc-ocr-stub.log`.

### Update (2025-10-18): Supabase Integration (Stubbed)

The backend has been integrated with a `DatabaseService` to persist analysis results.

- **Current Status**: This is a **stub implementation**. The service does not connect to a real Supabase instance. Instead, it logs the data that *would* be saved. This allows for end-to-end testing of the application flow without requiring live database credentials.
- **Configuration**: To connect to a real database, `SUPABASE_URL` and `SUPABASE_KEY` must be set in the `backend/.env` file.
- **Evidence**:
  - Unit tests for the service are at `docs/debug-logs/unit-test-database-service.log`.
  - The functional test log at `docs/debug-logs/functional-test-supabase-stub.log` shows the stubbed service being called from the API endpoints.
