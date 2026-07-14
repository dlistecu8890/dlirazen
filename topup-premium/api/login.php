<?php
/**
 * login.php
 * Endpoint autentikasi. Menerima POST JSON: { email, password, remember }
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Metode tidak diizinkan.', 405);
}

$body = getJsonBody();
$email = isset($body['email']) ? sanitize((string) $body['email']) : '';
$password = (string) ($body['password'] ?? '');
$remember = (bool) ($body['remember'] ?? false);

if ($email === '' || $password === '') {
    jsonResponse(false, null, 'Email dan kata sandi wajib diisi.', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, null, 'Format email tidak valid.', 422);
}

$db = getDb();

// ---------- Rate limiting sederhana berbasis tabel gagal login bisa ditambahkan di sini ----------

$stmt = $db->prepare('SELECT id, uuid, full_name, email, phone, password_hash, role, status, avatar FROM users WHERE email = :email LIMIT 1');
$stmt->execute(['email' => $email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    jsonResponse(false, null, 'Email atau kata sandi salah.', 401);
}

if ($user['status'] !== 'active') {
    jsonResponse(false, null, 'Akun kamu tidak aktif. Hubungi tim bantuan kami.', 403);
}

// Update rehash otomatis jika algoritma password berubah
if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
    $newHash = password_hash($password, PASSWORD_DEFAULT);
    $db->prepare('UPDATE users SET password_hash = :hash WHERE id = :id')
       ->execute(['hash' => $newHash, 'id' => $user['id']]);
}

$db->prepare('UPDATE users SET last_login_at = NOW(), last_login_ip = :ip WHERE id = :id')
   ->execute(['ip' => $_SERVER['REMOTE_ADDR'] ?? '', 'id' => $user['id']]);

unset($user['password_hash']);

startSecureSession();
if ($remember) {
    session_set_cookie_params(SESSION_LIFETIME);
}
$_SESSION['user'] = $user;
session_regenerate_id(true);

jsonResponse(true, ['user' => $user], 'Berhasil masuk.');
