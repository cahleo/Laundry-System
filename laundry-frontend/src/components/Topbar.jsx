import { useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const TITLES = {
  "/": "Dashboard",
  "/orders": "Orders",
  "/customers": "Customers",
  "/services": "Services",
  "/reports": "Reports",
};

export default function Topbar() {
  const { t, dark, setDark } = useTheme();
  const location = useLocation();
  const title = TITLES[location.pathname] || (location.pathname.startsWith("/orders/") ? "Order detail" : "");

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 28px", borderBottom: `1px solid ${t.line}` }}>
      <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 19, color: t.ink, margin: 0 }}>{title}</h1>
      <button onClick={() => setDark((d) => !d)} style={{ background: "none", border: `1px solid ${t.line}`, borderRadius: 8, padding: 7, cursor: "pointer", color: t.ink, display: "flex" }}>
        {dark ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </div>
  );
}
