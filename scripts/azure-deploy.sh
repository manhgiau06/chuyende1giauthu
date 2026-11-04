#!/usr/bin/env bash
set -e

echo "=== 1. TẠO SWAP RAM 4GB ==="
if [ ! -f /swapfile ]; then
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab
    echo ">> Da tao Swap 4GB thanh cong!"
else
    echo ">> Swapfile da ton tai."
fi
free -h

echo "=== 2. CÀI ĐẶT DOCKER & DOCKER COMPOSE ==="
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose-v2 git
sudo usermod -aG docker "$USER"
sudo systemctl enable --now docker
echo ">> Docker:" $(docker --version)
echo ">> Compose:" $(docker compose version)

echo "=== 3. TẢI DỰ ÁN VÀ TRIỂN KHAI ==="
cd /home/azureuser
if [ -d "chuyende1giauthu" ]; then
    echo ">> Thu muc du an da ton tai, dang pull cap nhat..."
    cd chuyende1giauthu
    git pull origin main
else
    echo ">> Dang clone du an tu GitHub..."
    git clone https://github.com/manhgiau06/chuyende1giauthu.git
    cd chuyende1giauthu
fi

if [ ! -f .env ]; then
    cp .env.example .env
fi

echo "=== 4. KHỞI CHẠY HỆ THỐNG BẰNG DOCKER ==="
sudo docker compose down 2>/dev/null || true
sudo docker compose up -d --build

echo "=== 5. TRẠNG THÁI CÁC CONTAINER ==="
sudo docker compose ps

echo ">> HOÀN TẤT TRIỂN KHAI TRÊN AZURE!"
