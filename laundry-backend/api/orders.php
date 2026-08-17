<?php
require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/mailer.php';

$admin = require_admin();
$pdo = get_db();
$method = $_SERVER['REQUEST_METHOD'];

function generate_tracking_id(PDO $pdo): string {
  $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  do {
    $id = 'LX-';
    for ($i = 0; $i < 6; $i++) {
      $id .= $chars[random_int(0, strlen($chars) - 1)];
    }
    $stmt = $pdo->prepare('SELECT id FROM orders WHERE tracking_id = ?');
    $stmt->execute([$id]);
  } while ($stmt->fetch());
  return $id;
}

// ---- GET single order (with status history) ----
if ($method === 'GET' && isset($_GET['id'])) {
  $id = (int) $_GET['id'];
  $stmt = $pdo->prepare(
    "SELECT o.*, c.full_name AS customer_name, c.phone AS customer_phone, c.email AS customer_email,
            s.name AS service_name
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     JOIN service_types s ON s.id = o.service_type_id
     WHERE o.id = ?"
  );
  $stmt->execute([$id]);
  $order = $stmt->fetch();
  if (!$order) {
    json_error('Order not found', 404);
  }
  $hist = $pdo->prepare('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC');
  $hist->execute([$id]);
  $order['status_history'] = $hist->fetchAll();
  json_ok(['order' => $order]);
}

// ---- GET list (search + status filter + pagination) ----
if ($method === 'GET') {
  $q = trim($_GET['q'] ?? '');
  $status = trim($_GET['status'] ?? '');
  $page = max(0, (int) ($_GET['page'] ?? 0));
  $pageSize = min(50, max(1, (int) ($_GET['pageSize'] ?? 8)));

  $where = [];
  $params = [];
  if ($q !== '') {
    $where[] = '(c.full_name LIKE ? OR c.phone LIKE ? OR c.email LIKE ? OR o.tracking_id LIKE ?)';
    $like = "%$q%";
    array_push($params, $like, $like, $like, $like);
  }
  if ($status !== '' && $status !== 'all') {
    $where[] = 'o.status = ?';
    $params[] = $status;
  }
  $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

  $countStmt = $pdo->prepare("SELECT COUNT(*) FROM orders o JOIN customers c ON c.id = o.customer_id $whereSql");
  $countStmt->execute($params);
  $total = (int) $countStmt->fetchColumn();

  $offset = $page * $pageSize;
  $stmt = $pdo->prepare(
    "SELECT o.id, o.tracking_id, o.weight_kg, o.price, o.status, o.created_at, o.estimated_finish,
            c.full_name AS customer_name, s.name AS service_name
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     JOIN service_types s ON s.id = o.service_type_id
     $whereSql
     ORDER BY o.created_at DESC
     LIMIT $pageSize OFFSET $offset"
  );
  $stmt->execute($params);

  json_ok(['orders' => $stmt->fetchAll(), 'total' => $total]);
}

// ---- POST create order ----
if ($method === 'POST') {
  $b = json_body();
  $customerId = (int) ($b['customerId'] ?? 0);
  $serviceTypeId = (int) ($b['serviceTypeId'] ?? 0);
  $weight = (float) ($b['weightKg'] ?? 0);
  $estimatedFinish = $b['estimatedFinish'] ?? null;

  if (!$customerId || !$serviceTypeId || $weight <= 0) {
    json_error('Customer, service, and a positive weight are required');
  }

  $svcStmt = $pdo->prepare('SELECT price_per_kg FROM service_types WHERE id = ?');
  $svcStmt->execute([$serviceTypeId]);
  $svc = $svcStmt->fetch();
  if (!$svc) {
    json_error('Service type not found', 404);
  }

  $price = array_key_exists('price', $b) ? (float) $b['price'] : round($weight * (float) $svc['price_per_kg'], 2);
  $trackingId = generate_tracking_id($pdo);

  $pdo->beginTransaction();
  try {
    $ins = $pdo->prepare(
      'INSERT INTO orders (tracking_id, customer_id, service_type_id, weight_kg, price, status, estimated_finish, notes, created_by)
       VALUES (?, ?, ?, ?, ?, "received", ?, ?, ?)'
    );
    $ins->execute([$trackingId, $customerId, $serviceTypeId, $weight, $price, $estimatedFinish, $b['notes'] ?? null, $admin['id']]);
    $orderId = (int) $pdo->lastInsertId();

    $h = $pdo->prepare('INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by) VALUES (?, NULL, "received", ?)');
    $h->execute([$orderId, $admin['id']]);

    $pdo->commit();
  } catch (Exception $e) {
    $pdo->rollBack();
    json_error('Could not create order', 500);
  }

  $mailResult = send_order_email($pdo, $orderId, 'order_created');
  json_ok(['id' => $orderId, 'trackingId' => $trackingId, 'email' => $mailResult], 201);
}

// ---- PATCH status update (advance button or manual dropdown) ----
if ($method === 'PATCH' && isset($_GET['id'])) {
  $id = (int) $_GET['id'];
  $b = json_body();
  $newStatus = $b['status'] ?? '';
  $valid = ['received', 'sorting', 'washing', 'drying', 'folding', 'ready_for_pickup', 'picked_up'];
  if (!in_array($newStatus, $valid, true)) {
    json_error('Invalid status');
  }

  $cur = $pdo->prepare('SELECT status FROM orders WHERE id = ?');
  $cur->execute([$id]);
  $row = $cur->fetch();
  if (!$row) {
    json_error('Order not found', 404);
  }
  $prevStatus = $row['status'];
  if ($prevStatus === $newStatus) {
    json_ok(['unchanged' => true]);
  }

  $pdo->beginTransaction();
  try {
    $upd = $pdo->prepare(
      'UPDATE orders SET status = ?, picked_up_at = CASE WHEN ? = "picked_up" THEN NOW() ELSE picked_up_at END WHERE id = ?'
    );
    $upd->execute([$newStatus, $newStatus, $id]);

    $h = $pdo->prepare('INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by) VALUES (?, ?, ?, ?)');
    $h->execute([$id, $prevStatus, $newStatus, $admin['id']]);

    $pdo->commit();
  } catch (Exception $e) {
    $pdo->rollBack();
    json_error('Could not update status', 500);
  }

  $mailResult = null;
  if ($newStatus === 'ready_for_pickup') {
    $mailResult = send_order_email($pdo, $id, 'ready_for_pickup');
  }
  json_ok(['status' => $newStatus, 'email' => $mailResult]);
}

json_error('Method not allowed', 405);
