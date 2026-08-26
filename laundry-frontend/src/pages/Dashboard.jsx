import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { api } from "../lib/api";
import { peso, fmtDateTime, statusTone, STATUS_LABEL } from "../lib/format";
import Card from "../components/Card";
import StatCard from "../components/StatCard";
import Badge from "../components/Badge";
import Clothesline from "../components/Clothesline";

// Always show 7 points, even for days with 0 completions.
function buildTrend(rows) {
  const byDate = Object.fromEntries((rows || []).map((r) => [r.d, r.c]));
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ day: d.toLocaleDateString("en-PH", { weekday: "short" }), completed: Number(byDate[key] || 0) });
  }
  return days;
}

export default function Dashboard() {
  const { t } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.dashboard().then(setData).catch(() => setData(null));
  }, []);

  if (!data) {
    return <div style={{ fontFamily: "Inter, sans-serif", color: t.inkSoft }}>Loading…</div>;
  }

  const trend = buildTrend(data.trend);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        <StatCard label="Total orders" value={data.totalOrders} />
        <StatCard label="Pending" value={data.pending} sub="Not yet picked up" />
        <StatCard label="Completed today" value={data.completedToday} />
        <StatCard label="Today's income" value={peso(data.incomeToday)} />
      </div>

      <Clothesline label="This week" />
      <Card style={{ padding: "20px 20px 8px" }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13, color: t.inkSoft, marginBottom: 6 }}>
          Completed orders, last 7 days
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trend} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={t.line} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: t.inkSoft, fontFamily: "Inter, sans-serif" }} axisLine={{ stroke: t.line }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: t.inkSoft, fontFamily: "Inter, sans-serif" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 8, fontFamily: "Inter, sans-serif", fontSize: 12 }} />
            <Line type="monotone" dataKey="completed" stroke={t.cyan} strokeWidth={2.5} dot={{ r: 3, fill: t.cyan }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Clothesline label="Recent orders" />
      <Card style={{ padding: 8 }}>
        {(data.recent || []).map((o) => (
          <button key={o.id} onClick={() => navigate(`/orders/${o.id}`)} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 12px", background: "none", border: "none", borderBottom: `1px solid ${t.line}`,
            cursor: "pointer", textAlign: "left",
          }}>
            <div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12.5, color: t.ink, fontWeight: 500 }}>{o.tracking_id}</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: t.inkSoft, marginTop: 2 }}>{fmtDateTime(o.created_at)}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Badge tone={statusTone(o.status)}>{STATUS_LABEL[o.status]}</Badge>
              <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13, color: t.ink }}>{peso(o.price)}</span>
              <ChevronRight size={15} color={t.inkSoft} />
            </div>
          </button>
        ))}
        {(data.recent || []).length === 0 &&(
          <div style={{ padding: 20, textAlign: "center", color: t.inkSoft, fontFamily: "Inter, sans-serif", fontSize: 13 }}>No orders yet.</div>
        )}
      </Card>
    </div>
  );
}
