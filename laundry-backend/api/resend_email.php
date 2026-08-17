<?php
require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/mailer.php';

require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_error('Method not allowed', 405);
}

$b = json_body();
$orderId = (int) ($b['orderId'] ?? 0);
$event = $b['event'] ?? 'order_created';

if (!$orderId) {
  json_error('Missing orderId');
}
if (!in_array($event, ['order_created', 'ready_for_pickup'], true)) {
  json_error('Invalid event');
}

$pdo = get_db();
$result = send_order_email($pdo, $orderId, $event);

json_ok(['email' => $result]);
