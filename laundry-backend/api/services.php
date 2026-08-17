<?php
require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../includes/auth.php';

require_admin();
$pdo = get_db();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $rows = $pdo->query('SELECT * FROM service_types ORDER BY created_at DESC')->fetchAll();
  foreach ($rows as &$r) {
    $r['is_active'] = (bool) $r['is_active'];
  }
  json_ok(['services' => $rows]);
}

if ($method === 'POST') {
  $b = json_body();
  $name = trim($b['name'] ?? '');
  $price = (float) ($b['pricePerKg'] ?? 0);
  if ($name === '' || $price <= 0) {
    json_error('Name and a positive price per kg are required');
  }
  $active = array_key_exists('active', $b) ? ($b['active'] ? 1 : 0) : 1;
  $stmt = $pdo->prepare('INSERT INTO service_types (name, price_per_kg, is_active) VALUES (?, ?, ?)');
  $stmt->execute([$name, $price, $active]);
  json_ok(['id' => (int) $pdo->lastInsertId()], 201);
}

if ($method === 'PUT') {
  $id = (int) ($_GET['id'] ?? 0);
  if (!$id) {
    json_error('Missing id');
  }
  $b = json_body();
  $fields = [];
  $params = [];
  if (array_key_exists('name', $b)) { $fields[] = 'name = ?'; $params[] = trim($b['name']); }
  if (array_key_exists('pricePerKg', $b)) { $fields[] = 'price_per_kg = ?'; $params[] = (float) $b['pricePerKg']; }
  if (array_key_exists('active', $b)) { $fields[] = 'is_active = ?'; $params[] = $b['active'] ? 1 : 0; }
  if (!$fields) {
    json_error('Nothing to update');
  }
  $params[] = $id;
  $stmt = $pdo->prepare('UPDATE service_types SET ' . implode(', ', $fields) . ' WHERE id = ?');
  $stmt->execute($params);
  json_ok();
}

if ($method === 'DELETE') {
  $id = (int) ($_GET['id'] ?? 0);
  if (!$id) {
    json_error('Missing id');
  }
  try {
    $stmt = $pdo->prepare('DELETE FROM service_types WHERE id = ?');
    $stmt->execute([$id]);
    json_ok();
  } catch (PDOException $e) {
    json_error("Can't delete — this service is used by existing orders", 409);
  }
}

json_error('Method not allowed', 405);
