import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Users, Shirt, BarChart3, LogOut } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/services", label: "Services", icon: Shirt },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

export default function Sidebar() {
  const { t } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div style={{ width: 220, flexShrink: 0, borderRight: `1px solid ${t.line}`, background: t.surfaceAlt, padding: 18, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, padding: "0 4px" }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: t.cyanSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Shirt size={16} color={t.cyan} />
        </div>
        <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 16, color: t.ink }}>BrightWash</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10,
              textDecoration: "none", background: isActive ? t.cyanSoft : "transparent", color: isActive ? t.cyan : t.inkSoft,
              fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13.5,
            })}
          >
            <Icon size={16} /> {label}
          </NavLink>
        ))}
      </div>

      <div style={{ marginTop: "auto", paddingTop: 18, borderTop: `1px solid ${t.line}` }}>
        <button onClick={handleLogout} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10,
          border: "none", background: "transparent", color: t.inkSoft, cursor: "pointer", width: "100%",
          textAlign: "left", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13.5,
        }}>
          <LogOut size={16} /> Log out
        </button>
      </div>
    </div>
  );
}
