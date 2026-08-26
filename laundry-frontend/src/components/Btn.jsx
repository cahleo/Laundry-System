import { useTheme } from "../context/ThemeContext";

export default function Btn({ children, onClick, variant = "solid", style, disabled, type = "button" }) {
  const { t } = useTheme();
  const base = {
    fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13.5,
    padding: "9px 16px", borderRadius: 10, border: "none", cursor: disabled ? "default" : "pointer",
    display: "inline-flex", alignItems: "center", gap: 6, opacity: disabled ? 0.5 : 1,
    transition: "transform .12s ease", ...style,
  };
  if (variant === "solid") Object.assign(base, { background: t.cyan, color: "#04222B" });
  if (variant === "coral") Object.assign(base, { background: t.coral, color: "#3A140C" });
  if (variant === "ghost") Object.assign(base, { background: "transparent", color: t.ink, border: `1px solid ${t.line}` });
  if (variant === "danger") Object.assign(base, { background: "transparent", color: t.coral, border: `1px solid ${t.coral}55` });

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={base}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}
