-- =====================================================
-- PREMIUM TOPUP - DATABASE SCHEMA
-- Engine: MySQL 8.0+ / MariaDB 10.5+
-- Charset: utf8mb4
-- =====================================================

CREATE DATABASE IF NOT EXISTS premium_topup
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE premium_topup;

-- =====================================================
-- TABLE: users
-- =====================================================
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) DEFAULT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    role ENUM('user','admin') NOT NULL DEFAULT 'user',
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status ENUM('active','suspended','banned') NOT NULL DEFAULT 'active',
    email_verified_at DATETIME DEFAULT NULL,
    remember_token VARCHAR(100) DEFAULT NULL,
    last_login_at DATETIME DEFAULT NULL,
    last_login_ip VARCHAR(45) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: game_categories
-- =====================================================
CREATE TABLE game_categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    icon VARCHAR(255) DEFAULT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: games
-- =====================================================
CREATE TABLE games (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id INT UNSIGNED DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    publisher VARCHAR(100) DEFAULT NULL,
    logo VARCHAR(255) DEFAULT NULL,
    banner VARCHAR(255) DEFAULT NULL,
    description TEXT,
    requires_server TINYINT(1) NOT NULL DEFAULT 0,
    validation_provider VARCHAR(50) DEFAULT NULL, -- kode provider untuk validasi nickname
    is_popular TINYINT(1) NOT NULL DEFAULT 0,
    is_new TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    total_sold INT UNSIGNED NOT NULL DEFAULT 0,
    rating DECIMAL(2,1) NOT NULL DEFAULT 5.0,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES game_categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_popular (is_popular),
    FULLTEXT INDEX ft_name (name)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: game_servers  (untuk game yang butuh server, ex: MLBB zone id opsional)
-- =====================================================
CREATE TABLE game_servers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    game_id INT UNSIGNED NOT NULL,
    server_code VARCHAR(50) NOT NULL,
    server_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: products (nominal / denom top up per game)
-- =====================================================
CREATE TABLE products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    game_id INT UNSIGNED NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,          -- ex: "86 Diamonds"
    label VARCHAR(50) DEFAULT NULL,      -- ex: "POPULER", "BONUS 10%"
    price DECIMAL(15,2) NOT NULL,
    strike_price DECIMAL(15,2) DEFAULT NULL, -- harga coret
    cost_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    stock_type ENUM('unlimited','limited') NOT NULL DEFAULT 'unlimited',
    stock_qty INT UNSIGNED DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    INDEX idx_game (game_id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: payment_methods
-- =====================================================
CREATE TABLE payment_methods (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,     -- QRIS, DANA, OVO, GOPAY, SHOPEEPAY, SEABANK, BCA, MANDIRI, BNI, BRI, PERMATA, ALFAMART, INDOMARET
    name VARCHAR(50) NOT NULL,
    group_name ENUM('qris','ewallet','virtual_account','retail') NOT NULL,
    logo VARCHAR(255) DEFAULT NULL,
    fee_type ENUM('flat','percent') NOT NULL DEFAULT 'flat',
    fee_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    min_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    max_amount DECIMAL(15,2) DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: vouchers
-- =====================================================
CREATE TABLE vouchers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(255) DEFAULT NULL,
    discount_type ENUM('percent','flat') NOT NULL DEFAULT 'percent',
    discount_value DECIMAL(10,2) NOT NULL,
    max_discount DECIMAL(15,2) DEFAULT NULL,
    min_transaction DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    usage_limit INT UNSIGNED DEFAULT NULL,
    used_count INT UNSIGNED NOT NULL DEFAULT 0,
    per_user_limit INT UNSIGNED NOT NULL DEFAULT 1,
    game_id INT UNSIGNED DEFAULT NULL,     -- NULL = berlaku semua game
    starts_at DATETIME DEFAULT NULL,
    expires_at DATETIME DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: orders (transaksi top up)
-- =====================================================
CREATE TABLE orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_no VARCHAR(30) NOT NULL UNIQUE,
    user_id INT UNSIGNED DEFAULT NULL,     -- NULL jika guest checkout
    game_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    payment_method_id INT UNSIGNED NOT NULL,
    voucher_id INT UNSIGNED DEFAULT NULL,
    target_user_id VARCHAR(100) NOT NULL,   -- User ID game tujuan
    target_server_id VARCHAR(50) DEFAULT NULL,
    target_nickname VARCHAR(150) DEFAULT NULL,
    contact_email VARCHAR(150) DEFAULT NULL,
    contact_whatsapp VARCHAR(20) DEFAULT NULL,
    product_price DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    payment_fee DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL,
    status ENUM('pending','waiting_payment','paid','processing','success','failed','expired','refunded') NOT NULL DEFAULT 'pending',
    payment_reference VARCHAR(100) DEFAULT NULL,   -- ref dari payment gateway
    payment_payload TEXT DEFAULT NULL,             -- raw payload/QR string
    paid_at DATETIME DEFAULT NULL,
    processed_at DATETIME DEFAULT NULL,
    expired_at DATETIME DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (game_id) REFERENCES games(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE SET NULL,
    INDEX idx_invoice (invoice_no),
    INDEX idx_status (status),
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: order_status_logs
-- =====================================================
CREATE TABLE order_status_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    status_from VARCHAR(30) DEFAULT NULL,
    status_to VARCHAR(30) NOT NULL,
    note VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: voucher_usages
-- =====================================================
CREATE TABLE voucher_usages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    voucher_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED DEFAULT NULL,
    order_id INT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: testimonials
-- =====================================================
CREATE TABLE testimonials (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED DEFAULT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    game_id INT UNSIGNED DEFAULT NULL,
    rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
    message VARCHAR(500) NOT NULL,
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: faqs
-- =====================================================
CREATE TABLE faqs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: banners (promo slider hero)
-- =====================================================
CREATE TABLE banners (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    subtitle VARCHAR(255) DEFAULT NULL,
    image VARCHAR(255) NOT NULL,
    link_url VARCHAR(255) DEFAULT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    starts_at DATETIME DEFAULT NULL,
    ends_at DATETIME DEFAULT NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: flash_sales
-- =====================================================
CREATE TABLE flash_sales (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    special_price DECIMAL(15,2) NOT NULL,
    stock_qty INT UNSIGNED NOT NULL,
    sold_qty INT UNSIGNED NOT NULL DEFAULT 0,
    starts_at DATETIME NOT NULL,
    ends_at DATETIME NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: partners (logo partner/brand)
-- =====================================================
CREATE TABLE partners (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: site_settings (key-value config, dipakai admin panel)
-- =====================================================
CREATE TABLE site_settings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- SEED DATA
-- =====================================================

INSERT INTO game_categories (name, slug, sort_order) VALUES
('Mobile Game', 'mobile-game', 1),
('PC Game', 'pc-game', 2),
('Voucher Digital', 'voucher-digital', 3),
('Tagihan & Isi Ulang', 'tagihan-isi-ulang', 4);

INSERT INTO games (category_id, name, slug, publisher, requires_server, is_popular, is_new, sort_order) VALUES
(1, 'Mobile Legends: Bang Bang', 'mobile-legends', 'Moonton', 1, 1, 0, 1),
(1, 'Free Fire', 'free-fire', 'Garena', 0, 1, 0, 2),
(2, 'PUBG Mobile', 'pubg-mobile', 'Krafton', 0, 1, 0, 3),
(2, 'Valorant', 'valorant', 'Riot Games', 1, 1, 0, 4),
(1, 'Honor of Kings', 'honor-of-kings', 'TiMi Studio', 1, 0, 1, 5),
(2, 'Genshin Impact', 'genshin-impact', 'HoYoverse', 1, 1, 0, 6),
(2, 'Honkai: Star Rail', 'honkai-star-rail', 'HoYoverse', 1, 0, 1, 7),
(2, 'Delta Force', 'delta-force', 'Garena', 0, 0, 1, 8),
(1, 'Blood Strike', 'blood-strike', 'NetEase', 0, 0, 1, 9),
(2, 'Call of Duty Mobile', 'call-of-duty-mobile', 'Activision', 0, 1, 0, 10),
(2, 'Roblox', 'roblox', 'Roblox Corp', 0, 1, 0, 11),
(3, 'Steam Wallet', 'steam-wallet', 'Valve', 0, 0, 0, 12),
(3, 'Google Play Gift Card', 'google-play', 'Google', 0, 0, 0, 13),
(1, 'Garena Shell', 'garena-shell', 'Garena', 0, 0, 0, 14);

INSERT INTO products (game_id, sku, name, label, price, strike_price, sort_order) VALUES
(1, 'MLBB-86', '86 Diamonds', NULL, 22500, 25000, 1),
(1, 'MLBB-172', '172 Diamonds', 'POPULER', 44000, 49000, 2),
(1, 'MLBB-257', '257 Diamonds', NULL, 65500, 70000, 3),
(1, 'MLBB-706', '706 Diamonds', 'HEMAT', 165000, 178000, 4),
(2, 'FF-70', '70 Diamond', NULL, 10500, 12000, 1),
(2, 'FF-140', '140 Diamond', 'POPULER', 21000, 23500, 2),
(2, 'FF-355', '355 Diamond', NULL, 52500, 56000, 3),
(3, 'PUBGM-60', '60 UC', NULL, 15000, 16500, 1),
(3, 'PUBGM-325', '325 UC', 'POPULER', 75000, 80000, 2),
(4, 'VAL-425', '425 Points', NULL, 65000, 70000, 1),
(4, 'VAL-1000', '1000 Points', 'POPULER', 145000, 155000, 2);

INSERT INTO payment_methods (code, name, group_name, fee_type, fee_value, sort_order) VALUES
('QRIS', 'QRIS', 'qris', 'percent', 0.7, 1),
('DANA', 'DANA', 'ewallet', 'flat', 500, 2),
('OVO', 'OVO', 'ewallet', 'flat', 500, 3),
('GOPAY', 'GoPay', 'ewallet', 'flat', 500, 4),
('SHOPEEPAY', 'ShopeePay', 'ewallet', 'flat', 500, 5),
('SEABANK', 'SeaBank', 'virtual_account', 'flat', 1000, 6),
('BCA', 'BCA Virtual Account', 'virtual_account', 'flat', 4000, 7),
('MANDIRI', 'Mandiri Virtual Account', 'virtual_account', 'flat', 4000, 8),
('BNI', 'BNI Virtual Account', 'virtual_account', 'flat', 4000, 9),
('BRI', 'BRI Virtual Account', 'virtual_account', 'flat', 4000, 10),
('PERMATA', 'Permata Virtual Account', 'virtual_account', 'flat', 4000, 11),
('ALFAMART', 'Alfamart', 'retail', 'flat', 2500, 12),
('INDOMARET', 'Indomaret', 'retail', 'flat', 2500, 13);

INSERT INTO faqs (question, answer, sort_order) VALUES
('Berapa lama proses top up selesai?', 'Sebagian besar transaksi diproses secara otomatis dalam hitungan detik hingga 5 menit setelah pembayaran dikonfirmasi.', 1),
('Apakah data akun saya aman?', 'Kami hanya memerlukan User ID dan Server ID, tidak pernah meminta password akun game Anda.', 2),
('Bagaimana jika transaksi gagal tapi saldo terpotong?', 'Silakan hubungi tim bantuan kami dengan menyertakan nomor invoice, dana akan dikembalikan maksimal 1x24 jam.', 3),
('Metode pembayaran apa saja yang tersedia?', 'Kami mendukung QRIS, e-wallet (DANA, OVO, GoPay, ShopeePay), virtual account bank, dan gerai retail (Alfamart, Indomaret).', 4);

INSERT INTO site_settings (setting_key, setting_value) VALUES
('site_name', 'Premium TopUp'),
('site_tagline', 'Top Up Game Tercepat, Termewah, Terpercaya'),
('whatsapp_cs', '6281234567890'),
('email_cs', 'support@premiumtopup.id');
