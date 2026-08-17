<?php

function json_ok($data = [], int $code = 200): void {
  http_response_code($code);
  $payload = is_array($data) ? $data : ['data' => $data];
  echo json_encode(['ok' => true] + $payload);
  exit;
}

function json_error(string $message, int $code = 400): void {
  http_response_code($code);
  echo json_encode(['ok' => false, 'error' => $message]);
  exit;
}
