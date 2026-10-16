# 📚 Hệ Thống Quản Lý Thư Viện Tri Thức Số (Chuyên Đề 1)

Hệ thống quản lý thư viện số tích hợp mượn trả sách (kèm mã vạch Barcode & thẻ thư viện QR), đặt trước sách khi hết bản sao, mua sách trực tuyến, thanh toán VietQR tự động và nhắc hạn trả sách.

- **Frontend (FE)**: React 19 + Vite + Tailwind CSS (`frontend/` — cổng `5173`)
- **Backend (BE)**: Node.js + Next.js App Router API (`frontend-next/` — cổng `8000`)
- **Cơ sở dữ liệu (DB)**: MySQL 8.4 (`docker/mysql/init.sql` — cổng `3306` nội bộ / `3307` máy ngoài)

---

## 🚀 Cách 1: Chạy trên máy khác bằng Docker (Khuyên dùng - Nhanh & Tự động 100%)

Máy mới chỉ cần cài đặt **Git** và **Docker Desktop** (không cần cài Node.js, PHP hay WampServer/XAMPP).

### Bước 1: Tải mã nguồn về máy
```bash
git clone https://github.com/manhgiau06/chuyende1giauthu.git
cd chuyende1giauthu
```

### Bước 2: Tạo file cấu hình `.env`
Sao chép file mẫu `.env.example` thành `.env`:
- **Trên Windows (PowerShell / CMD)**:
  ```powershell
  copy .env.example .env
  ```
- **Trên Linux / macOS / Git Bash / WSL**:
  ```bash
  cp .env.example .env
  ```
*(Mở file `.env` và kiểm tra hoặc đặt mật khẩu bất kỳ cho `DB_PASSWORD` và `DB_ROOT_PASSWORD`, ví dụ `123456`).*

### Bước 3: Khởi chạy toàn bộ hệ thống (MySQL + Backend + Frontend)
```bash
docker compose up -d --build
```
*(Nếu dùng WSL / Linux / Git Bash có cài `make`, bạn chỉ cần gõ: `make up`)*

> **Lưu ý**: Trong lần chạy đầu tiên, hộp `db` (MySQL 8.4) sẽ **tự động nạp toàn bộ bảng và dữ liệu mẫu** từ file `docker/mysql/init.sql`. Nếu muốn nạp lại dữ liệu gốc bất kỳ lúc nào, chạy:
> ```bash
> make docker-setup
> # Hoặc:
> docker compose exec -T db sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' < docker/mysql/init.sql
> ```

### Bước 4: Truy cập ứng dụng
- **Giao diện người dùng (React Frontend)**: [http://localhost:5173](http://localhost:5173)
- **Cổng API & Next.js Backend**: [http://localhost:8000](http://localhost:8000)

---

## 💻 Cách 2: Chạy thủ công không dùng Docker (Node.js + MySQL có sẵn trên máy)

Nếu máy mới không cài Docker mà dùng trực tiếp **Node.js (v20+)** và **MySQL (XAMPP / WampServer)**:

1. **Nhập cơ sở dữ liệu**:
   - Mở phpMyAdmin hoặc MySQL Workbench, tạo database tên là `chuyende1`.
   - Import file `docker/mysql/init.sql` vào database `chuyende1`.
2. **Chạy Backend (Node.js / Next.js - Cổng 8000)**:
   ```bash
   cd frontend-next
   npm install
   npx next dev -H 127.0.0.1 -p 8000
   ```
3. **Chạy Frontend (React Vite - Cổng 5173)**:
   Mở một cửa sổ terminal thứ 2:
   ```bash
   cd frontend
   npm install
   npm run dev -- --host 127.0.0.1 --port 5173
   ```

---

## 🔑 Tài khoản đăng nhập có sẵn

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@thuvien.vn` | `password` |
| **Thủ thư (Librarian)** | `thuthu@thuvien.vn` | `password` |
| **Độc giả (Reader)** | `docgia1@gmail.com` | `password` |

---

## 🛠️ Các lệnh quản lý Docker nhanh (`Makefile`)

| Lệnh `make` | Lệnh `docker compose` tương đương | Tác dụng |
| :--- | :--- | :--- |
| `make up` | `docker compose up -d --build` | Dựng và chạy ngầm toàn bộ 3 hộp (`db`, `backend`, `frontend`) |
| `make ps` | `docker compose ps` | Xem trạng thái hoạt động của các hộp |
| `make logs` | `docker compose logs -f backend frontend` | Xem nhật ký chạy trực tiếp |
| `make down` | `docker compose down` | Tắt các hộp (dữ liệu sách và ảnh upload vẫn được giữ nguyên) |
| `make docker-setup` | *(xem trong Makefile)* | Khôi phục lại dữ liệu mẫu ban đầu từ `docker/mysql/init.sql` |
