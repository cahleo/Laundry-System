<?php
require_once __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_error('Method not allowed', 405);
}

$body = json_body();
$fullName = trim($body['fullName'] ?? '');
$email = trim($body['email'] ?? '');
$password = $body['password'] ?? '';

if ($fullName === '' || $email === '' || strlen($password) < 6) {
  json_error('Full name, email, and a password of at least 6 characters are required');
}

$pdo = get_db();

$existing = $pdo->prepare('SELECT id FROM admins WHERE email = ?');
$existing->execute([$email]);
if ($existing->fetch()) {
  json_error('An account with that email already exists', 409);
}

$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $pdo->prepare('INSERT INTO admins (full_name, email, password_hash) VALUES (?, ?, ?)');
$stmt->execute([$fullName, $email, $hash]);
$id = (int) $pdo->lastInsertId();

$_SESSION['admin_id'] = $id;
$_SESSION['admin_email'] = $email;

json_ok(['admin' => ['id' => $id, 'fullName' => $fullName, 'email' => $email]], 201);
