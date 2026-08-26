import Card from "./Card";
import { useTheme } from "../context/ThemeContext";

export default function StatCard({ label, value, sub }) {
  const { t } = useTheme();
  return (
    <Card style={{ padding: "18px 20px" }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, fontWeight: 600, color: t.inkSoft }}>{label}</div>
      <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 26, fontWeight: 700, color: t.ink, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: t.inkSoft, marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}
