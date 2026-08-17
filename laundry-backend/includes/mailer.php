<?php
// Load PHPMailer via Composer or fallback to direct folder inclusion
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
} elseif (file_exists(__DIR__ . '/PHPMailer/PHPMailer.php')) {
    require_once __DIR__ . '/PHPMailer/Exception.php';
    require_once __DIR__ . '/PHPMailer/PHPMailer.php';
    require_once __DIR__ . '/PHPMailer/SMTP.php';
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Define default constants
if (!defined('GMAIL_USER'))      define('GMAIL_USER', 'alyyri3go@gmail.com');
if (!defined('GMAIL_APP_PASS'))  define('GMAIL_APP_PASS', 'lclyhheckavsrhfm');
if (!defined('SHOP_NAME'))       define('SHOP_NAME', 'Clean Track');
if (!defined('TRACK_URL_BASE'))  define('TRACK_URL_BASE', 'http://localhost/brightwash/track.php');

// Low-level send via Gmail SMTP.
function send_gmail(string $toEmail, string $toName, string $subject, string $htmlBody): array {
  $mail = new PHPMailer(true);
  try {
    // Explicitly define credentials to avoid defined constant collisions
    $username = 'alyyri3go@gmail.com';
    $password = 'lclyhheckavsrhfm';

    // Server settings
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = $username;
    $mail->Password   = $password;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // Localhost SSL certificate bypass
    $mail->SMTPOptions = [
      'ssl' => [
        'verify_peer'       => false,
        'verify_peer_name'  => false,
        'allow_self_signed' => true,
      ],
    ];

    // Recipients
    $mail->setFrom($username, SHOP_NAME);
    $mail->addAddress($toEmail, $toName);

    // Content
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body    = $htmlBody;
    $mail->AltBody = strip_tags($htmlBody);

    $mail->send();
    return ['status' => 'sent', 'error' => null];
  } catch (Exception $e) {
    return ['status' => 'failed', 'error' => $mail->ErrorInfo];
  }
}

// Builds and sends order notification email
function send_order_email(PDO $pdo, int $orderId, string $event): array {
  $stmt = $pdo->prepare(
    'SELECT o.*, c.full_name AS customer_name, c.email AS customer_email, s.name AS service_name
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     JOIN service_types s ON s.id = o.service_type_id
     WHERE o.id = ?'
  );
  $stmt->execute([$orderId]);
  $order = $stmt->fetch();

  if (!$order) {
    $result = ['status' => 'failed', 'error' => 'Order not found'];
    log_notification($pdo, $orderId, $event, null, $result);
    return $result;
  }
  if (empty($order['customer_email'])) {
    $result = ['status' => 'failed', 'error' => 'Customer has no email on file'];
    log_notification($pdo, $orderId, $event, null, $result);
    return $result;
  }

  $trackUrl = rtrim(TRACK_URL_BASE, '/') . '/' . rawurlencode($order['tracking_id']);
  $name     = htmlspecialchars($order['customer_name']);
  $shop     = htmlspecialchars(SHOP_NAME);

  if ($event === 'order_created') {
    $subject = SHOP_NAME . ' — we\'ve received your laundry (' . $order['tracking_id'] . ')';
    $est = $order['estimated_finish'] ? date('M j, Y', strtotime($order['estimated_finish'])) : 'soon';
    $body = "
      <p>Hi {$name},</p>
      <p>We've received your laundry — <strong>{$order['weight_kg']} kg</strong> of " . htmlspecialchars($order['service_name']) . ".</p>
      <p>Tracking ID: <strong>{$order['tracking_id']}</strong><br>
      Estimated ready: {$est}</p>
      <p><a href=\"{$trackUrl}\" style=\"background:#1FA9C7;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block\">Track your order</a></p>
      <p>— {$shop}</p>
    ";
  } elseif ($event === 'ready_for_pickup') {
    $subject = SHOP_NAME . ' — your laundry is ready for pickup! (' . $order['tracking_id'] . ')';
    $body = "
      <p>Hi {$name},</p>
      <p>Good news — your laundry (<strong>{$order['tracking_id']}</strong>) is ready for pickup.</p>
      <p><a href=\"{$trackUrl}\" style=\"background:#FF6F59;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block\">View order status</a></p>
      <p>— {$shop}</p>
    ";
  } else {
    $result = ['status' => 'failed', 'error' => 'Unknown event: ' . $event];
    log_notification($pdo, $orderId, $event, $order['customer_email'], $result);
    return $result;
  }

  $result = send_gmail($order['customer_email'], $order['customer_name'], $subject, $body);
  log_notification($pdo, $orderId, $event, $order['customer_email'], $result);
  return $result;
}

function log_notification(PDO $pdo, int $orderId, string $event, ?string $recipient, array $result): void {
  $stmt = $pdo->prepare(
    'INSERT INTO notification_log (order_id, event, recipient_email, status, error_message, sent_at)
     VALUES (?, ?, ?, ?, ?, NOW())'
  );
  $stmt->execute([$orderId, $event, $recipient, $result['status'], $result['error']]);
}