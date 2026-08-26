import { Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";

export default function Toast() {
  const { t } = useTheme();
  const { toast } = useToast();
  if (!toast) return null;

  const tone = toast.type === "error" ? t.coral : t.green;
  const soft = toast.type === "error" ? t.coralSoft : t.greenSoft;

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, background: soft, color: tone,
      border: `1px solid ${tone}55`, borderRadius: 12, padding: "12px 18px",
      fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13.5,
      display: "flex", alignItems: "center", gap: 8, zIndex: 200, boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    }}>
      <Check size={16} /> {toast.msg}
    </div>
  );
}
