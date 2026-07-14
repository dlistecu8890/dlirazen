<?php
/**
 * config.php
 * Konfigurasi koneksi database dan helper global untuk seluruh endpoint API.
 * PHP 8+, menggunakan PDO dengan prepared statement di semua query.
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0'); // Jangan tampilkan error mentah ke klien di production

// ---------- Konfigurasi Database ----------
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'premium_topup');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');

// ---------- Konfigurasi Sesi ----------
define('SESSION_LIFETIME', 60 * 60 * 24 * 7); // 7 hari untuk "ingat saya"

/**
 * Membuat koneksi PDO singleton.
 */
function getDb(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            jsonResponse(false, null, 'Koneksi database gagal. Silakan coba lagi nanti.', 500);
        }
    }
    return $pdo;
}

/**
 * Mengirim response JSON standar dan menghentikan eksekusi.
 */
function jsonResponse(bool $success, mixed $data = null, string $message = '', int $httpCode = 200): void
{
    http_response_code($httpCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Mengambil dan mendecode body JSON dari request.
 */
function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

/**
 * Sanitasi string input sederhana.
 */
function sanitize(string $value): string
{
    return trim(strip_tags($value));
}

/**
 * Membuat invoice number unik untuk order.
 */
function generateInvoiceNo(): string
{
    return 'PTU' . date('ymd') . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));
}

/**
 * Memulai sesi PHP dengan konfigurasi cookie yang aman.
 */
function startSecureSession(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => SESSION_LIFETIME,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }
}

/**
 * Mengambil user yang sedang login dari sesi, atau null.
 */
function currentUser(): ?array
{
    startSecureSession();
    return $_SESSION['user'] ?? null;
}

/**
 * Wajib login - keluarkan 401 jika belum ada sesi.
 */
function requireAuth(): array
{
    $user = currentUser();
    if (!$user) {
        jsonResponse(false, null, 'Sesi tidak ditemukan, silakan masuk kembali.', 401);
    }
    return $user;
}

/**
 * Wajib login sebagai admin.
 */
function requireAdmin(): array
{
    $user = requireAuth();
    if (($user['role'] ?? 'user') !== 'admin') {
        jsonResponse(false, null, 'Akses ditolak, khusus admin.', 403);
    }
    return $user;
}

// CORS untuk kebutuhan development (samakan origin di production)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}
