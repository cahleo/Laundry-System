<?php
// Enable full error reporting so we can see the exact error on screen
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'mailer.php';

// Try sending a direct test email
$result = send_gmail('alyyri3go@gmail.com', 'Test User', 'Test Email', '<p>Testing setup!</p>');

echo '<pre>';
print_r($result);
echo '</pre>';