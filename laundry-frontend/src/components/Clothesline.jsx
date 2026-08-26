import { useTheme } from "../context/ThemeContext";

export default function Clothesline({ label }) {
  const { t } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 16px" }}>
      {label && (
        <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 13, color: t.inkSoft, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
          {label}
        </span>
      )}
      <div style={{ flex: 1, height: 0, borderTop: `2px dashed ${t.line}`, position: "relative" }}>
        {[0.18, 0.5, 0.82].map((p, i) => (
          <div key={i} style={{
            position: "absolute", left: `${p * 100}%`, top: -4, width: 8, height: 8,
            background: t.cyan, borderRadius: 2, transform: "translateX(-50%) rotate(45deg)",
          }} />
        ))}
      </div>
    </div>
  );
}
