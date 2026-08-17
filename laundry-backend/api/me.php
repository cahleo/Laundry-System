<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../includes/bootstrap.php';

if (empty($_SESSION['admin_id'])) {
  json_error('Not authenticated', 401);
}

json_ok(['admin' => [
  'id' => $_SESSION['admin_id'],
  'email' => $_SESSION['admin_email'] ?? null,
]]);
