import { useTheme } from "../context/ThemeContext";

export default function Field({ label, children }) {
  const { t } = useTheme();
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "Inter, sans-serif" }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: t.inkSoft }}>{label}</span>
      {children}
    </label>
  );
}
