<?php
// Run this once in your browser:
//   http://localhost/laundry-backend/install.php
// It connects with the credentials in config.php, creates the database
// if needed, and runs every statement in db.sql. Safe to re-run — table
// creation uses IF NOT EXISTS-style statements where it matters.

require_once __DIR__ . '/config.php';

header('Content-Type: text/plain; charset=utf-8');

try {
    // Connect WITHOUT selecting a database yet — it may not exist.
    $pdo = new PDO('mysql:host=' . DB_HOST . ';charset=utf8mb4', DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    $sqlFile = __DIR__ . '/db.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception('db.sql not found next to install.php');
    }

    // Strip full-line comments, then split into individual statements.
    $lines = explode("\n", file_get_contents($sqlFile));
    $lines = array_filter($lines, fn($l) => strpos(ltrim($l), '--') !== 0);
    $sql = implode("\n", $lines);
    $statements = array_filter(array_map('trim', explode(';', $sql)));

    echo "Connected to MySQL at " . DB_HOST . "\n";
    echo "Running " . count($statements) . " statements from db.sql...\n\n";

    foreach ($statements as $stmt) {
        if ($stmt === '') continue;
        $pdo->exec($stmt);
        $label = strtok($stmt, "\n");
        echo "OK  " . substr($label, 0, 78) . "\n";
    }

    echo "\nDatabase '" . DB_NAME . "' is ready with 5 starter service types.\n";
    echo "Next: create your first admin account by POSTing to api/signup.php\n";
    echo "(see README.md for a ready-to-paste curl command), then log in\n";
    echo "from the frontend.\n";
} catch (Exception $e) {
    http_response_code(500);
    echo "Setup failed: " . $e->getMessage() . "\n";
    echo "\nCheck that MySQL is running in XAMPP and DB_USER/DB_PASS in\n";
    echo "config.php match your MySQL root credentials (usually root / empty).\n";
}
