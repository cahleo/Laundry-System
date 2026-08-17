import { Shirt } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { STATUSES, STATUS_LABEL } from "../lib/format";

export default function WasherRing({ statusIndex, size = 186, trackingId }) {
  const { t } = useTheme();
  const n = STATUSES.length;
  const R = size / 2 - 22;
  const cx = size / 2, cy = size / 2;

  const pts = STATUSES.map((_, i) => {
    const angle = -90 + (i * 360) / n;
    const rad = (angle * Math.PI) / 180;
    return { x: cx + R * Math.cos(rad), y: cy + R * Math.sin(rad) };
  });

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={t.line} strokeWidth={2} />
        {pts.map((p, i) => {
          const reached = i <= statusIndex;
          const next = pts[(i + 1) % n];
          const segReached = i < statusIndex;
          return (
            <g key={i}>
              {i < n - 1 && (
                <line x1={p.x} y1={p.y} x2={next.x} y2={next.y} stroke={segReached ? t.cyan : t.line} strokeWidth={segReached ? 3 : 2} />
              )}
              <circle
                cx={p.x} cy={p.y} r={reached ? 7 : 5.5}
                fill={reached ? (i === statusIndex ? t.coral : t.cyan) : t.surface}
                stroke={reached ? "none" : t.line} strokeWidth={1.5}
              />
            </g>
          );
        })}
      </svg>
      <div style={{
        position: "absolute", inset: size * 0.19, borderRadius: "50%",
        background: t.cyanSoft, border: `1px solid ${t.line}`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: 8,
      }}>
        <Shirt size={22} color={t.cyan} style={{ animation: statusIndex < n - 1 ? "spin 6s linear infinite" : "none" }} />
        <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 12.5, color: t.ink, marginTop: 6 }}>
          {STATUS_LABEL[STATUSES[statusIndex]]}
        </div>
        {trackingId && (
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: t.inkSoft, marginTop: 2 }}>
            {trackingId}
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { svg *, div { animation: none !important; } }
      `}</style>
    </div>
  );
}
