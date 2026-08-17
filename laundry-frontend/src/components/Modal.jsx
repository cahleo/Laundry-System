import { X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Modal({ title, onClose, children, width = 460 }) {
  const { t } = useTheme();
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(10,20,30,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 150, padding: 16 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 18, width, maxWidth: "100%", maxHeight: "88vh", overflowY: "auto", padding: 24 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 17, color: t.ink, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.inkSoft }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
