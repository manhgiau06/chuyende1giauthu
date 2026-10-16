# Hướng Dẫn Tối Ưu Hóa Token Chi Tiết (Token Optimization Guide)

Tài liệu này tổng hợp các chiến lược, quy tắc prompt và phương pháp tối ưu hóa dung lượng Token (Context Window) dành cho lập trình viên và các trợ lý AI Coding Assistant (Antigravity, Cursor, Claude, GPT-4, v.v.).

---

## 1. Mục Tiêu Tối Ưu Token

- **Tiết kiệm chi phí**: Giảm số lượng Token tiêu thụ theo từng request/response.
- **Tăng tốc độ phản hồi (Latency)**: Giảm thời gian chờ Model xử lý thông tin.
- **Mở rộng bộ nhớ hiệu dụng (Context Memory)**: Giữ thông tin quan trọng lâu hơn trong cửa sổ ngữ cảnh, tránh tình trạng AI bị quên ngữ cảnh đầu project.

---

## 2. Quy Tắc Giao Tiếp & Prompting (Prompt Engineering Rules)

### 2.1. Yêu cầu Phản Hồi Súc Tích (Concise Responses)
Yêu cầu AI không giải thích dông dài đối với các câu hỏi code/fix bug đơn giản.
- ❌ *Không dùng*: "Hãy giải thích chi tiết tại sao hàm này lỗi và viết lại toàn bộ file giúp tôi."
- ✅ *Nên dùng*: "Fix lỗi null pointer ở hàm `getUser` trong `UserService.php`. Chỉ trả về snippet diff hoặc phần chỉnh sửa."

### 2.2. Tránh Ghi Đè Lại Toàn Bộ File
Khi yêu cầu sửa code, khuyến khích AI sử dụng phương pháp **Partial Edit / Diff** thay vì viết lại file 500-1000 dòng.
- Đóng góp token nhiều nhất trong cửa sổ ngữ cảnh chính là việc in ra các file code lớn từ đầu đến cuối.

---

## 3. Tối Ưu Sử Dụng Tool & Đọc Code

### 3.1. Giới Hạn Phạm Vi Đọc File (`view_file` / `slice`)
- Không đọc cả file lớn nếu chỉ cần xem 1 hàm.
- Chỉ định rõ khoảng dòng: `StartLine` và `EndLine`.
- Ví dụ: Đọc từ dòng 45 đến dòng 90 thay vì đọc cả file 800 dòng.

### 3.2. Tìm Kiếm Có Mục Tiêu (`grep_search` & `find_by_name`)
- Sử dụng bộ lọc `Includes` hoặc `Extensions` (ví dụ `*.php`, `*.jsx`) để tránh quét các thư mục rác (`node_modules/`, `vendor/`, `dist/`, `.git/`).
- Tận dụng `MatchPerLine: false` khi chỉ muốn tìm danh sách file có chứa từ khóa thay vì in toàn bộ các dòng chứa từ khóa đó.

### 3.3. Giới Hạn Đầu Ra Của Terminal Commands (`run_command`)
- Tránh chạy các lệnh in hàng ngàn dòng log ra màn hình.
- Thêm các cờ giới hạn dòng hoặc lọc output:
  - `git log -n 5` thay vì `git log`
  - `npm test -- --reporter=dot` hoặc lọc kết quả lỗi cụ thể
  - `php artisan test --filter=BookTest` thay vì chạy toàn bộ test suite khi đang fix 1 tính năng.

---

## 4. Quản Lý Subagents & Background Tasks

- **Không Lặp Polling**: Tránh dùng lệnh kiểm tra trạng thái liên tục trong vòng lặp (polling status loop) làm phình to context.
- **Tóm Tắt Log Tự Động**: Yêu cầu Subagent hoặc Task nền chỉ trả về kết quả tóm tắt (Success/Fail + Error Stacktrace ngắn nhất) thay vì dump toàn bộ log stdout.

---

## 5. Mẫu Quy Tắc Cấu Hình System Prompt (`.geminirules` / `.cursorrules`)

Bạn có thể copy đoạn cấu hình dưới đây vào file `.geminirules` hoặc `.cursorrules` ở thư mục gốc project để AI tự động tuân thủ tối ưu Token:

```markdown
# TOKEN & CONTEXT OPTIMIZATION RULES

1. CONCISE OUTPUT:
   - Provide direct, concise answers without fluff or conversational intros/outros.
   - For code modifications, show only the updated lines or diff block. Do NOT rewrite entire unchanged files unless explicitly asked.

2. EFFICIENT TOOL USAGE:
   - Always restrict file viewing ranges (StartLine/EndLine) when looking for specific functions.
   - Filter out `node_modules`, `vendor`, `build`, `dist`, `.git` when searching codebases.
   - Limit log output of executed shell commands to minimum needed lines.

3. LOG & STACKTRACE ANALYSIS:
   - Read only the failure stacktrace line and root cause instead of printing thousands of clean log lines.

4. NO REPETITIVE TEXT:
   - Do not summarize artifact changes in chat if the user can view the artifact directly.
```

---

## 6. Bảng Tóm Tắt Tỷ Lệ Tiết Kiệm Token

| Kỹ Thuật | Token Trước Khi Tối Ưu | Token Sau Khi Tối Ưu | Tỷ Lệ Tiết Kiệm |
| :--- | :--- | :--- | :--- |
| **Sửa file dạng Chunk Diff** | ~3,000 - 10,000 tokens | ~200 - 500 tokens | **90% - 95%** |
| **Đọc File Giới Hạn Dòng** | ~2,000 - 5,000 tokens | ~100 - 400 tokens | **80% - 90%** |
| **Lọc Output Lệnh Shell** | ~5,000 - 20,000 tokens | ~300 - 1,000 tokens | **85% - 95%** |
| **Prompt Phản Hồi Súc Tích** | ~1,000 - 3,000 tokens | ~150 - 400 tokens | **75% - 85%** |
