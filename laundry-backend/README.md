# Laundry backend — PHP + MySQL (XAMPP)

## Modules

```
laundry-backend/
  config.php            DB + Gmail + frontend-origin settings (edit this)
  db.sql                Schema + starter service catalog
  install.php           Creates the database via PHP/PDO (run once in browser)
  includes/
    db.php              PDO connection
    bootstrap.php       CORS + session + JSON body helper (included by every api/*.php)
    auth.php            require_admin() session guard
    response.php        json_ok() / json_error() helpers
    mailer.php          Gmail SMTP via PHPMailer, builds + logs both email templates
  api/
    signup.php          POST — create an admin account
    login.php            POST — sign in
    logout.php           POST — sign out
    me.php                GET  — check current session
    customers.php        GET/POST/PUT/DELETE — customer CRUD
    services.php         GET/POST/PUT/DELETE — service catalog CRUD
    orders.php            GET/POST/PATCH — list, detail, create, status changes
    resend_email.php     POST — "Resend email" button
    track.php             GET — public, no auth (used by /track/:id)
    dashboard.php         GET — stat cards + trend + recent orders
    reports.php            GET — daily/weekly/monthly aggregates
```

Every endpoint is its own file, so if something breaks you know exactly
where to look (e.g. a 500 on creating an order → open `api/orders.php`).

## 1. Install

1. Copy the whole `laundry-backend` folder into your XAMPP `htdocs`:
   - Windows: `C:\xampp\htdocs\laundry-backend`
   - macOS: `/Applications/XAMPP/htdocs/laundry-backend`
2. Start **Apache** and **MySQL** in the XAMPP control panel.
3. Install PHPMailer (used for Gmail SMTP):
   ```
   cd path/to/htdocs/laundry-backend
   composer install
   ```
   No Composer? Install it from https://getcomposer.org/ first.

## 2. Create the database (via PHP, not phpMyAdmin)

Open in your browser:

```
http://localhost/laundry-backend/install.php
```

This connects with the credentials in `config.php`, creates the
`laundry_db` database if it doesn't exist, and runs every statement in
`db.sql` (tables + a 5-row starter service catalog). You'll see a plain
text log of each statement. Safe to re-run.

If it fails, it's almost always one of:
- MySQL isn't running in XAMPP
- `DB_USER` / `DB_PASS` in `config.php` don't match your MySQL root
  credentials (XAMPP default is `root` with an **empty** password)

## 3. Configure `config.php`

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'laundry_db');
define('DB_USER', 'root');
define('DB_PASS', '');

define('GMAIL_USER', 'youraddress@gmail.com');
define('GMAIL_APP_PASSWORD', 'xxxx xxxx xxxx xxxx');

define('FRONTEND_ORIGIN', 'http://localhost:5173');
define('TRACK_URL_BASE', 'http://localhost:5173/track');
```

### Getting a Gmail App Password

Gmail rejects your normal password for SMTP apps — you need a 16-character
**App Password** instead:

1. On the Gmail account you want to send from, turn on
   **2-Step Verification** (Google Account → Security).
2. Go to Google Account → Security → **App passwords**.
3. Create one named e.g. "BrightWash backend", choose "Mail".
4. Copy the 16-character code into `GMAIL_APP_PASSWORD` (spaces are fine).

Until this is set correctly, order-related emails will fail and get
logged to `notification_log` with `status = 'failed'` — the app keeps
working, it just won't actually deliver mail.

## 4. Create your first admin account

There's no seeded login — create one by POSTing to `signup.php`. Easiest
with curl (Windows: use Git Bash or WSL, or swap in Postman):

```bash
curl -i -X POST http://localhost/laundry-backend/api/signup.php \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Admin","email":"admin@brightwash.ph","password":"admin123"}'
```

Or just use the "Create account" tab on the frontend's login screen —
it calls this same endpoint.

## 5. Smoke test

```
http://localhost/laundry-backend/api/track.php?trackingId=TEST
```
should return `{"ok":false,"error":"No order found for that tracking id"}` —
that confirms PHP is talking to MySQL correctly (this one endpoint needs
no login).

## Notes

- Every account created via `signup.php` is a full admin — there's only
  one role, matching the original spec.
- Deleting a customer or service that has existing orders returns a
  friendly 409 error instead of a raw SQL failure (enforced by foreign
  keys with `ON DELETE RESTRICT`).
- `FRONTEND_ORIGIN` must exactly match the URL your React dev server
  runs on, or the browser will block the requests (CORS) and cookies
  won't be sent.
