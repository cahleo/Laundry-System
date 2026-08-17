<?php
require_once __DIR__ . '/../includes/bootstrap.php';
// Deliberately no require_admin() here — this is the one public endpoint,
// used by the customer-facing /track/:trackingId page.

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  json_error('Method not allowed', 405);
}

$trackingId = trim($_GET['trackingId'] ?? '');
if ($trackingId === '') {
  json_error('Missing trackingId');
}

$pdo = get_db();
$stmt = $pdo->prepare(
  "SELECT o.id, o.tracking_id, o.status, o.created_at, o.estimated_finish, o.picked_up_at,
          c.full_name AS customer_name
   FROM orders o
   JOIN customers c ON c.id = o.customer_id
   WHERE o.tracking_id = ?"
);
$stmt->execute([$trackingId]);
$order = $stmt->fetch();

if (!$order) {
  json_error('No order found for that tracking id', 404);
}

$hist = $pdo->prepare('SELECT new_status, changed_at FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC');
$hist->execute([$order['id']]);

json_ok(['order' => [
  'customerName' => $order['customer_name'],
  'trackingId' => $order['tracking_id'],
  'dateReceived' => $order['created_at'],
  'estimatedCompletion' => $order['estimated_finish'],
  'status' => $order['status'],
  'pickedUp' => $order['status'] === 'picked_up',
  'timeline' => $hist->fetchAll(),
]]);
