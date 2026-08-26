import { useTheme } from "../context/ThemeContext";

export default function InfoBit({ label, value }) {
  const { t } = useTheme();
  return (
    <div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, fontWeight: 600, color: t.inkSoft, textTransform: "uppercase", letterSpacing: 0.4 }}>
        {label}
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: t.ink, marginTop: 3 }}>
        {value || "—"}
      </div>
    </div>
  );
}
