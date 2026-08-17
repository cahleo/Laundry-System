import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import OrdersPage from "./pages/OrdersPage";
import OrderDetail from "./pages/OrderDetail";
import CustomersPage from "./pages/CustomersPage";
import ServicesPage from "./pages/ServicesPage";
import ReportsPage from "./pages/ReportsPage";
import TrackPage from "./pages/TrackPage";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes — no login required */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/track" element={<TrackPage />} />
              <Route path="/track/:trackingId" element={<TrackPage />} />

              {/* Admin routes — everything under here needs a session */}
              <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="reports" element={<ReportsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
