# 📚 Hệ Thống Quản Lý Thư Viện Tri Thức Số (Chuyên Đề 1)

Hệ thống quản lý thư viện số tích hợp mượn trả sách (kèm mã vạch Barcode & thẻ thư viện QR), đặt trước sách khi hết bản sao, mua sách trực tuyến, thanh toán VietQR tự động và nhắc hạn trả sách.

- **Frontend (FE)**: React 19 + Vite + Tailwind CSS (`frontend/` — cổng `5173`)
- **Backend (BE)**: Node.js + Next.js App Router API (`frontend-next/` — cổng `8000`)
- **Cơ sở dữ liệu (DB)**: MySQL 8.4 (`docker/mysql/init.sql` — cổng `3306` nội bộ / `3307` máy ngoài)
- **Caddy Reverse Proxy**: Lắng nghe cổng chuẩn `80` (tự động chuyển hướng `/api/*` và `/storage/*` vào Backend, còn lại vào Frontend)

---

## ☁️ HƯỚNG DẪN TRIỂN KHAI LÊN AZURE VIRTUAL MACHINE (Ubuntu 24.04)

Dành riêng cho máy ảo Azure (hoặc bất kỳ máy chủ Linux VPS nào):

### 1. Mở cổng mạng trên Azure Portal (Rất quan trọng!)
Mặc định máy ảo Azure chỉ mở cổng 22 (SSH). Để mọi người truy cập được trang web:
1. Vào **Azure Portal** -> Chọn máy ảo của bạn (`chuyende1`).
2. Vào mục **Networking** (hoặc **Network settings**).
3. Nhấn **Add inbound port rule**:
   - **Destination port ranges**: `80, 5173, 8000` (hoặc tối thiểu `80`)
   - **Protocol**: `TCP`
   - **Action**: `Allow`
   - **Priority**: `300`
   - **Name**: `Allow_Web_Traffic`
4. Nhấn **Add**.

---

### 2. Đăng nhập SSH vào máy ảo Azure
Mở Terminal trên máy tính của bạn và SSH vào máy ảo:
```bash
ssh <username>@20.196.136.171
# (Thay <username> bằng tên đăng nhập lúc tạo VM, ví dụ: azureuser hoặc ubuntu)
```

---

### 3. Cài đặt Docker & Tạo Swap RAM (Cực kỳ quan trọng cho gói 1GB RAM)
Vì máy ảo Azure gói `B2ats v2` có 1 GiB RAM, ta cần tạo 4GB Swap để máy không bị tràn RAM khi dựng Docker:

```bash
# Cập nhật hệ điều hành & cài đặt Docker, Git
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git

# Tạo 4GB Swap RAM (chạy mất 5 giây)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Thêm quyền chạy Docker cho user hiện tại
sudo usermod -aG docker $USER
newgrp docker
```

---

### 4. Clone dự án và khởi chạy Docker
```bash
# Tải mã nguồn từ GitHub
git clone https://github.com/manhgiau06/chuyende1giauthu.git
cd chuyende1giauthu

# Tạo file .env từ file mẫu
cp .env.example .env

# Khởi động toàn bộ hệ thống
docker compose up -d --build
```
> **Dữ liệu ban đầu**: Container MySQL 8.4 sẽ **tự động nạp sẵn toàn bộ 17 đầu sách, tài khoản và giao dịch mẫu** từ file `docker/mysql/init.sql`.

---

### 5. Truy cập ứng dụng từ trình duyệt
Mở trình duyệt trên máy tính hoặc điện thoại:
👉 **`http://20.196.136.171`** (Cổng 80 - Không cần gõ số cổng!)

*(Hoặc nếu muốn vào trực tiếp từng cổng: React FE `http://20.196.136.171:5173`, Next.js BE `http://20.196.136.171:8000`)*

---

## 💻 CHẠY TRÊN MÁY CÁ NHÂN (LOCAL / LAPTOP)

### Cách 1: Chạy bằng Docker
```bash
git clone https://github.com/manhgiau06/chuyende1giauthu.git
cd chuyende1giauthu
cp .env.example .env
docker compose up -d --build
```
- Truy cập qua Caddy: [http://localhost](http://localhost) (cổng 80)
- Hoặc cổng React FE: [http://localhost:5173](http://localhost:5173)

### Cách 2: Chạy trực tiếp (Node.js + MySQL có sẵn)
1. **Import CSDL**: Tạo database `chuyende1` và import file `docker/mysql/init.sql`.
2. **Backend**:
   ```bash
   cd frontend-next && npm install && npx next dev -H 127.0.0.1 -p 8000
   ```
3. **Frontend**:
   ```bash
   cd frontend && npm install && npm run dev -- --host 127.0.0.1 --port 5173
   ```

---

## 🔑 Tài khoản đăng nhập có sẵn

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@thuvien.vn` | `password` |
| **Thủ thư (Librarian)** | `thuthu@thuvien.vn` | `password` |
| **Độc giả (Reader)** | `docgia1@gmail.com` | `password` |

---

## 🛠️ Các lệnh quản lý Docker nhanh

```bash
docker compose up -d --build    # Bật và build lại toàn bộ hệ thống
docker compose ps               # Xem trạng thái hoạt động của các hộp
docker compose logs -f          # Xem nhật ký (logs) theo thời gian thực
docker compose down             # Dừng hệ thống (dữ liệu DB và uploads vẫn an toàn)
```
