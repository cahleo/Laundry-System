<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


// --- REST OF YOUR DB & LOGIN CODE GOES HERE ---

require_once __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_error('Method not allowed', 405);
}

$body = json_body();
$email = trim($body['email'] ?? '');
$password = $body['password'] ?? '';

if ($email === '' || $password === '') {
  json_error('Email and password are required');
}

$pdo = get_db();
$stmt = $pdo->prepare('SELECT * FROM admins WHERE email = ?');
$stmt->execute([$email]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($password, $admin['password_hash'])) {
  json_error('Invalid email or password', 401);
}

$_SESSION['admin_id'] = $admin['id'];
$_SESSION['admin_email'] = $admin['email'];

json_ok(['admin' => [
  'id' => $admin['id'],
  'fullName' => $admin['full_name'],
  'email' => $admin['email'],
]]);
