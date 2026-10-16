# Các lệnh chuẩn của dự án: make up / make down / make ps / make logs / make docker-setup
# LƯU Ý: Tất cả các dòng lệnh bên trong target bắt buộc thụt vào bằng 1 phím TAB.

.PHONY: help up down ps logs docker-setup export-db

.DEFAULT_GOAL := help

help:           ## Hiển thị danh sách và mô tả các lệnh sẵn có
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

up:             ## Build image và dựng cả hệ thống (db + backend + frontend)
	docker compose up -d --build

down:           ## Dừng và xoá các hộp (dữ liệu trong volume VẪN CÒN)
	docker compose down

ps:             ## Xem trạng thái các hộp của hệ thống
	docker compose ps

logs:           ## Xem log của backend và frontend (Ctrl+C để thoát)
	docker compose logs -f backend frontend

docker-setup:   ## Nạp lại cấu trúc bảng + dữ liệu mẫu từ docker/mysql/init.sql vào hộp db
	docker compose exec -T db sh -c 'mysql -u root -p"$$MYSQL_ROOT_PASSWORD" "$$MYSQL_DATABASE"' < docker/mysql/init.sql

export-db:      ## Xuất dữ liệu hiện tại từ MySQL ra file docker/mysql/init.sql
	cd frontend-next && node scripts/export-db.mjs
