# Backend Node.js / Next.js — đóng gói thành image chạy bằng Node 22 Alpine
# Quy tắc: cái ÍT ĐỔI để trên, cái HAY ĐỔI để dưới (build lại chỉ mất vài giây)

# [1] Khuôn gốc: ghi RÕ phiên bản, không dùng latest
FROM node:22-alpine

# [2] Đứng ở thư mục app trong hộp
WORKDIR /app

# [3] Phần ít đổi: cài đặt thư viện phụ thuộc trước để tận dụng Docker Layer Cache
COPY package*.json ./
RUN npm install

# [4] Phần HAY ĐỔI để dưới cùng: code của app (.dockerignore đã loại node_modules, .next, .env)
COPY . .

# [5] Đảm bảo thư mục lưu ảnh upload tồn tại
RUN mkdir -p public/storage/covers public/storage/avatars

# [6] Ghi chú: Backend nghe cổng 8000 (trên mọi địa chỉ 0.0.0.0)
EXPOSE 8000

# [7] Lệnh chạy khi hộp khởi động — viết kiểu danh sách
CMD ["npx", "next", "dev", "-H", "0.0.0.0", "-p", "8000"]
