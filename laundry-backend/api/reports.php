<?php
require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../includes/auth.php';

require_admin();
$pdo = get_db();

$range = $_GET['range'] ?? 'daily';
$formats = ['daily' => '%Y-%m-%d', 'weekly' => '%x-W%v', 'monthly' => '%Y-%m'];
$fmt = $formats[$range] ?? $formats['daily'];

$stmt = $pdo->prepare(
  "SELECT DATE_FORMAT(picked_up_at, ?) AS bucket, COUNT(*) AS order_count, COALESCE(SUM(price),0) AS income
   FROM orders
   WHERE picked_up_at IS NOT NULL
   GROUP BY bucket
   ORDER BY bucket DESC
   LIMIT 10"
);
$stmt->execute([$fmt]);
$rows = array_reverse($stmt->fetchAll());

json_ok(['range' => $range, 'data' => $rows]);
