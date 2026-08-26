import { useTheme } from "../context/ThemeContext";

export default function IconBtn({ children, onClick, danger }) {
  const { t } = useTheme();
  return (
    <button onClick={onClick} style={{
      width: 30, height: 30, borderRadius: 8, border: `1px solid ${t.line}`, background: "transparent",
      color: danger ? t.coral : t.inkSoft, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
    }}>
      {children}
    </button>
  );
}
