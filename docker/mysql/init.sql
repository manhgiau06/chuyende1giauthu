-- Khởi tạo CSDL chuyende1 cho Docker MySQL 8.4
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `book_copies`;
CREATE TABLE `book_copies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `book_id` bigint unsigned NOT NULL,
  `barcode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `condition` enum('new','good','fair') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'good',
  `status` enum('available','borrowed','lost','maintenance') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `book_copies_barcode_unique` (`barcode`),
  KEY `book_copies_book_id_foreign` (`book_id`)
) ENGINE=MyISAM AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (1, 1, 'BC-1-001', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-22 06:50:02.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (2, 1, 'BC-1-002', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (3, 1, 'BC-1-003', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-22 06:50:03.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (4, 1, 'BC-1-004', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (5, 1, 'BC-1-005', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (6, 2, 'BC-2-001', 'good', 'borrowed', '2026-09-21 09:47:04.000', '2026-09-22 07:34:34.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (7, 2, 'BC-2-002', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (8, 2, 'BC-2-003', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (9, 3, 'BC-3-001', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (10, 3, 'BC-3-002', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (11, 3, 'BC-3-003', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (12, 3, 'BC-3-004', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (13, 4, 'BC-4-001', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (14, 4, 'BC-4-002', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (15, 4, 'BC-4-003', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (16, 4, 'BC-4-004', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (17, 4, 'BC-4-005', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (18, 4, 'BC-4-006', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (19, 5, 'BC-5-001', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (20, 5, 'BC-5-002', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (21, 5, 'BC-5-003', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (22, 5, 'BC-5-004', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (23, 5, 'BC-5-005', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (24, 6, 'BC-6-001', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (25, 6, 'BC-6-002', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (26, 6, 'BC-6-003', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (27, 6, 'BC-6-004', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (28, 7, 'BC-7-001', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (29, 7, 'BC-7-002', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (30, 7, 'BC-7-003', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (31, 7, 'BC-7-004', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (32, 7, 'BC-7-005', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (33, 7, 'BC-7-006', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (34, 8, 'BC-8-001', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (35, 8, 'BC-8-002', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (36, 8, 'BC-8-003', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (37, 8, 'BC-8-004', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (38, 9, 'BC-9-001', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (39, 9, 'BC-9-002', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (40, 9, 'BC-9-003', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (41, 9, 'BC-9-004', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (42, 9, 'BC-9-005', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (43, 10, 'BC-10-001', 'good', 'borrowed', '2026-09-21 09:47:04.000', '2026-09-22 07:37:00.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (44, 10, 'BC-10-002', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (45, 10, 'BC-10-003', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (46, 11, 'BC-11-001', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (47, 11, 'BC-11-002', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (48, 11, 'BC-11-003', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (49, 11, 'BC-11-004', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (50, 12, 'BC-12-001', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (51, 12, 'BC-12-002', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (52, 12, 'BC-12-003', 'good', 'available', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (53, 13, 'BC-13-001', 'good', 'available', '2026-09-22 09:05:46.000', '2026-09-22 09:05:46.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (54, 13, 'BC-13-002', 'good', 'available', '2026-09-22 09:05:46.000', '2026-09-22 09:05:46.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (55, 13, 'BC-13-003', 'good', 'available', '2026-09-22 09:05:46.000', '2026-09-22 09:05:46.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (56, 14, 'BC-14-001', 'good', 'available', '2026-09-22 09:06:16.000', '2026-09-22 09:06:16.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (57, 14, 'BC-14-002', 'good', 'available', '2026-09-22 09:06:16.000', '2026-09-22 09:06:16.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (58, 14, 'BC-14-003', 'good', 'available', '2026-09-22 09:06:16.000', '2026-09-22 09:06:16.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (59, 15, 'BC-15-001', 'good', 'available', '2026-09-22 09:06:16.000', '2026-09-22 09:06:16.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (60, 15, 'BC-15-002', 'good', 'available', '2026-09-22 09:06:16.000', '2026-09-22 09:06:16.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (61, 15, 'BC-15-003', 'good', 'available', '2026-09-22 09:06:16.000', '2026-09-22 09:06:16.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (62, 16, 'BC-16-001', 'good', 'available', '2026-09-22 09:11:44.000', '2026-09-22 09:11:44.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (63, 16, 'BC-16-002', 'good', 'available', '2026-09-22 09:11:44.000', '2026-09-22 09:11:44.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (64, 17, 'BC-17-001', 'good', 'available', '2026-09-22 09:26:00.000', '2026-09-22 09:26:00.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (65, 17, 'BC-17-002', 'good', 'available', '2026-09-22 09:26:00.000', '2026-09-22 09:26:00.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (66, 17, 'BC-17-003', 'good', 'available', '2026-09-22 09:26:00.000', '2026-09-22 09:26:00.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (67, 18, 'BC-18-001', 'good', 'borrowed', '2026-09-22 09:27:08.000', '2026-10-12 09:45:35.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (68, 18, 'BC-18-002', 'good', 'available', '2026-09-22 09:27:08.000', '2026-09-22 09:27:08.000');
INSERT INTO `book_copies` (`id`, `book_id`, `barcode`, `condition`, `status`, `created_at`, `updated_at`) VALUES (69, 18, 'BC-18-003', 'good', 'available', '2026-09-22 09:27:08.000', '2026-09-22 09:27:08.000');

DROP TABLE IF EXISTS `book_inventories`;
CREATE TABLE `book_inventories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `book_id` bigint unsigned NOT NULL,
  `stock_quantity` int NOT NULL DEFAULT '0',
  `reserved_quantity` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `book_inventories_book_id_unique` (`book_id`)
) ENGINE=MyISAM AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `book_inventories` (`id`, `book_id`, `stock_quantity`, `reserved_quantity`, `created_at`, `updated_at`) VALUES (1, 1, 15, 2, '2026-09-21 09:47:04.000', '2026-09-22 08:54:15.000');
INSERT INTO `book_inventories` (`id`, `book_id`, `stock_quantity`, `reserved_quantity`, `created_at`, `updated_at`) VALUES (2, 2, 10, 8, '2026-09-21 09:47:04.000', '2026-09-22 09:03:49.000');
INSERT INTO `book_inventories` (`id`, `book_id`, `stock_quantity`, `reserved_quantity`, `created_at`, `updated_at`) VALUES (3, 3, 12, 2, '2026-09-21 09:47:04.000', '2026-09-22 08:49:31.000');
INSERT INTO `book_inventories` (`id`, `book_id`, `stock_quantity`, `reserved_quantity`, `created_at`, `updated_at`) VALUES (4, 4, 25, 0, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_inventories` (`id`, `book_id`, `stock_quantity`, `reserved_quantity`, `created_at`, `updated_at`) VALUES (5, 5, 30, 0, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_inventories` (`id`, `book_id`, `stock_quantity`, `reserved_quantity`, `created_at`, `updated_at`) VALUES (6, 6, 18, 0, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_inventories` (`id`, `book_id`, `stock_quantity`, `reserved_quantity`, `created_at`, `updated_at`) VALUES (7, 7, 30, 0, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_inventories` (`id`, `book_id`, `stock_quantity`, `reserved_quantity`, `created_at`, `updated_at`) VALUES (8, 8, 20, 1, '2026-09-21 09:47:04.000', '2026-09-22 08:49:44.000');
INSERT INTO `book_inventories` (`id`, `book_id`, `stock_quantity`, `reserved_quantity`, `created_at`, `updated_at`) VALUES (9, 9, 22, 0, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_inventories` (`id`, `book_id`, `stock_quantity`, `reserved_quantity`, `created_at`, `updated_at`) VALUES (10, 10, 15, 0, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_inventories` (`id`, `book_id`, `stock_quantity`, `reserved_quantity`, `created_at`, `updated_at`) VALUES (11, 11, 16, 1, '2026-09-21 09:47:04.000', '2026-09-22 08:49:51.000');
INSERT INTO `book_inventories` (`id`, `book_id`, `stock_quantity`, `reserved_quantity`, `created_at`, `updated_at`) VALUES (12, 12, 10, 0, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_inventories` (`id`, `book_id`, `stock_quantity`, `reserved_quantity`, `created_at`, `updated_at`) VALUES (13, 13, 10, 0, '2026-09-22 09:05:46.000', '2026-09-22 09:05:46.000');
INSERT INTO `book_inventories` (`id`, `book_id`, `stock_quantity`, `reserved_quantity`, `created_at`, `updated_at`) VALUES (14, 14, 10, 0, '2026-09-22 09:06:16.000', '2026-09-22 09:06:16.000');
INSERT INTO `book_inventories` (`id`, `book_id`, `stock_quantity`, `reserved_quantity`, `created_at`, `updated_at`) VALUES (15, 15, 10, 1, '2026-09-22 09:06:16.000', '2026-09-26 08:20:03.000');
INSERT INTO `book_inventories` (`id`, `book_id`, `stock_quantity`, `reserved_quantity`, `created_at`, `updated_at`) VALUES (16, 16, 5, 0, '2026-09-22 09:11:44.000', '2026-09-22 09:11:44.000');
INSERT INTO `book_inventories` (`id`, `book_id`, `stock_quantity`, `reserved_quantity`, `created_at`, `updated_at`) VALUES (17, 17, 10, 0, '2026-09-22 09:26:00.000', '2026-09-22 09:26:00.000');
INSERT INTO `book_inventories` (`id`, `book_id`, `stock_quantity`, `reserved_quantity`, `created_at`, `updated_at`) VALUES (18, 18, 10, 1, '2026-09-22 09:27:08.000', '2026-10-12 09:45:43.000');

DROP TABLE IF EXISTS `book_reservations`;
CREATE TABLE `book_reservations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `book_id` bigint unsigned NOT NULL,
  `reader_id` bigint unsigned NOT NULL,
  `status` enum('pending','notified','fulfilled','cancelled','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `priority_number` int NOT NULL DEFAULT '1',
  `reserved_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `notified_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `book_reservations_book_id_foreign` (`book_id`),
  KEY `book_reservations_reader_id_foreign` (`reader_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `book_reviews`;
CREATE TABLE `book_reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `book_id` bigint unsigned NOT NULL,
  `reader_id` bigint unsigned NOT NULL,
  `rating` tinyint NOT NULL DEFAULT '5',
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `book_reviews_book_id_foreign` (`book_id`),
  KEY `book_reviews_reader_id_foreign` (`reader_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `book_reviews` (`id`, `book_id`, `reader_id`, `rating`, `comment`, `created_at`, `updated_at`) VALUES (1, 1, 3, 5, 'Sách cực kỳ chất lượng, giải thích rất chi tiết về mã sạch!', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_reviews` (`id`, `book_id`, `reader_id`, `rating`, `comment`, `created_at`, `updated_at`) VALUES (2, 1, 4, 5, 'Cuốn sách gối đầu giường không thể thiếu cho dân dev!', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_reviews` (`id`, `book_id`, `reader_id`, `rating`, `comment`, `created_at`, `updated_at`) VALUES (3, 4, 3, 5, 'Tác phẩm thiếu nhi tuyệt vời, đọc lại vẫn rất giàu cảm xúc!', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_reviews` (`id`, `book_id`, `reader_id`, `rating`, `comment`, `created_at`, `updated_at`) VALUES (4, 7, 5, 5, 'Bài học ứng xử và giao tiếp rất thiết thực trong cuộc sống.', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `book_reviews` (`id`, `book_id`, `reader_id`, `rating`, `comment`, `created_at`, `updated_at`) VALUES (5, 17, 3, 5, 'hello', '2026-09-22 09:41:39.000', '2026-09-22 09:41:39.000');

DROP TABLE IF EXISTS `books`;
CREATE TABLE `books` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint unsigned NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `author` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isbn` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `publisher` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `publish_year` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `cover_image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sale_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `is_borrowable` tinyint(1) NOT NULL DEFAULT '1',
  `is_salable` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `books_category_id_foreign` (`category_id`)
) ENGINE=MyISAM AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `isbn`, `publisher`, `publish_year`, `description`, `cover_image`, `sale_price`, `is_borrowable`, `is_salable`, `created_at`, `updated_at`) VALUES (1, 1, 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '9780132350884', 'Prentice Hall', 2008, 'Cuốn sách kinh điển về quy chuẩn mã sạch, refactoring và nguyên lý lập trình phần mềm vững chắc.', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80', 250000, 1, 1, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `isbn`, `publisher`, `publish_year`, `description`, `cover_image`, `sale_price`, `is_borrowable`, `is_salable`, `created_at`, `updated_at`) VALUES (2, 1, 'Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', '9780201633610', 'Addison-Wesley', 1994, 'Tài liệu gối đầu giường về 23 thiết kế mẫu Gang of Four dành cho lập trình viên hướng đối tượng.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', 320000, 1, 1, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `isbn`, `publisher`, `publish_year`, `description`, `cover_image`, `sale_price`, `is_borrowable`, `is_salable`, `created_at`, `updated_at`) VALUES (3, 1, 'The Pragmatic Programmer: Your Journey to Mastery', 'David Thomas, Andrew Hunt', '9780135957059', 'Addison-Wesley', 2019, 'Các tư duy thực tế và trải nghiệm quý báu giúp nâng tầm kỹ năng kỹ sư phần mềm chuyên nghiệp.', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80', 290000, 1, 1, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `isbn`, `publisher`, `publish_year`, `description`, `cover_image`, `sale_price`, `is_borrowable`, `is_salable`, `created_at`, `updated_at`) VALUES (4, 2, 'Dế Mèn Phiêu Lưu Ký', 'Tô Hoài', '9786042123456', 'NXB Kim Đồng', 2019, 'Kiệt tác truyện thiếu nhi nổi tiếng của nhà văn Tô Hoài về tình bạn và tinh thần phiêu lưu kiên cường.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', 65000, 1, 1, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `isbn`, `publisher`, `publish_year`, `description`, `cover_image`, `sale_price`, `is_borrowable`, `is_salable`, `created_at`, `updated_at`) VALUES (5, 2, 'Nhà Giả Kim (The Alchemist)', 'Paulo Coelho', '9786045638891', 'NXB Hội Nhà Văn', 2020, 'Hành trình đuổi theo ước mơ và lắng nghe nhịp đập trái tim của chàng chăn cừu Santiago.', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80', 79000, 1, 1, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `isbn`, `publisher`, `publish_year`, `description`, `cover_image`, `sale_price`, `is_borrowable`, `is_salable`, `created_at`, `updated_at`) VALUES (6, 2, 'Mắt Biếc', 'Nguyễn Nhật Ánh', '9786041088892', 'NXB Trẻ', 2019, 'Câu chuyện tình cảm trong sáng đầy hoài niệm của Ngạn và Hà Lan tại làng Đo Đo.', 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80', 110000, 1, 1, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `isbn`, `publisher`, `publish_year`, `description`, `cover_image`, `sale_price`, `is_borrowable`, `is_salable`, `created_at`, `updated_at`) VALUES (7, 4, 'Đắc Nhân Tâm', 'Dale Carnegie', '9786045678901', 'NXB Tổng hợp TP.HCM', 2021, 'Nghệ thuật thu phục lòng người và phát triển kỹ năng giao tiếp thành công nhất mọi thời đại.', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80', 95000, 1, 1, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `isbn`, `publisher`, `publish_year`, `description`, `cover_image`, `sale_price`, `is_borrowable`, `is_salable`, `created_at`, `updated_at`) VALUES (8, 4, 'Tuổi Trẻ Đáng Giá Bao Nhiêu?', 'Rosie Nguyễn', '9786045638823', 'NXB Hội Nhà Văn', 2018, 'Cuốn sách khơi dậy cảm hứng tự học, khám phá bản thân và sống trọn vẹn từng khoảnh khắc tuổi trẻ.', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80', 88000, 1, 1, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `isbn`, `publisher`, `publish_year`, `description`, `cover_image`, `sale_price`, `is_borrowable`, `is_salable`, `created_at`, `updated_at`) VALUES (9, 3, 'Cha Giàu Cha Nghèo (Rich Dad Poor Dad)', 'Robert T. Kiyosaki', '9786045648831', 'NXB Trẻ', 2020, 'Bài học tư duy quản lý tài chính cá nhân và bí quyết để tiền bạc tự làm việc cho bạn.', 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80', 125000, 1, 1, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `isbn`, `publisher`, `publish_year`, `description`, `cover_image`, `sale_price`, `is_borrowable`, `is_salable`, `created_at`, `updated_at`) VALUES (10, 3, 'Khởi Nghiệp Tinh Gọn (The Lean Startup)', 'Eric Ries', '9786045622114', 'NXB Thế Giới', 2019, 'Phương pháp luận đột phá giúp xây dựng sản phẩm và doanh nghiệp thành công nhanh chóng.', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80', 145000, 1, 1, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `isbn`, `publisher`, `publish_year`, `description`, `cover_image`, `sale_price`, `is_borrowable`, `is_salable`, `created_at`, `updated_at`) VALUES (11, 5, 'Sapiens: Lược Sử Loài Người', 'Yuval Noah Harari', '9786045641123', 'NXB Tri Thức', 2017, 'Góc nhìn sâu sắc về lịch sử tiến hóa của loài Homo Sapiens từ thời đồ đá đến kỷ nguyên trí tuệ nhân tạo.', 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80', 195000, 1, 1, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `isbn`, `publisher`, `publish_year`, `description`, `cover_image`, `sale_price`, `is_borrowable`, `is_salable`, `created_at`, `updated_at`) VALUES (12, 5, 'Súng, Vi Trùng Và Thép', 'Jared Diamond', '9786045688912', 'NXB Thế Giới', 2019, 'Giải mã nguồn gốc sự chênh lệch phát triển giữa các nền văn minh trong lịch sử loài người.', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80', 210000, 1, 1, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `isbn`, `publisher`, `publish_year`, `description`, `cover_image`, `sale_price`, `is_borrowable`, `is_salable`, `created_at`, `updated_at`) VALUES (13, 6, 'xxx', 'xxx', NULL, NULL, 2024, 'xxx', '/storage/covers/8e08EiMzjRW3c6nt4RTUj1S0YyVCH5lcm3VOM76D.jpg', 150000, 1, 1, '2026-09-22 09:05:46.000', '2026-09-22 09:05:46.000');
INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `isbn`, `publisher`, `publish_year`, `description`, `cover_image`, `sale_price`, `is_borrowable`, `is_salable`, `created_at`, `updated_at`) VALUES (14, 6, 'xxxx', 'xxxx', NULL, NULL, 2024, 'xxxx', '/storage/covers/1XHOSkBtlWBkVK0Hl0ceRQvbQ24RW6hY4MLbVbyx.jpg', 150000, 1, 1, '2026-09-22 09:06:16.000', '2026-09-22 09:06:16.000');
INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `isbn`, `publisher`, `publish_year`, `description`, `cover_image`, `sale_price`, `is_borrowable`, `is_salable`, `created_at`, `updated_at`) VALUES (15, 6, 'xxxx', 'xxxx', NULL, NULL, 2024, 'xxxx', '/storage/covers/TFbiC0A7yLrNg4ElyWzCsIRTAvktl4UlxCYdxBqe.jpg', 150000, 1, 1, '2026-09-22 09:06:16.000', '2026-09-22 09:06:16.000');
INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `isbn`, `publisher`, `publish_year`, `description`, `cover_image`, `sale_price`, `is_borrowable`, `is_salable`, `created_at`, `updated_at`) VALUES (17, 6, 'xxx', 'xxx', 'ee34', 'xxx', 2026, 'xxx', '/storage/covers/TTyuV6zrIwoKEA9Si0rxvRDOVd5qtJVfzIOdaDd1.jpg', 120000, 1, 1, '2026-09-22 09:26:00.000', '2026-09-22 09:26:00.000');
INSERT INTO `books` (`id`, `category_id`, `title`, `author`, `isbn`, `publisher`, `publish_year`, `description`, `cover_image`, `sale_price`, `is_borrowable`, `is_salable`, `created_at`, `updated_at`) VALUES (18, 1, 'rr', 'rrr', 'rrr', 'rrr', 2026, 'rrr', '/storage/covers/S2VQLwoaiJE2OfIxPan3YAhfnQR9jQVSLnrrt8FR.jpg', 120000, 1, 1, '2026-09-22 09:27:08.000', '2026-09-22 09:27:08.000');

DROP TABLE IF EXISTS `borrow_items`;
CREATE TABLE `borrow_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `borrow_ticket_id` bigint unsigned NOT NULL,
  `book_copy_id` bigint unsigned NOT NULL,
  `due_date` date DEFAULT NULL,
  `returned_at` timestamp NULL DEFAULT NULL,
  `late_fee` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` enum('borrowed','returned','lost') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'borrowed',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `borrow_items_borrow_ticket_id_foreign` (`borrow_ticket_id`),
  KEY `borrow_items_book_copy_id_foreign` (`book_copy_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `borrow_items` (`id`, `borrow_ticket_id`, `book_copy_id`, `due_date`, `returned_at`, `late_fee`, `status`, `created_at`, `updated_at`) VALUES (1, 1, 1, '2026-09-30 00:00:00.000', '2026-09-22 06:50:02.000', 0, 'returned', '2026-09-21 09:47:04.000', '2026-09-22 06:50:02.000');
INSERT INTO `borrow_items` (`id`, `borrow_ticket_id`, `book_copy_id`, `due_date`, `returned_at`, `late_fee`, `status`, `created_at`, `updated_at`) VALUES (2, 2, 3, '2026-09-17 00:00:00.000', '2026-09-22 06:50:03.000', -26423.8, 'returned', '2026-09-21 09:47:04.000', '2026-09-22 06:50:03.000');
INSERT INTO `borrow_items` (`id`, `borrow_ticket_id`, `book_copy_id`, `due_date`, `returned_at`, `late_fee`, `status`, `created_at`, `updated_at`) VALUES (3, 3, 6, '2026-10-06 00:00:00.000', '2026-09-22 06:50:00.000', 0, 'returned', '2026-09-22 06:49:38.000', '2026-09-22 06:50:00.000');
INSERT INTO `borrow_items` (`id`, `borrow_ticket_id`, `book_copy_id`, `due_date`, `returned_at`, `late_fee`, `status`, `created_at`, `updated_at`) VALUES (4, 4, 6, '2026-10-06 00:00:00.000', NULL, 0, 'borrowed', '2026-09-22 07:34:34.000', '2026-09-22 07:34:34.000');
INSERT INTO `borrow_items` (`id`, `borrow_ticket_id`, `book_copy_id`, `due_date`, `returned_at`, `late_fee`, `status`, `created_at`, `updated_at`) VALUES (5, 5, 43, '2026-10-13 00:00:00.000', NULL, 0, 'borrowed', '2026-09-22 07:37:00.000', '2026-09-23 08:20:32.000');
INSERT INTO `borrow_items` (`id`, `borrow_ticket_id`, `book_copy_id`, `due_date`, `returned_at`, `late_fee`, `status`, `created_at`, `updated_at`) VALUES (6, 6, 67, '2026-10-26 00:00:00.000', NULL, 0, 'borrowed', '2026-10-12 09:45:35.000', '2026-10-12 09:45:35.000');

DROP TABLE IF EXISTS `borrow_tickets`;
CREATE TABLE `borrow_tickets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reader_id` bigint unsigned NOT NULL,
  `librarian_id` bigint unsigned DEFAULT NULL,
  `status` enum('pending','approved','borrowed','returned','overdue','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `borrow_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `returned_date` date DEFAULT NULL,
  `renewed_count` int NOT NULL DEFAULT '0',
  `total_late_fee` decimal(12,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `borrow_tickets_reader_id_foreign` (`reader_id`),
  KEY `borrow_tickets_librarian_id_foreign` (`librarian_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `borrow_tickets` (`id`, `reader_id`, `librarian_id`, `status`, `borrow_date`, `due_date`, `returned_date`, `renewed_count`, `total_late_fee`, `notes`, `created_at`, `updated_at`) VALUES (1, 3, 2, 'returned', '2026-09-16 00:00:00.000', '2026-09-30 00:00:00.000', '2026-09-22 00:00:00.000', 0, 0, 'Đã duyệt tại quầy dịch vụ', '2026-09-21 09:47:04.000', '2026-09-22 06:50:02.000');
INSERT INTO `borrow_tickets` (`id`, `reader_id`, `librarian_id`, `status`, `borrow_date`, `due_date`, `returned_date`, `renewed_count`, `total_late_fee`, `notes`, `created_at`, `updated_at`) VALUES (2, 4, 2, 'returned', '2026-09-03 00:00:00.000', '2026-09-17 00:00:00.000', '2026-09-22 00:00:00.000', 0, -26423.8, 'Quá hạn 4 ngày (Phí phạt 20,000 đ)', '2026-09-21 09:47:04.000', '2026-09-22 06:50:03.000');
INSERT INTO `borrow_tickets` (`id`, `reader_id`, `librarian_id`, `status`, `borrow_date`, `due_date`, `returned_date`, `renewed_count`, `total_late_fee`, `notes`, `created_at`, `updated_at`) VALUES (3, 3, 2, 'returned', '2026-09-22 00:00:00.000', '2026-10-06 00:00:00.000', '2026-09-22 00:00:00.000', 0, 0, NULL, '2026-09-22 06:49:38.000', '2026-09-22 06:50:01.000');
INSERT INTO `borrow_tickets` (`id`, `reader_id`, `librarian_id`, `status`, `borrow_date`, `due_date`, `returned_date`, `renewed_count`, `total_late_fee`, `notes`, `created_at`, `updated_at`) VALUES (4, 1, 2, 'borrowed', '2026-09-22 00:00:00.000', '2026-10-06 00:00:00.000', NULL, 0, 0, NULL, '2026-09-22 07:34:34.000', '2026-09-22 07:37:13.000');
INSERT INTO `borrow_tickets` (`id`, `reader_id`, `librarian_id`, `status`, `borrow_date`, `due_date`, `returned_date`, `renewed_count`, `total_late_fee`, `notes`, `created_at`, `updated_at`) VALUES (5, 3, 2, 'borrowed', '2026-09-22 00:00:00.000', '2026-10-13 00:00:00.000', NULL, 1, 0, NULL, '2026-09-22 07:37:00.000', '2026-09-23 08:20:32.000');
INSERT INTO `borrow_tickets` (`id`, `reader_id`, `librarian_id`, `status`, `borrow_date`, `due_date`, `returned_date`, `renewed_count`, `total_late_fee`, `notes`, `created_at`, `updated_at`) VALUES (6, 3, NULL, 'pending', '2026-10-12 00:00:00.000', '2026-10-26 00:00:00.000', NULL, 0, 0, NULL, '2026-10-12 09:45:35.000', '2026-10-12 09:45:35.000');

DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache` (
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-categories:all', 'a:6:{i:0;a:7:{s:2:\"id\";i:1;s:4:\"name\";s:23:\"Công nghệ thông tin\";s:4:\"slug\";s:19:\"cong-nghe-thong-tin\";s:11:\"description\";s:47:\"Sách Lập trình, Cơ sở dữ liệu và AI\";s:10:\"created_at\";s:27:\"2026-09-21T09:47:04.000000Z\";s:10:\"updated_at\";s:27:\"2026-09-21T09:47:04.000000Z\";s:11:\"books_count\";i:4;}i:1;a:7:{s:2:\"id\";i:2;s:4:\"name\";s:27:\"Văn học & Nghệ thuật\";s:4:\"slug\";s:18:\"van-hoc-nghe-thuat\";s:11:\"description\";s:58:\"Các tác phẩm văn học kinh điển và hiện đại\";s:10:\"created_at\";s:27:\"2026-09-21T09:47:04.000000Z\";s:10:\"updated_at\";s:27:\"2026-09-21T09:47:04.000000Z\";s:11:\"books_count\";i:3;}i:2;a:7:{s:2:\"id\";i:3;s:4:\"name\";s:24:\"Kinh tế & Quản trị\";s:4:\"slug\";s:16:\"kinh-te-quan-tri\";s:11:\"description\";s:56:\"Quản trị kinh doanh, tài chính và khởi nghiệp\";s:10:\"created_at\";s:27:\"2026-09-21T09:47:04.000000Z\";s:10:\"updated_at\";s:27:\"2026-09-21T09:47:04.000000Z\";s:11:\"books_count\";i:2;}i:3;a:7:{s:2:\"id\";i:4;s:4:\"name\";s:28:\"Tâm lý & Kỹ năng sống\";s:4:\"slug\";s:19:\"tam-ly-ky-nang-song\";s:11:\"description\";s:50:\"Phát triển bản thân, tư duy và giao tiếp\";s:10:\"created_at\";s:27:\"2026-09-21T09:47:04.000000Z\";s:10:\"updated_at\";s:27:\"2026-09-21T09:47:04.000000Z\";s:11:\"books_count\";i:2;}i:4;a:7:{s:2:\"id\";i:5;s:4:\"name\";s:26:\"Lịch sử & Lược sử\";s:4:\"slug\";s:15:\"lich-su-luoc-su\";s:11:\"description\";s:51:\"Lịch sử văn minh nhân loại và thế giới\";s:10:\"created_at\";s:27:\"2026-09-21T09:47:04.000000Z\";s:10:\"updated_at\";s:27:\"2026-09-21T09:47:04.000000Z\";s:11:\"books_count\";i:2;}i:5;a:7:{s:2:\"id\";i:6;s:4:\"name\";s:3:\"xxx\";s:4:\"slug\";s:3:\"xxx\";s:11:\"description\";s:3:\"xxx\";s:10:\"created_at\";s:27:\"2026-09-22T09:05:01.000000Z\";s:10:\"updated_at\";s:27:\"2026-09-22T09:05:01.000000Z\";s:11:\"books_count\";i:4;}}', 1791884303);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:1:available_copies', 'i:5;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:1:sale_stock', 'i:13;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:2:available_copies', 'i:2;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:2:sale_stock', 'i:2;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:3:available_copies', 'i:4;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:3:sale_stock', 'i:10;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:4:available_copies', 'i:6;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:4:sale_stock', 'i:25;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:5:available_copies', 'i:5;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:5:sale_stock', 'i:30;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:6:available_copies', 'i:4;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:6:sale_stock', 'i:18;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:7:available_copies', 'i:6;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:7:sale_stock', 'i:30;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:8:available_copies', 'i:4;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:8:sale_stock', 'i:19;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:9:available_copies', 'i:5;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:9:sale_stock', 'i:22;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:10:available_copies', 'i:2;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:10:sale_stock', 'i:15;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:11:available_copies', 'i:4;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:11:sale_stock', 'i:15;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:12:available_copies', 'i:3;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:12:sale_stock', 'i:10;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:13:available_copies', 'i:3;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:13:sale_stock', 'i:10;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:14:available_copies', 'i:3;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:14:sale_stock', 'i:10;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:15:available_copies', 'i:3;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:15:sale_stock', 'i:9;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:16:available_copies', 'i:2;', 1790071904);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:16:sale_stock', 'i:5;', 1790071904);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:17:available_copies', 'i:3;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:17:sale_stock', 'i:10;', 1791801504);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:18:available_copies', 'i:2;', 1791801943);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES ('laravel-cache-books:18:sale_stock', 'i:9;', 1791801943);

DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE `cache_locks` (
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`) VALUES (1, 'Công nghệ thông tin', 'cong-nghe-thong-tin', 'Sách Lập trình, Cơ sở dữ liệu và AI', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`) VALUES (2, 'Văn học & Nghệ thuật', 'van-hoc-nghe-thuat', 'Các tác phẩm văn học kinh điển và hiện đại', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`) VALUES (3, 'Kinh tế & Quản trị', 'kinh-te-quan-tri', 'Quản trị kinh doanh, tài chính và khởi nghiệp', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`) VALUES (4, 'Tâm lý & Kỹ năng sống', 'tam-ly-ky-nang-song', 'Phát triển bản thân, tư duy và giao tiếp', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`) VALUES (5, 'Lịch sử & Lược sử', 'lich-su-luoc-su', 'Lịch sử văn minh nhân loại và thế giới', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`) VALUES (6, 'xxx', 'xxx', 'xxx', '2026-09-22 09:05:01.000', '2026-09-22 09:05:01.000');

DROP TABLE IF EXISTS `deliveries`;
CREATE TABLE `deliveries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `tracking_number` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `carrier` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VNPost Express',
  `status` enum('pending','picking','shipping','delivered','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `shipped_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `deliveries_tracking_number_unique` (`tracking_number`),
  KEY `deliveries_order_id_foreign` (`order_id`)
) ENGINE=MyISAM AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `deliveries` (`id`, `order_id`, `tracking_number`, `carrier`, `status`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES (1, 1, 'VNPOST-48065128', 'VNPost Express', 'delivered', '2026-09-20 21:47:04.000', '2026-09-22 06:50:22.000', '2026-09-21 09:47:04.000', '2026-09-22 06:50:22.000');
INSERT INTO `deliveries` (`id`, `order_id`, `tracking_number`, `carrier`, `status`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES (2, 2, 'VNP-92834915', 'VNPost Express', 'pending', NULL, NULL, '2026-09-22 08:06:17.000', '2026-09-22 08:06:17.000');
INSERT INTO `deliveries` (`id`, `order_id`, `tracking_number`, `carrier`, `status`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES (3, 3, 'VNP-71419055', 'VNPost Express', 'pending', NULL, NULL, '2026-09-22 08:20:36.000', '2026-09-22 08:20:36.000');
INSERT INTO `deliveries` (`id`, `order_id`, `tracking_number`, `carrier`, `status`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES (4, 4, 'VNP-88366007', 'VNPost Express', 'shipping', '2026-09-22 08:44:58.000', NULL, '2026-09-22 08:34:02.000', '2026-09-22 08:44:58.000');
INSERT INTO `deliveries` (`id`, `order_id`, `tracking_number`, `carrier`, `status`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES (5, 5, 'VNP-70079296', 'VNPost Express', 'picking', '2026-09-22 08:44:56.000', NULL, '2026-09-22 08:34:45.000', '2026-09-22 08:44:58.000');
INSERT INTO `deliveries` (`id`, `order_id`, `tracking_number`, `carrier`, `status`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES (6, 6, 'VNP-69412564', 'VNPost Express', 'pending', NULL, NULL, '2026-09-22 08:36:34.000', '2026-09-22 08:36:34.000');
INSERT INTO `deliveries` (`id`, `order_id`, `tracking_number`, `carrier`, `status`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES (7, 7, 'VNP-84357740', 'VNPost Express', 'shipping', '2026-09-22 08:44:54.000', NULL, '2026-09-22 08:43:36.000', '2026-09-22 08:44:54.000');
INSERT INTO `deliveries` (`id`, `order_id`, `tracking_number`, `carrier`, `status`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES (8, 8, 'VNP-37421811', 'VNPost Express', 'pending', NULL, NULL, '2026-09-22 08:45:16.000', '2026-09-22 08:45:16.000');
INSERT INTO `deliveries` (`id`, `order_id`, `tracking_number`, `carrier`, `status`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES (9, 9, 'VNP-42524172', 'VNPost Express', 'pending', NULL, NULL, '2026-09-22 08:46:11.000', '2026-09-22 08:46:11.000');
INSERT INTO `deliveries` (`id`, `order_id`, `tracking_number`, `carrier`, `status`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES (10, 10, 'VNP-49808403', 'VNPost Express', 'pending', NULL, NULL, '2026-09-22 08:49:31.000', '2026-09-22 08:49:31.000');
INSERT INTO `deliveries` (`id`, `order_id`, `tracking_number`, `carrier`, `status`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES (11, 11, 'VNP-68617919', 'VNPost Express', 'pending', NULL, NULL, '2026-09-22 08:49:44.000', '2026-09-22 08:49:44.000');
INSERT INTO `deliveries` (`id`, `order_id`, `tracking_number`, `carrier`, `status`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES (12, 12, 'VNP-66494260', 'VNPost Express', 'pending', NULL, NULL, '2026-09-22 08:49:51.000', '2026-09-22 08:49:51.000');
INSERT INTO `deliveries` (`id`, `order_id`, `tracking_number`, `carrier`, `status`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES (13, 13, 'VNP-25210278', 'VNPost Express', 'pending', NULL, NULL, '2026-09-22 08:54:15.000', '2026-09-22 08:54:15.000');
INSERT INTO `deliveries` (`id`, `order_id`, `tracking_number`, `carrier`, `status`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES (14, 14, 'VNP-47943318', 'VNPost Express', 'delivered', NULL, '2026-09-26 08:13:31.000', '2026-09-22 08:55:30.000', '2026-09-26 08:13:31.000');
INSERT INTO `deliveries` (`id`, `order_id`, `tracking_number`, `carrier`, `status`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES (15, 15, 'VNP-31672785', 'VNPost Express', 'delivered', NULL, '2026-09-26 08:13:28.000', '2026-09-22 09:03:49.000', '2026-09-26 08:13:28.000');
INSERT INTO `deliveries` (`id`, `order_id`, `tracking_number`, `carrier`, `status`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES (16, 16, 'VNP-73429460', 'VNPost Express', 'pending', NULL, NULL, '2026-09-26 08:20:03.000', '2026-09-26 08:20:03.000');
INSERT INTO `deliveries` (`id`, `order_id`, `tracking_number`, `carrier`, `status`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES (17, 17, 'VNP-45121432', 'VNPost Express', 'pending', NULL, NULL, '2026-10-12 09:45:43.000', '2026-10-12 09:45:43.000');

DROP TABLE IF EXISTS `delivery_histories`;
CREATE TABLE `delivery_histories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `delivery_id` bigint unsigned NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `delivery_histories_delivery_id_foreign` (`delivery_id`)
) ENGINE=MyISAM AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (1, 1, 'picking', 'Đã tiếp nhận đơn hàng từ người gửi', 'Kho Bưu điện TP.HCM', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (2, 1, 'shipping', 'Đang trên đường vận chuyển đến người nhận', 'Bưu cục Quận 1', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (3, 1, 'shipping', 'Thủ thư cập nhật trạng thái: shipping', 'Kho Bưu cục Thư Viện', '2026-09-22 06:50:18.000', '2026-09-22 06:50:18.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (4, 1, 'shipping', 'Thủ thư cập nhật trạng thái: shipping', 'Kho Bưu cục Thư Viện', '2026-09-22 06:50:19.000', '2026-09-22 06:50:19.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (5, 1, 'picking', 'Thủ thư cập nhật trạng thái: picking', 'Kho Bưu cục Thư Viện', '2026-09-22 06:50:20.000', '2026-09-22 06:50:20.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (6, 1, 'delivered', 'Thủ thư cập nhật trạng thái: delivered', 'Kho Bưu cục Thư Viện', '2026-09-22 06:50:20.000', '2026-09-22 06:50:20.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (7, 1, 'delivered', 'Thủ thư cập nhật trạng thái: delivered', 'Kho Bưu cục Thư Viện', '2026-09-22 06:50:22.000', '2026-09-22 06:50:22.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (8, 1, 'delivered', 'Thủ thư cập nhật trạng thái: delivered', 'Kho Bưu cục Thư Viện', '2026-09-22 06:50:22.000', '2026-09-22 06:50:22.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (9, 1, 'delivered', 'Thủ thư cập nhật trạng thái: delivered', 'Kho Bưu cục Thư Viện', '2026-09-22 06:50:22.000', '2026-09-22 06:50:22.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (10, 2, 'pending', 'Đơn hàng vừa được tạo (Chờ tiếp nhận từ thư viện)', 'Thư viện trung tâm', '2026-09-22 08:06:17.000', '2026-09-22 08:06:17.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (11, 3, 'pending', 'Đơn hàng vừa được tạo (Chờ tiếp nhận từ thư viện)', 'Thư viện trung tâm', '2026-09-22 08:20:36.000', '2026-09-22 08:20:36.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (12, 4, 'pending', 'Đơn hàng vừa được tạo (Chờ tiếp nhận từ thư viện)', 'Thư viện trung tâm', '2026-09-22 08:34:02.000', '2026-09-22 08:34:02.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (13, 5, 'pending', 'Đơn hàng vừa được tạo (Chờ tiếp nhận từ thư viện)', 'Thư viện trung tâm', '2026-09-22 08:34:45.000', '2026-09-22 08:34:45.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (14, 6, 'pending', 'Đơn hàng vừa được tạo (Chờ tiếp nhận từ thư viện)', 'Thư viện trung tâm', '2026-09-22 08:36:34.000', '2026-09-22 08:36:34.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (15, 7, 'pending', 'Đơn hàng vừa được tạo (Chờ tiếp nhận từ thư viện)', 'Thư viện trung tâm', '2026-09-22 08:43:36.000', '2026-09-22 08:43:36.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (16, 7, 'shipping', 'Thủ thư cập nhật trạng thái: shipping', 'Kho Bưu cục Thư Viện', '2026-09-22 08:44:54.000', '2026-09-22 08:44:54.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (17, 7, 'shipping', 'Thủ thư cập nhật trạng thái: shipping', 'Kho Bưu cục Thư Viện', '2026-09-22 08:44:55.000', '2026-09-22 08:44:55.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (18, 5, 'shipping', 'Thủ thư cập nhật trạng thái: shipping', 'Kho Bưu cục Thư Viện', '2026-09-22 08:44:56.000', '2026-09-22 08:44:56.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (19, 5, 'picking', 'Thủ thư cập nhật trạng thái: picking', 'Kho Bưu cục Thư Viện', '2026-09-22 08:44:58.000', '2026-09-22 08:44:58.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (20, 4, 'shipping', 'Thủ thư cập nhật trạng thái: shipping', 'Kho Bưu cục Thư Viện', '2026-09-22 08:44:58.000', '2026-09-22 08:44:58.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (21, 4, 'shipping', 'Thủ thư cập nhật trạng thái: shipping', 'Kho Bưu cục Thư Viện', '2026-09-22 08:44:59.000', '2026-09-22 08:44:59.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (22, 8, 'pending', 'Đơn hàng vừa được tạo (Chờ tiếp nhận từ thư viện)', 'Thư viện trung tâm', '2026-09-22 08:45:16.000', '2026-09-22 08:45:16.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (23, 9, 'pending', 'Đơn hàng vừa được tạo (Chờ tiếp nhận từ thư viện)', 'Thư viện trung tâm', '2026-09-22 08:46:11.000', '2026-09-22 08:46:11.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (24, 10, 'pending', 'Đơn hàng vừa được tạo (Chờ tiếp nhận từ thư viện)', 'Thư viện trung tâm', '2026-09-22 08:49:31.000', '2026-09-22 08:49:31.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (25, 11, 'pending', 'Đơn hàng vừa được tạo (Chờ tiếp nhận từ thư viện)', 'Thư viện trung tâm', '2026-09-22 08:49:44.000', '2026-09-22 08:49:44.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (26, 12, 'pending', 'Đơn hàng vừa được tạo (Chờ tiếp nhận từ thư viện)', 'Thư viện trung tâm', '2026-09-22 08:49:51.000', '2026-09-22 08:49:51.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (27, 13, 'pending', 'Đơn hàng vừa được tạo (Chờ tiếp nhận từ thư viện)', 'Thư viện trung tâm', '2026-09-22 08:54:15.000', '2026-09-22 08:54:15.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (28, 14, 'pending', 'Đơn hàng vừa được tạo (Chờ tiếp nhận từ thư viện)', 'Thư viện trung tâm', '2026-09-22 08:55:30.000', '2026-09-22 08:55:30.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (29, 15, 'pending', 'Đơn hàng vừa được tạo (Chờ tiếp nhận từ thư viện)', 'Thư viện trung tâm', '2026-09-22 09:03:49.000', '2026-09-22 09:03:49.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (30, 15, 'delivered', 'Thủ thư cập nhật trạng thái: delivered', 'Kho Bưu cục Thư Viện', '2026-09-26 08:13:28.000', '2026-09-26 08:13:28.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (31, 14, 'delivered', 'Thủ thư cập nhật trạng thái: delivered', 'Kho Bưu cục Thư Viện', '2026-09-26 08:13:30.000', '2026-09-26 08:13:30.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (32, 14, 'delivered', 'Thủ thư cập nhật trạng thái: delivered', 'Kho Bưu cục Thư Viện', '2026-09-26 08:13:31.000', '2026-09-26 08:13:31.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (33, 16, 'pending', 'Đơn hàng vừa được tạo (Chờ tiếp nhận từ thư viện)', 'Thư viện trung tâm', '2026-09-26 08:20:03.000', '2026-09-26 08:20:03.000');
INSERT INTO `delivery_histories` (`id`, `delivery_id`, `status`, `note`, `location`, `created_at`, `updated_at`) VALUES (34, 17, 'pending', 'Đơn hàng vừa được tạo (Chờ tiếp nhận từ thư viện)', 'Thư viện trung tâm', '2026-10-12 09:45:43.000', '2026-10-12 09:45:43.000');

DROP TABLE IF EXISTS `email_logs`;
CREATE TABLE `email_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reader_id` bigint unsigned NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `email_logs_reader_id_foreign` (`reader_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `email_logs` (`id`, `reader_id`, `type`, `subject`, `content`, `created_at`, `updated_at`) VALUES (1, 3, 'due_soon', '[THƯ VIỆN ONLINE] Nhắc nhở hạn trả sách mượn trước 2 ngày', 'Kính gửi độc giả Trần Thị Độc Giả,\n\nBạn có 1 phiếu mượn sách sắp đến hạn trả vào ngày 30/09/2026.\nVui lòng tự gia hạn online 01 lần (+7 ngày) hoặc trả sách tại quầy trước hạn để tránh phát sinh phí phạt.', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `email_logs` (`id`, `reader_id`, `type`, `subject`, `content`, `created_at`, `updated_at`) VALUES (2, 4, 'overdue', '[CẢNH BÁO QUÁ HẠN] Nhắc nợ phí phạt trễ hạn mượn sách', 'Kính gửi độc giả Lê Minh Tuấn,\n\nPhiếu mượn #2 của bạn đã quá hạn 4 ngày.\nTổng phí phạt phát sinh hiện tại: 20,000 VND.\nVui lòng thanh toán trực tuyến qua MoMo hoặc đến quầy hoàn trả sách.', '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `email_logs` (`id`, `reader_id`, `type`, `subject`, `content`, `created_at`, `updated_at`) VALUES (3, 3, 'reminder', 'hello', 'memaybeo', '2026-09-23 06:18:44.000', '2026-09-23 06:18:44.000');
INSERT INTO `email_logs` (`id`, `reader_id`, `type`, `subject`, `content`, `created_at`, `updated_at`) VALUES (4, 4, 'reminder', 'hello', 'memaybeo', '2026-09-23 06:18:47.000', '2026-09-23 06:18:47.000');
INSERT INTO `email_logs` (`id`, `reader_id`, `type`, `subject`, `content`, `created_at`, `updated_at`) VALUES (5, 5, 'reminder', 'hello', 'memaybeo', '2026-09-23 06:18:47.000', '2026-09-23 06:18:47.000');

DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE `job_batches` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (1, '0001_01_01_000000_create_users_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (2, '0001_01_01_000001_create_cache_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (3, '0001_01_01_000002_create_jobs_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (4, '2026_01_01_000001_create_categories_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (5, '2026_01_01_000002_create_books_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (6, '2026_01_01_000003_create_book_copies_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (7, '2026_01_01_000004_create_book_inventories_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (8, '2026_01_01_000005_create_borrow_tickets_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (9, '2026_01_01_000006_create_borrow_items_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (10, '2026_01_01_000007_create_orders_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (11, '2026_01_01_000008_create_order_items_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (12, '2026_01_01_000009_create_payments_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (13, '2026_01_01_000010_create_deliveries_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (14, '2026_01_01_000011_create_delivery_histories_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (15, '2026_01_01_000012_create_system_configs_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (16, '2026_01_01_000013_create_book_reviews_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (17, '2026_01_01_000014_create_wishlists_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (18, '2026_01_01_000015_create_email_logs_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (19, '2026_09_13_162451_create_personal_access_tokens_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (20, '2026_01_01_000016_create_book_reservations_table', 2);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (21, '2026_01_01_000017_add_is_active_to_users_table', 3);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (22, '2026_09_22_082205_add_approval_fields_to_payments_table', 4);

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `book_id` bigint unsigned NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_foreign` (`order_id`),
  KEY `order_items_book_id_foreign` (`book_id`)
) ENGINE=MyISAM AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES (1, 1, 1, 1, 250000, 250000, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES (2, 2, 2, 1, 320000, 320000, '2026-09-22 08:06:17.000', '2026-09-22 08:06:17.000');
INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES (3, 3, 2, 1, 320000, 320000, '2026-09-22 08:20:36.000', '2026-09-22 08:20:36.000');
INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES (4, 4, 2, 1, 320000, 320000, '2026-09-22 08:34:02.000', '2026-09-22 08:34:02.000');
INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES (5, 5, 2, 1, 320000, 320000, '2026-09-22 08:34:45.000', '2026-09-22 08:34:45.000');
INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES (6, 6, 2, 1, 320000, 320000, '2026-09-22 08:36:34.000', '2026-09-22 08:36:34.000');
INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES (7, 7, 3, 1, 290000, 290000, '2026-09-22 08:43:36.000', '2026-09-22 08:43:36.000');
INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES (8, 8, 1, 1, 250000, 250000, '2026-09-22 08:45:16.000', '2026-09-22 08:45:16.000');
INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES (9, 9, 2, 1, 320000, 320000, '2026-09-22 08:46:11.000', '2026-09-22 08:46:11.000');
INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES (10, 10, 3, 1, 290000, 290000, '2026-09-22 08:49:31.000', '2026-09-22 08:49:31.000');
INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES (11, 11, 8, 1, 88000, 88000, '2026-09-22 08:49:44.000', '2026-09-22 08:49:44.000');
INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES (12, 12, 11, 1, 195000, 195000, '2026-09-22 08:49:51.000', '2026-09-22 08:49:51.000');
INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES (13, 13, 1, 1, 250000, 250000, '2026-09-22 08:54:15.000', '2026-09-22 08:54:15.000');
INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES (14, 14, 2, 1, 320000, 320000, '2026-09-22 08:55:30.000', '2026-09-22 08:55:30.000');
INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES (15, 15, 2, 1, 320000, 320000, '2026-09-22 09:03:49.000', '2026-09-22 09:03:49.000');
INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES (16, 16, 15, 1, 150000, 150000, '2026-09-26 08:20:03.000', '2026-09-26 08:20:03.000');
INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES (17, 17, 18, 1, 120000, 120000, '2026-10-12 09:45:43.000', '2026-10-12 09:45:43.000');

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reader_id` bigint unsigned NOT NULL,
  `order_number` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `shipping_fee` decimal(12,2) NOT NULL DEFAULT '0.00',
  `payment_status` enum('pending','paid','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `order_status` enum('pending','processing','shipping','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `shipping_address` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_phone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_number_unique` (`order_number`),
  KEY `orders_reader_id_foreign` (`reader_id`)
) ENGINE=MyISAM AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `orders` (`id`, `reader_id`, `order_number`, `total_amount`, `shipping_fee`, `payment_status`, `order_status`, `shipping_address`, `recipient_name`, `recipient_phone`, `notes`, `created_at`, `updated_at`) VALUES (1, 3, 'ORD-F0I8XZSY', 280000, 30000, 'paid', 'processing', '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', 'Trần Thị Độc Giả', '0987654321', 'Giao vào giờ hành chính', '2026-09-21 09:47:04.000', '2026-09-22 08:33:43.000');
INSERT INTO `orders` (`id`, `reader_id`, `order_number`, `total_amount`, `shipping_fee`, `payment_status`, `order_status`, `shipping_address`, `recipient_name`, `recipient_phone`, `notes`, `created_at`, `updated_at`) VALUES (2, 1, 'ORD-ISCXDFSV', 350000, 30000, 'paid', 'processing', 'Thành phố Hồ Chí Minh', 'Quản trị viên Hệ thống', '0901234567', NULL, '2026-09-22 08:06:17.000', '2026-09-22 08:06:43.000');
INSERT INTO `orders` (`id`, `reader_id`, `order_number`, `total_amount`, `shipping_fee`, `payment_status`, `order_status`, `shipping_address`, `recipient_name`, `recipient_phone`, `notes`, `created_at`, `updated_at`) VALUES (3, 3, 'ORD-JKY7FJ3G', 350000, 30000, 'pending', 'pending', '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', 'Trần Thị Độc Giả', '0987654321', NULL, '2026-09-22 08:20:36.000', '2026-09-22 08:20:36.000');
INSERT INTO `orders` (`id`, `reader_id`, `order_number`, `total_amount`, `shipping_fee`, `payment_status`, `order_status`, `shipping_address`, `recipient_name`, `recipient_phone`, `notes`, `created_at`, `updated_at`) VALUES (4, 1, 'ORD-LNSZPKQG', 350000, 30000, 'pending', 'shipping', 'Thành phố Hồ Chí Minh', 'Quản trị viên Hệ thống', '0901234567', NULL, '2026-09-22 08:34:02.000', '2026-09-22 08:44:58.000');
INSERT INTO `orders` (`id`, `reader_id`, `order_number`, `total_amount`, `shipping_fee`, `payment_status`, `order_status`, `shipping_address`, `recipient_name`, `recipient_phone`, `notes`, `created_at`, `updated_at`) VALUES (5, 3, 'ORD-NWHSQWHN', 350000, 30000, 'pending', 'processing', '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', 'Trần Thị Độc Giả', '0987654321', NULL, '2026-09-22 08:34:45.000', '2026-09-22 08:44:58.000');
INSERT INTO `orders` (`id`, `reader_id`, `order_number`, `total_amount`, `shipping_fee`, `payment_status`, `order_status`, `shipping_address`, `recipient_name`, `recipient_phone`, `notes`, `created_at`, `updated_at`) VALUES (6, 3, 'ORD-QITWJWZG', 350000, 30000, 'pending', 'pending', '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', 'Trần Thị Độc Giả', '0987654321', NULL, '2026-09-22 08:36:34.000', '2026-09-22 08:36:34.000');
INSERT INTO `orders` (`id`, `reader_id`, `order_number`, `total_amount`, `shipping_fee`, `payment_status`, `order_status`, `shipping_address`, `recipient_name`, `recipient_phone`, `notes`, `created_at`, `updated_at`) VALUES (7, 3, 'ORD-J1RSFCFE', 320000, 30000, 'paid', 'shipping', '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', 'Trần Thị Độc Giả', '0987654321', NULL, '2026-09-22 08:43:36.000', '2026-09-22 08:44:54.000');
INSERT INTO `orders` (`id`, `reader_id`, `order_number`, `total_amount`, `shipping_fee`, `payment_status`, `order_status`, `shipping_address`, `recipient_name`, `recipient_phone`, `notes`, `created_at`, `updated_at`) VALUES (8, 3, 'ORD-4LBDHM2A', 280000, 30000, 'paid', 'processing', '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', 'Trần Thị Độc Giả', '0987654321', NULL, '2026-09-22 08:45:16.000', '2026-09-22 08:46:39.000');
INSERT INTO `orders` (`id`, `reader_id`, `order_number`, `total_amount`, `shipping_fee`, `payment_status`, `order_status`, `shipping_address`, `recipient_name`, `recipient_phone`, `notes`, `created_at`, `updated_at`) VALUES (9, 3, 'ORD-FAJSNH14', 350000, 30000, 'paid', 'processing', '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', 'Trần Thị Độc Giả', '0987654321', NULL, '2026-09-22 08:46:11.000', '2026-09-22 08:46:42.000');
INSERT INTO `orders` (`id`, `reader_id`, `order_number`, `total_amount`, `shipping_fee`, `payment_status`, `order_status`, `shipping_address`, `recipient_name`, `recipient_phone`, `notes`, `created_at`, `updated_at`) VALUES (10, 3, 'ORD-HROOLSCH', 320000, 30000, 'paid', 'processing', '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', 'Trần Thị Độc Giả', '0987654321', NULL, '2026-09-22 08:49:31.000', '2026-09-22 08:53:54.000');
INSERT INTO `orders` (`id`, `reader_id`, `order_number`, `total_amount`, `shipping_fee`, `payment_status`, `order_status`, `shipping_address`, `recipient_name`, `recipient_phone`, `notes`, `created_at`, `updated_at`) VALUES (11, 3, 'ORD-U1IGYMD3', 118000, 30000, 'pending', 'pending', '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', 'Trần Thị Độc Giả', '0987654321', NULL, '2026-09-22 08:49:43.000', '2026-09-22 08:49:44.000');
INSERT INTO `orders` (`id`, `reader_id`, `order_number`, `total_amount`, `shipping_fee`, `payment_status`, `order_status`, `shipping_address`, `recipient_name`, `recipient_phone`, `notes`, `created_at`, `updated_at`) VALUES (12, 3, 'ORD-GP6OAKFW', 225000, 30000, 'pending', 'pending', '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', 'Trần Thị Độc Giả', '0987654321', NULL, '2026-09-22 08:49:51.000', '2026-09-22 08:49:51.000');
INSERT INTO `orders` (`id`, `reader_id`, `order_number`, `total_amount`, `shipping_fee`, `payment_status`, `order_status`, `shipping_address`, `recipient_name`, `recipient_phone`, `notes`, `created_at`, `updated_at`) VALUES (13, 3, 'ORD-WONDMEFS', 280000, 30000, 'paid', 'processing', '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', 'Trần Thị Độc Giả', '0987654321', NULL, '2026-09-22 08:54:15.000', '2026-09-22 08:55:50.000');
INSERT INTO `orders` (`id`, `reader_id`, `order_number`, `total_amount`, `shipping_fee`, `payment_status`, `order_status`, `shipping_address`, `recipient_name`, `recipient_phone`, `notes`, `created_at`, `updated_at`) VALUES (14, 3, 'ORD-2G6FBQTD', 350000, 30000, 'pending', 'completed', '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', 'Trần Thị Độc Giả', '0987654321', NULL, '2026-09-22 08:55:30.000', '2026-09-26 08:13:31.000');
INSERT INTO `orders` (`id`, `reader_id`, `order_number`, `total_amount`, `shipping_fee`, `payment_status`, `order_status`, `shipping_address`, `recipient_name`, `recipient_phone`, `notes`, `created_at`, `updated_at`) VALUES (15, 3, 'ORD-COMFEOE8', 350000, 30000, 'paid', 'completed', '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', 'Trần Thị Độc Giả', '0987654321', NULL, '2026-09-22 09:03:49.000', '2026-09-26 08:13:28.000');
INSERT INTO `orders` (`id`, `reader_id`, `order_number`, `total_amount`, `shipping_fee`, `payment_status`, `order_status`, `shipping_address`, `recipient_name`, `recipient_phone`, `notes`, `created_at`, `updated_at`) VALUES (16, 3, 'ORD-IKQY8R7E', 180000, 30000, 'pending', 'pending', '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', 'Trần Thị Độc Giả', '0987654321', NULL, '2026-09-26 08:20:03.000', '2026-09-26 08:20:03.000');
INSERT INTO `orders` (`id`, `reader_id`, `order_number`, `total_amount`, `shipping_fee`, `payment_status`, `order_status`, `shipping_address`, `recipient_name`, `recipient_phone`, `notes`, `created_at`, `updated_at`) VALUES (17, 3, 'ORD-UV0JDXSC', 150000, 30000, 'pending', 'pending', '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', 'Trần Thị Độc Giả', '0987654321', NULL, '2026-10-12 09:45:43.000', '2026-10-12 09:45:43.000');

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `payable_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payable_id` bigint unsigned NOT NULL,
  `reader_id` bigint unsigned NOT NULL,
  `approved_by` bigint unsigned DEFAULT NULL,
  `payment_method` enum('momo','bank_transfer') COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('pending','success','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `raw_payload` json DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `transfer_confirmed_at` timestamp NULL DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_transaction_code_unique` (`transaction_code`),
  KEY `payments_reader_id_foreign` (`reader_id`),
  KEY `payments_approved_by_foreign` (`approved_by`)
) ENGINE=MyISAM AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `payments` (`id`, `payable_type`, `payable_id`, `reader_id`, `approved_by`, `payment_method`, `transaction_code`, `amount`, `status`, `raw_payload`, `paid_at`, `transfer_confirmed_at`, `approved_at`, `note`, `created_at`, `updated_at`) VALUES (1, 'App\\Models\\Order', 2, 1, NULL, 'momo', 'PAY-THGKJCWWTM', 350000, 'success', '{\"transaction_code\":\"PAY-THGKJCWWTM\",\"status\":\"success\"}', '2026-09-22 08:06:43.000', NULL, NULL, NULL, '2026-09-22 08:06:17.000', '2026-09-22 08:06:43.000');
INSERT INTO `payments` (`id`, `payable_type`, `payable_id`, `reader_id`, `approved_by`, `payment_method`, `transaction_code`, `amount`, `status`, `raw_payload`, `paid_at`, `transfer_confirmed_at`, `approved_at`, `note`, `created_at`, `updated_at`) VALUES (2, 'App\\Models\\Order', 3, 3, NULL, 'momo', 'PAY-KCQKYO7OSD', 350000, 'pending', NULL, NULL, NULL, NULL, NULL, '2026-09-22 08:20:36.000', '2026-09-22 08:20:36.000');
INSERT INTO `payments` (`id`, `payable_type`, `payable_id`, `reader_id`, `approved_by`, `payment_method`, `transaction_code`, `amount`, `status`, `raw_payload`, `paid_at`, `transfer_confirmed_at`, `approved_at`, `note`, `created_at`, `updated_at`) VALUES (3, 'App\\Models\\Order', 1, 3, 2, 'bank_transfer', 'PAY-8BTTVZKJ', 280000, 'success', NULL, '2026-09-22 08:33:43.000', '2026-09-22 08:33:43.000', '2026-09-22 08:33:43.000', 'Đã duyệt bởi thủ thư: Thủ thư Nguyễn Văn A', '2026-09-22 08:33:43.000', '2026-09-22 08:33:43.000');
INSERT INTO `payments` (`id`, `payable_type`, `payable_id`, `reader_id`, `approved_by`, `payment_method`, `transaction_code`, `amount`, `status`, `raw_payload`, `paid_at`, `transfer_confirmed_at`, `approved_at`, `note`, `created_at`, `updated_at`) VALUES (4, 'App\\Models\\Order', 4, 1, NULL, 'bank_transfer', 'PAY-WQU6WBC2', 350000, 'pending', NULL, NULL, NULL, NULL, NULL, '2026-09-22 08:34:02.000', '2026-09-22 08:34:02.000');
INSERT INTO `payments` (`id`, `payable_type`, `payable_id`, `reader_id`, `approved_by`, `payment_method`, `transaction_code`, `amount`, `status`, `raw_payload`, `paid_at`, `transfer_confirmed_at`, `approved_at`, `note`, `created_at`, `updated_at`) VALUES (5, 'App\\Models\\Order', 5, 3, NULL, 'bank_transfer', 'PAY-VC1GN24T', 350000, 'pending', NULL, NULL, NULL, NULL, NULL, '2026-09-22 08:34:45.000', '2026-09-22 08:34:45.000');
INSERT INTO `payments` (`id`, `payable_type`, `payable_id`, `reader_id`, `approved_by`, `payment_method`, `transaction_code`, `amount`, `status`, `raw_payload`, `paid_at`, `transfer_confirmed_at`, `approved_at`, `note`, `created_at`, `updated_at`) VALUES (6, 'App\\Models\\Order', 6, 3, NULL, 'bank_transfer', 'PAY-G5CZR8RC', 350000, 'pending', NULL, NULL, NULL, NULL, NULL, '2026-09-22 08:36:34.000', '2026-09-22 08:36:34.000');
INSERT INTO `payments` (`id`, `payable_type`, `payable_id`, `reader_id`, `approved_by`, `payment_method`, `transaction_code`, `amount`, `status`, `raw_payload`, `paid_at`, `transfer_confirmed_at`, `approved_at`, `note`, `created_at`, `updated_at`) VALUES (7, 'App\\Models\\Order', 1, 3, 2, 'bank_transfer', 'PAY-PXK9LHRR', 280000, 'success', NULL, '2026-09-22 08:39:06.000', '2026-09-22 08:39:06.000', '2026-09-22 08:39:06.000', 'Đã duyệt bởi thủ thư: Thủ thư Nguyễn Văn A', '2026-09-22 08:39:06.000', '2026-09-22 08:39:06.000');
INSERT INTO `payments` (`id`, `payable_type`, `payable_id`, `reader_id`, `approved_by`, `payment_method`, `transaction_code`, `amount`, `status`, `raw_payload`, `paid_at`, `transfer_confirmed_at`, `approved_at`, `note`, `created_at`, `updated_at`) VALUES (8, 'App\\Models\\Order', 7, 3, 2, 'bank_transfer', 'PAY-QYKX1TNV', 320000, 'success', NULL, '2026-09-22 08:44:46.000', NULL, '2026-09-22 08:44:46.000', 'Đã duyệt bởi thủ thư: Thủ thư Nguyễn Văn A', '2026-09-22 08:43:37.000', '2026-09-22 08:44:46.000');
INSERT INTO `payments` (`id`, `payable_type`, `payable_id`, `reader_id`, `approved_by`, `payment_method`, `transaction_code`, `amount`, `status`, `raw_payload`, `paid_at`, `transfer_confirmed_at`, `approved_at`, `note`, `created_at`, `updated_at`) VALUES (9, 'App\\Models\\Order', 8, 3, 2, 'bank_transfer', 'PAY-BFEPPSMK', 280000, 'success', NULL, '2026-09-22 08:46:39.000', '2026-09-22 08:45:52.000', '2026-09-22 08:46:39.000', 'Độc giả đã chuyển khoản, chờ thủ thư duyệt đối soát. | Đã duyệt bởi thủ thư: Thủ thư Nguyễn Văn A', '2026-09-22 08:45:16.000', '2026-09-22 08:46:39.000');
INSERT INTO `payments` (`id`, `payable_type`, `payable_id`, `reader_id`, `approved_by`, `payment_method`, `transaction_code`, `amount`, `status`, `raw_payload`, `paid_at`, `transfer_confirmed_at`, `approved_at`, `note`, `created_at`, `updated_at`) VALUES (10, 'App\\Models\\Order', 9, 3, 2, 'bank_transfer', 'PAY-QG90RQBC', 350000, 'success', NULL, '2026-09-22 08:46:42.000', NULL, '2026-09-22 08:46:42.000', 'Đã duyệt bởi thủ thư: Thủ thư Nguyễn Văn A', '2026-09-22 08:46:11.000', '2026-09-22 08:46:42.000');
INSERT INTO `payments` (`id`, `payable_type`, `payable_id`, `reader_id`, `approved_by`, `payment_method`, `transaction_code`, `amount`, `status`, `raw_payload`, `paid_at`, `transfer_confirmed_at`, `approved_at`, `note`, `created_at`, `updated_at`) VALUES (12, 'App\\Models\\Order', 10, 3, 2, 'bank_transfer', 'PAY-3GUN1GPX', 320000, 'success', NULL, '2026-09-22 08:53:54.000', '2026-09-22 08:49:33.000', '2026-09-22 08:53:54.000', 'Độc giả đã chuyển khoản, chờ thủ thư duyệt đối soát. | Đã duyệt bởi thủ thư: Thủ thư Nguyễn Văn A', '2026-09-22 08:49:31.000', '2026-09-22 08:53:54.000');
INSERT INTO `payments` (`id`, `payable_type`, `payable_id`, `reader_id`, `approved_by`, `payment_method`, `transaction_code`, `amount`, `status`, `raw_payload`, `paid_at`, `transfer_confirmed_at`, `approved_at`, `note`, `created_at`, `updated_at`) VALUES (13, 'App\\Models\\Order', 11, 3, NULL, 'bank_transfer', 'PAY-1OKAFYAJ', 118000, 'pending', NULL, NULL, NULL, NULL, NULL, '2026-09-22 08:49:44.000', '2026-09-22 08:49:44.000');
INSERT INTO `payments` (`id`, `payable_type`, `payable_id`, `reader_id`, `approved_by`, `payment_method`, `transaction_code`, `amount`, `status`, `raw_payload`, `paid_at`, `transfer_confirmed_at`, `approved_at`, `note`, `created_at`, `updated_at`) VALUES (14, 'App\\Models\\Order', 12, 3, NULL, 'bank_transfer', 'PAY-P9UKVQZP', 225000, 'pending', NULL, NULL, NULL, NULL, NULL, '2026-09-22 08:49:51.000', '2026-09-22 08:49:51.000');
INSERT INTO `payments` (`id`, `payable_type`, `payable_id`, `reader_id`, `approved_by`, `payment_method`, `transaction_code`, `amount`, `status`, `raw_payload`, `paid_at`, `transfer_confirmed_at`, `approved_at`, `note`, `created_at`, `updated_at`) VALUES (15, 'App\\Models\\Order', 13, 3, 2, 'bank_transfer', 'PAY-BNKBTJRS', 280000, 'success', NULL, '2026-09-22 08:55:50.000', '2026-09-22 08:55:21.000', '2026-09-22 08:55:50.000', 'Độc giả đã chuyển khoản, chờ thủ thư duyệt đối soát. | Đã duyệt bởi thủ thư: Thủ thư Nguyễn Văn A', '2026-09-22 08:54:15.000', '2026-09-22 08:55:50.000');
INSERT INTO `payments` (`id`, `payable_type`, `payable_id`, `reader_id`, `approved_by`, `payment_method`, `transaction_code`, `amount`, `status`, `raw_payload`, `paid_at`, `transfer_confirmed_at`, `approved_at`, `note`, `created_at`, `updated_at`) VALUES (16, 'App\\Models\\Order', 14, 3, NULL, 'bank_transfer', 'PAY-C9JM9OWR', 350000, 'pending', NULL, NULL, NULL, NULL, NULL, '2026-09-22 08:55:31.000', '2026-09-22 08:55:31.000');
INSERT INTO `payments` (`id`, `payable_type`, `payable_id`, `reader_id`, `approved_by`, `payment_method`, `transaction_code`, `amount`, `status`, `raw_payload`, `paid_at`, `transfer_confirmed_at`, `approved_at`, `note`, `created_at`, `updated_at`) VALUES (17, 'App\\Models\\Order', 15, 3, 2, 'bank_transfer', 'PAY-CXCWYWOG', 350000, 'success', NULL, '2026-09-22 09:05:51.000', '2026-09-22 09:03:53.000', '2026-09-22 09:05:51.000', 'Độc giả đã chuyển khoản, chờ thủ thư duyệt đối soát. | Đã duyệt bởi thủ thư: Thủ thư Nguyễn Văn A', '2026-09-22 09:03:50.000', '2026-09-22 09:05:51.000');
INSERT INTO `payments` (`id`, `payable_type`, `payable_id`, `reader_id`, `approved_by`, `payment_method`, `transaction_code`, `amount`, `status`, `raw_payload`, `paid_at`, `transfer_confirmed_at`, `approved_at`, `note`, `created_at`, `updated_at`) VALUES (18, 'App\\Models\\Order', 16, 3, NULL, 'bank_transfer', 'PAY-H6MBRLZH', 180000, 'pending', NULL, NULL, '2026-09-26 08:20:11.000', NULL, 'Độc giả đã chuyển khoản, chờ thủ thư duyệt đối soát.', '2026-09-26 08:20:03.000', '2026-09-26 08:20:11.000');
INSERT INTO `payments` (`id`, `payable_type`, `payable_id`, `reader_id`, `approved_by`, `payment_method`, `transaction_code`, `amount`, `status`, `raw_payload`, `paid_at`, `transfer_confirmed_at`, `approved_at`, `note`, `created_at`, `updated_at`) VALUES (19, 'App\\Models\\Order', 17, 3, NULL, 'bank_transfer', 'PAY-1IS5QXSK', 150000, 'pending', NULL, NULL, '2026-10-12 09:45:48.000', NULL, 'Độc giả đã chuyển khoản, chờ thủ thư duyệt đối soát.', '2026-10-12 09:45:44.000', '2026-10-12 09:45:48.000');

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=MyISAM AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES (3, 'App\\Models\\User', 3, 'auth_token', '9f94ab3237bb14305ca27a0319907531ae8b133c2420c5f21e17b8f86ab12e50', '[\"*\"]', '2026-09-21 09:49:22.000', NULL, '2026-09-21 09:49:22.000', '2026-09-21 09:49:22.000');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES (56, 'App\\Models\\User', 1, 'auth_token', '1593f953f6ee78616e869b27bce572ef6d11c553afa08198cfb30cfd45caf1d1', '[\"*\"]', '2026-09-22 09:53:31.000', NULL, '2026-09-22 09:42:11.000', '2026-09-22 09:53:31.000');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES (14, 'App\\Models\\User', 3, 'auth_token', '62453d5ce5e751814086a0e845163f098a0ee5a0df913f17449e6cf3f0342be4', '[\"*\"]', '2026-09-22 07:53:46.000', NULL, '2026-09-22 06:50:58.000', '2026-09-22 07:53:46.000');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES (75, 'App\\Models\\User', 2, 'auth_token', '33ffd92c27daeedaf82bb5f14c50fb3413a103ace495a0e243fc5eef4fbaecfc', '[\"*\"]', '2026-09-26 14:46:46.000', NULL, '2026-09-26 08:32:04.000', '2026-09-26 14:46:46.000');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES (70, 'App\\Models\\User', 3, 'auth_token', '261e6c96099dc4318f1c81497b55b6ceca734e118daefa6e7558b3370a1cf097', '[\"*\"]', '2026-09-23 08:31:20.000', NULL, '2026-09-23 08:31:19.000', '2026-09-23 08:31:20.000');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES (80, 'App\\Models\\User', 3, 'auth_token', 'eedbf5c0910e3ad60a45c7eaa073f15ad3b48dcb7ef6c7125e41a5a3a32c7c55', '[\"*\"]', '2026-10-12 09:46:01.000', NULL, '2026-10-12 09:45:19.000', '2026-10-12 09:46:01.000');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES (81, 'App\\Models\\User', 1, 'auth_token', 'b463b8b460390bb9e15c6f6bbb56cfa9ddcdf36b78566c02fc0984c8635b3dbf', '[\"*\"]', NULL, NULL, '2026-10-16 15:22:24.000', '2026-10-16 15:22:24.000');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES (82, 'App\\Models\\User', 1, 'auth_token', '1be490b480f15187ae8849d444e67a6ae2443ef69e7af5419d0e72359c759968', '[\"*\"]', NULL, NULL, '2026-10-16 15:22:43.000', '2026-10-16 15:22:43.000');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES (83, 'App\\Models\\User', 3, 'auth_token', 'eb56aad8b505faff0fa671f56563ba493b0d2c75cf0ae0fcb826af7b8c7d5347', '[\"*\"]', NULL, NULL, '2026-10-16 15:25:07.000', '2026-10-16 15:25:07.000');

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('nE24p14sa0AFSKkvgtCfahwVsysJYxKZrvqXEWFW', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', 'eyJfdG9rZW4iOiJHbTZkVTJYclgzcWQxdVpMM2NIMjRCNWx2M2RDOEVBNFlMdElZN1ZHIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1790058261);
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('dFQsHMDcbLYDALTVUUSboNSRAv3wO9qt50vzMXWz', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', 'eyJfdG9rZW4iOiIya1ZvZTdwZUtIWjRjZ3FtWDloRUVvdndXMWpVOTZJR0ZCQ0dUeVBOIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1790058262);
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('i8UDDmcRXMjvaz0ozDV3WYAp65GakFG6YX40f56y', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJjOUc1Z2ZBYkZRRXRjVVZ3UWdHZllmeGt2WnFPRjRYQUYyWlg2NmtHIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1790058308);
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('Nl0xCTvTEO0lOXaSVeR5flHJyyAyoVmxzX3ObXPf', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJCVllaWWVvMHE3YWJQcGN0b3Z4b2hNdlhwYVhIblBTRElxeTFSY0tiIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1790144269);
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('EmIEud0cW01xfGXOdjCxY1P0fPBbq4atHOHBAftx', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', 'eyJfdG9rZW4iOiJVOUFkRk9vdlVGRmhrcll3U1AzY2pGamNneGRuUEhEb29reHRRSFlvIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1790144258);
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('kOl5DD8lU6nK2KeCenD9REQzPSBZQMsBZED9tSO8', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', 'eyJfdG9rZW4iOiJzNGxxNmo5NThuZmdWOW5qbnVsc3NTakdYam1pcFowMVJZUUlJczdyIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1790144258);
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('wgFlzOz3CkrgWjjmCCI5FCworltf21JtsaVgHwNT', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiIyVGVRcENDVFF2SHB1ZTFhU0J4Q21NaVRGY0hmMkdBSFBlZGpJTkJYIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1790410249);
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('D3kudTjlEGp693fiiA1E6aDR78XOW48xfzPD2ea1', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJvVTlqdm5tdFFSRVo5WTJDMWs3TFQxTTlzOWE2cmV0ZzhudDltTWdyIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1790410250);
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('w1DkHgNeS9Rc7XklwX9Z80HflYJu0lVQASGMF3mf', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJBdjMxVE81VlFwSno3dDBpeWl0UXdCekJtV1UwdWJaNGwyRkx0WnhMIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1791797840);

DROP TABLE IF EXISTS `system_configs`;
CREATE TABLE `system_configs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_configs_key_unique` (`key`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `system_configs` (`id`, `key`, `value`, `description`, `created_at`, `updated_at`) VALUES (1, 'max_borrow_limit', '3', 'Số cuốn sách tối đa mượn cùng lúc', '2026-09-21 09:47:03.000', '2026-09-21 09:47:03.000');
INSERT INTO `system_configs` (`id`, `key`, `value`, `description`, `created_at`, `updated_at`) VALUES (2, 'max_borrow_days', '14', 'Số ngày mượn sách mặc định', '2026-09-21 09:47:03.000', '2026-09-21 09:47:03.000');
INSERT INTO `system_configs` (`id`, `key`, `value`, `description`, `created_at`, `updated_at`) VALUES (3, 'late_fee_per_day', '5000', 'Phí phạt trễ hạn mỗi ngày (VND)', '2026-09-21 09:47:03.000', '2026-09-21 09:47:03.000');
INSERT INTO `system_configs` (`id`, `key`, `value`, `description`, `created_at`, `updated_at`) VALUES (4, 'max_renew_count', '1', 'Số lần tự gia hạn tối đa', '2026-09-21 09:47:03.000', '2026-09-21 09:47:03.000');
INSERT INTO `system_configs` (`id`, `key`, `value`, `description`, `created_at`, `updated_at`) VALUES (5, 'renew_days', '7', 'Số ngày cộng thêm mỗi lần gia hạn', '2026-09-21 09:47:03.000', '2026-09-21 09:47:03.000');
INSERT INTO `system_configs` (`id`, `key`, `value`, `description`, `created_at`, `updated_at`) VALUES (6, 'bank_name', 'MB Bank (Ngân Hàng Quân Đội)', 'Tên ngân hàng thụ hưởng', '2026-09-22 08:42:49.000', '2026-09-22 08:44:41.000');
INSERT INTO `system_configs` (`id`, `key`, `value`, `description`, `created_at`, `updated_at`) VALUES (7, 'bank_id', 'MB', 'Mã ngân hàng VietQR', '2026-09-22 08:42:49.000', '2026-09-22 08:44:41.000');
INSERT INTO `system_configs` (`id`, `key`, `value`, `description`, `created_at`, `updated_at`) VALUES (8, 'bank_account_no', '0798351169', 'Số tài khoản ngân hàng', '2026-09-22 08:42:49.000', '2026-09-22 08:44:41.000');
INSERT INTO `system_configs` (`id`, `key`, `value`, `description`, `created_at`, `updated_at`) VALUES (9, 'bank_account_holder', 'PHAM PHUC MANH GIAU', 'Tên chủ tài khoản', '2026-09-22 08:42:49.000', '2026-09-22 08:44:41.000');

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','librarian','reader') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'reader',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `is_active`, `phone`, `address`, `avatar_url`, `remember_token`, `created_at`, `updated_at`) VALUES (1, 'Quản trị viên Hệ thống', 'admin@thuvien.vn', NULL, '$2y$12$.BEg9.JdYfk47xYyz5iZNOqc/NPSHa5HbRmbCHgnqzPyt07ghiM3W', 'admin', 1, '0901234567', 'Thành phố Hồ Chí Minh', '/storage/avatars/5IRFhr5vzSru9RKRM0G6M9fI41NyM3iAWJqxk4My.jpg', NULL, '2026-09-21 09:47:03.000', '2026-09-22 08:20:23.000');
INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `is_active`, `phone`, `address`, `avatar_url`, `remember_token`, `created_at`, `updated_at`) VALUES (2, 'Thủ thư Nguyễn Văn A', 'thuthu@thuvien.vn', NULL, '$2y$12$CGvNKaM9TfxaHlEg/uHFtuL7AcgfmM1VWrL5r0.e2qlbEpFbLLbp.', 'librarian', 1, '0912345678', 'Quận 1, TP. Hồ Chí Minh', '/storage/avatars/fXxIhZTetYWCPe1WucsmO6CiKZaoVrnxD7wuE4vO.jpg', NULL, '2026-09-21 09:47:03.000', '2026-09-22 06:30:13.000');
INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `is_active`, `phone`, `address`, `avatar_url`, `remember_token`, `created_at`, `updated_at`) VALUES (3, 'Trần Thị Độc Giả', 'docgia1@gmail.com', NULL, '$2y$12$XxwrQl7o7mHlAzXnhxTBnel8Jgmad7wiVaXuJ49N.W.JmDF4ion1S', 'reader', 1, '0987654321', '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', '/storage/avatars/hAZPfb0OMCoKZfHu5GsOkf3evOG6sliOUKMoxrGi.jpg', NULL, '2026-09-21 09:47:03.000', '2026-09-22 07:36:45.000');
INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `is_active`, `phone`, `address`, `avatar_url`, `remember_token`, `created_at`, `updated_at`) VALUES (4, 'Lê Minh Tuấn', 'docgia2@gmail.com', NULL, '$2y$12$hAoxWxy/5bAg/B1BVqnnyupFcIGe3GsNIvDC0KiF/fiSkpg0PM7em', 'reader', 1, '0977112233', '456 Đường Nguyễn Huệ, Quận 3, TP. Hồ Chí Minh', NULL, NULL, '2026-09-21 09:47:03.000', '2026-09-21 09:47:03.000');
INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `is_active`, `phone`, `address`, `avatar_url`, `remember_token`, `created_at`, `updated_at`) VALUES (5, 'Phạm Hoàng Nam', 'nam.pham@gmail.com', NULL, '$2y$12$tvx0Fwd.B7NBawGP6Vza6uolInVtua7LXpsRE9rThadDjQLjKWEJO', 'reader', 1, '0933445566', '789 Đường Điện Biên Phủ, Quận Bình Thạnh, TP. Hồ Chí Minh', NULL, NULL, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');

DROP TABLE IF EXISTS `wishlists`;
CREATE TABLE `wishlists` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reader_id` bigint unsigned NOT NULL,
  `book_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wishlists_reader_id_book_id_unique` (`reader_id`,`book_id`),
  KEY `wishlists_book_id_foreign` (`book_id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `wishlists` (`id`, `reader_id`, `book_id`, `created_at`, `updated_at`) VALUES (1, 3, 2, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `wishlists` (`id`, `reader_id`, `book_id`, `created_at`, `updated_at`) VALUES (2, 3, 5, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `wishlists` (`id`, `reader_id`, `book_id`, `created_at`, `updated_at`) VALUES (3, 4, 1, '2026-09-21 09:47:04.000', '2026-09-21 09:47:04.000');
INSERT INTO `wishlists` (`id`, `reader_id`, `book_id`, `created_at`, `updated_at`) VALUES (5, 3, 12, '2026-09-23 08:18:02.000', '2026-09-23 08:18:02.000');
INSERT INTO `wishlists` (`id`, `reader_id`, `book_id`, `created_at`, `updated_at`) VALUES (6, 3, 11, '2026-09-23 08:18:10.000', '2026-09-23 08:18:10.000');
INSERT INTO `wishlists` (`id`, `reader_id`, `book_id`, `created_at`, `updated_at`) VALUES (7, 3, 10, '2026-09-23 08:18:12.000', '2026-09-23 08:18:12.000');

SET FOREIGN_KEY_CHECKS = 1;
