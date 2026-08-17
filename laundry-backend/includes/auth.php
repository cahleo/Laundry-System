<?php

// Call at the top of any endpoint that should require a logged-in admin.
// There is only one role in this app — being logged in IS being admin.
function require_admin(): array {
  if (empty($_SESSION['admin_id'])) {
    json_error('Not authenticated', 401);
  }
  return [
    'id' => $_SESSION['admin_id'],
    'email' => $_SESSION['admin_email'] ?? null,
  ];
}
