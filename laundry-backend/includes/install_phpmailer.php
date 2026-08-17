<?php
// Automatic PHPMailer Downloader
$targetDir = __DIR__ . '/PHPMailer';

if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
}

$files = [
    'Exception.php' => 'https://raw.githubusercontent.com/PHPMailer/PHPMailer/master/src/Exception.php',
    'PHPMailer.php' => 'https://raw.githubusercontent.com/PHPMailer/PHPMailer/master/src/PHPMailer.php',
    'SMTP.php'      => 'https://raw.githubusercontent.com/PHPMailer/PHPMailer/master/src/SMTP.php'
];

echo "<h3>Downloading PHPMailer Files...</h3>";

foreach ($files as $filename => $url) {
    $content = @file_get_contents($url);
    if ($content !== false) {
        file_put_contents($targetDir . '/' . $filename, $content);
        echo "✅ Downloaded <strong>{$filename}</strong> successfully!<br>";
    } else {
        echo "❌ Failed to download <strong>{$filename}</strong>.<br>";
    }
}

echo "<br><strong>Done!</strong> Now try running <a href='test_mail.php'>test_mail.php</a> again.";