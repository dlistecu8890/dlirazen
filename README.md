# Premium TopUp

Website top up game enterprise. Stack: HTML5, CSS3, Vanilla JavaScript, PHP 8, MySQL (tanpa framework).

## Status Pembangunan (Fase 1 — selesai)

Sudah dibangun penuh, siap pakai:
- `database/topup.sql` — skema lengkap (users, games, products, orders, payment_methods, vouchers, dll) + seed data
- `index.html` + `style.css` + `css/animations.css` + `css/responsive.css` — homepage lengkap: hero, search realtime, kategori, promo slider, flash sale countdown, game populer/terbaru, statistik, testimoni, FAQ, partner, footer
- `js/toast.js`, `js/modal.js`, `js/particle.js`, `js/navbar.js`, `js/slider.js`, `js/search.js`, `js/validation.js`, `js/app.js`, `script.js` — seluruh sistem interaksi & animasi (cursor glow, mouse trail, particle background, scroll reveal, counter, typing effect, tilt, ripple)
- `pages/login.html`, `pages/register.html` + `css/login.css` — autentikasi lengkap dengan validasi klien
- `api/config.php`, `api/login.php`, `api/register.php`, `api/logout.php` — backend PHP 8 (PDO, prepared statement, password_hash/verify, session aman)

## Belum dibangun (roadmap fase berikutnya)

- `pages/games.html`, `topup.html` (form top up + validasi nickname), `pulsa.html`, `paket-data.html`, `pln.html`, `ewallet.html`, `voucher.html`, `riwayat.html`, `bantuan.html`, `tentang.html`
- `pages/dashboard-user.html`, `dashboard-admin.html` + `css/dashboard.css`, `css/admin.css`
- `js/topup.js`, `js/payment.js`, `js/dashboard.js`
- `api/topup.php`, `payment.php`, `invoice.php`, `nickname.php`, `dashboard.php`, `webhook.php`
- `sitemap.xml`, aset gambar/ikon final

## Setup Lokal

1. Buat database: `mysql -u root -p < database/topup.sql`
2. Set environment variable `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` (atau edit default di `api/config.php`)
3. Jalankan dengan PHP built-in server dari root project:
   ```
   php -S localhost:8000
   ```
4. Buka `http://localhost:8000/index.html`

## Catatan Keamanan

- Semua query database menggunakan PDO prepared statement (anti SQL injection)
- Password di-hash dengan `password_hash()` (bcrypt/argon2 tergantung konfigurasi PHP)
- Session cookie di-set `httponly` dan `samesite=Lax`
- Validasi input dilakukan di sisi klien (UX) **dan** sisi server (keamanan)
