import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Toast from "./Toast";
import { useTheme } from "../context/ThemeContext";

export default function AdminLayout() {
  const { t } = useTheme();
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: t.bg, color: t.ink, fontFamily: "Inter, sans-serif" }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Topbar />
        <div style={{ padding: "20px 28px 48px" }}>
          <Outlet />
        </div>
      </div>
      <Toast />
    </div>
  );
}
