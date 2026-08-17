<?php
require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../includes/auth.php';

require_admin();
$pdo = get_db();

$total = (int) $pdo->query('SELECT COUNT(*) FROM orders')->fetchColumn();
$pending = (int) $pdo->query("SELECT COUNT(*) FROM orders WHERE status <> 'picked_up'")->fetchColumn();
$completedToday = (int) $pdo->query('SELECT COUNT(*) FROM orders WHERE DATE(picked_up_at) = CURDATE()')->fetchColumn();
$incomeToday = (float) $pdo->query('SELECT COALESCE(SUM(price),0) FROM orders WHERE DATE(picked_up_at) = CURDATE()')->fetchColumn();

$trend = $pdo->query(
  "SELECT DATE(picked_up_at) AS d, COUNT(*) AS c FROM orders
   WHERE picked_up_at >= (CURDATE() - INTERVAL 6 DAY)
   GROUP BY DATE(picked_up_at)"
)->fetchAll();

$recent = $pdo->query(
  "SELECT o.id, o.tracking_id, o.status, o.price, o.created_at, c.full_name AS customer_name
   FROM orders o JOIN customers c ON c.id = o.customer_id
   ORDER BY o.created_at DESC LIMIT 6"
)->fetchAll();

json_ok([
  'totalOrders' => $total,
  'pending' => $pending,
  'completedToday' => $completedToday,
  'incomeToday' => $incomeToday,
  'trend' => $trend,
  'recent' => $recent,
]);
