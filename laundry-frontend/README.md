# BrightWash Laundry — Admin frontend

A Vite + React app, split into modules (was previously one big `laundry-admin.jsx`
artifact file). Talks to the PHP/MySQL backend in `laundry-backend/`.

## Setup

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Connecting to the backend

`src/lib/api.js` has one line to check:

```js
const API_BASE = "http://localhost/laundry-backend/api";
```

This assumes you copied `laundry-backend` into XAMPP's `htdocs` folder as-is
(`C:\xampp\htdocs\laundry-backend` on Windows, `/Applications/XAMPP/htdocs/laundry-backend`
on Mac). If you renamed that folder, update `API_BASE` to match.

Also make sure `FRONTEND_ORIGIN` in `laundry-backend/config.php` matches this
dev server's origin (`http://localhost:5173` by default) — the backend only
allows cross-port requests from that exact origin, and only with credentials
(session cookies) enabled, which `api.js` already does.

## Folder guide

```
src/
  lib/
    api.js        one function per backend endpoint — the only file that
                   knows the PHP API's URLs and request shapes
    format.js      peso(), fmtDate(), STATUS_LABEL, STATUSES, statusTone()
  context/
    AuthContext    current admin + login/signup/logout, backed by api.me()
    ThemeContext    light/dark theme tokens
    ToastContext    the little bottom-right confirmation/error toasts
  components/       shared building blocks (Card, Btn, Modal, WasherRing, ...)
  pages/            one file per route (Dashboard, OrdersPage, OrderDetail, ...)
  App.jsx           routes — this is the map of the whole app
```

If something breaks, this structure is the point: open the one page or
component involved instead of scrolling through a 1,300-line file.
