// Point this at your XAMPP backend. Defaults to the standard XAMPP
// htdocs layout: C:\xampp\htdocs\laundry-backend -> http://localhost/laundry-backend
const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}/${path}`, {
    credentials: "include", // send/receive the PHP session cookie
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  let data = {};
  try {
    data = await res.json();
  } catch (_) {
    // non-JSON response (e.g. a PHP fatal error) — fall through to the generic error below
  }

  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  // --- auth ---
  login: (email, password) =>
    request("login.php", { method: "POST", body: JSON.stringify({ email, password }) }),
  signup: (fullName, email, password) =>
    request("signup.php", { method: "POST", body: JSON.stringify({ fullName, email, password }) }),
  logout: () => request("logout.php", { method: "POST" }),
  me: () => request("me.php"),

  // --- customers ---
  listCustomers: (params = {}) => request(`customers.php?${new URLSearchParams(params)}`),
  createCustomer: (data) => request("customers.php", { method: "POST", body: JSON.stringify(data) }),
  updateCustomer: (id, data) => request(`customers.php?id=${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCustomer: (id) => request(`customers.php?id=${id}`, { method: "DELETE" }),

  // --- services ---
  listServices: () => request("services.php"),
  createService: (data) => request("services.php", { method: "POST", body: JSON.stringify(data) }),
  updateService: (id, data) => request(`services.php?id=${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteService: (id) => request(`services.php?id=${id}`, { method: "DELETE" }),

  // --- orders ---
  listOrders: (params = {}) => request(`orders.php?${new URLSearchParams(params)}`),
  getOrder: (id) => request(`orders.php?id=${id}`),
  createOrder: (data) => request("orders.php", { method: "POST", body: JSON.stringify(data) }),
  setOrderStatus: (id, status) => request(`orders.php?id=${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  resendEmail: (orderId, event) => request("resend_email.php", { method: "POST", body: JSON.stringify({ orderId, event }) }),

  // --- dashboard / reports / public tracking ---
  dashboard: () => request("dashboard.php"),
  reports: (range) => request(`reports.php?range=${range}`),
  track: (trackingId) => request(`track.php?trackingId=${encodeURIComponent(trackingId)}`),
};
