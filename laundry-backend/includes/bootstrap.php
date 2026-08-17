<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/response.php';

// CORS — only allow the configured frontend origin, with credentials
// (session cookies) so the React app can call this API cross-port.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === FRONTEND_ORIGIN) {
  header("Access-Control-Allow-Origin: $origin");
  header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Preflight requests end here.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'samesite' => 'Lax']);
session_start();

function json_body(): array {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}
