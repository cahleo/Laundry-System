export function inputStyle(t) {
  return {
    background: t.surfaceAlt, border: `1px solid ${t.line}`, borderRadius: 9,
    padding: "9px 12px", fontFamily: "Inter, sans-serif", fontSize: 13.5, color: t.ink, outline: "none",
  };
}

export function tdStyle(t) {
  return {
    padding: "12px 14px", fontFamily: "Inter, sans-serif", fontSize: 13, color: t.ink,
    borderBottom: `1px solid ${t.line}`,
  };
}
