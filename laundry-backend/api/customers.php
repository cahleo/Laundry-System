<?php
require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../includes/auth.php';

$admin = require_admin();
$pdo = get_db();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $q = trim($_GET['q'] ?? '');
  $page = max(0, (int) ($_GET['page'] ?? 0));
  $pageSize = min(50, max(1, (int) ($_GET['pageSize'] ?? 8)));

  $where = '';
  $params = [];
  if ($q !== '') {
    $where = 'WHERE full_name LIKE ? OR phone LIKE ? OR email LIKE ?';
    $like = "%$q%";
    $params = [$like, $like, $like];
  }

  $countStmt = $pdo->prepare("SELECT COUNT(*) FROM customers $where");
  $countStmt->execute($params);
  $total = (int) $countStmt->fetchColumn();

  $offset = $page * $pageSize;
  $stmt = $pdo->prepare(
    "SELECT c.*, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS order_count
     FROM customers c $where
     ORDER BY c.created_at DESC
     LIMIT $pageSize OFFSET $offset"
  );
  $stmt->execute($params);

  json_ok(['customers' => $stmt->fetchAll(), 'total' => $total]);
}

if ($method === 'POST') {
  $b = json_body();
  $fullName = trim($b['fullName'] ?? '');
  if ($fullName === '') {
    json_error('Full name is required');
  }
  $stmt = $pdo->prepare('INSERT INTO customers (full_name, phone, email, created_by) VALUES (?, ?, ?, ?)');
  $stmt->execute([$fullName, $b['phone'] ?? null, $b['email'] ?? null, $admin['id']]);
  json_ok(['id' => (int) $pdo->lastInsertId()], 201);
}

if ($method === 'PUT') {
  $id = (int) ($_GET['id'] ?? 0);
  if (!$id) {
    json_error('Missing id');
  }
  $b = json_body();
  $fullName = trim($b['fullName'] ?? '');
  if ($fullName === '') {
    json_error('Full name is required');
  }
  $stmt = $pdo->prepare('UPDATE customers SET full_name = ?, phone = ?, email = ? WHERE id = ?');
  $stmt->execute([$fullName, $b['phone'] ?? null, $b['email'] ?? null, $id]);
  json_ok();
}

if ($method === 'DELETE') {
  $id = (int) ($_GET['id'] ?? 0);
  if (!$id) {
    json_error('Missing id');
  }
  try {
    $stmt = $pdo->prepare('DELETE FROM customers WHERE id = ?');
    $stmt->execute([$id]);
    json_ok();
  } catch (PDOException $e) {
    // Foreign key from orders.customer_id blocks this — surface a clean message.
    json_error("Can't delete — this customer has existing orders", 409);
  }
}

json_error('Method not allowed', 405);
