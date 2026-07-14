<?php
/**
 * register.php
 * Endpoint pendaftaran user baru. Menerima POST JSON:
 * { full_name, email, phone, password }
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Metode tidak diizinkan.', 405);
}

$body = getJsonBody();
$fullName = isset($body['full_name']) ? sanitize((string) $body['full_name']) : '';
$email = isset($body['email']) ? sanitize((string) $body['email']) : '';
$phone = isset($body['phone']) ? sanitize((string) $body['phone']) : '';
$password = (string) ($body['password'] ?? '');

$errors = [];

if (mb_strlen($fullName) < 3) {
    $errors['full_name'] = 'Nama lengkap minimal 3 karakter.';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Format email tidak valid.';
}
if (!preg_match('/^(\+62|62|0)8[1-9][0-9]{6,11}$/', $phone)) {
    $errors['phone'] = 'Nomor WhatsApp tidak valid.';
}
if (mb_strlen($password) < 8) {
    $errors['password'] = 'Kata sandi minimal 8 karakter.';
}

if (!empty($errors)) {
    jsonResponse(false, ['errors' => $errors], 'Data yang dikirim tidak valid.', 422);
}

$db = getDb();

$stmt = $db->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
$stmt->execute(['email' => $email]);
if ($stmt->fetch()) {
    jsonResponse(false, null, 'Email sudah terdaftar. Silakan masuk.', 409);
}

$uuid = sprintf(
    '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
    random_int(0, 0xffff), random_int(0, 0xffff),
    random_int(0, 0xffff),
    random_int(0, 0x0fff) | 0x4000,
    random_int(0, 0x3fff) | 0x8000,
    random_int(0, 0xffff), random_int(0, 0xffff), random_int(0, 0xffff)
);

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $db->prepare(
    'INSERT INTO users (uuid, full_name, email, phone, password_hash, role, status)
     VALUES (:uuid, :full_name, :email, :phone, :password_hash, "user", "active")'
);

try {
    $stmt->execute([
        'uuid' => $uuid,
        'full_name' => $fullName,
        'email' => $email,
        'phone' => $phone,
        'password_hash' => $passwordHash,
    ]);
} catch (PDOException $e) {
    jsonResponse(false, null, 'Gagal membuat akun. Silakan coba lagi.', 500);
}

jsonResponse(true, ['user_id' => $db->lastInsertId()], 'Akun berhasil dibuat. Silakan masuk.', 201);
