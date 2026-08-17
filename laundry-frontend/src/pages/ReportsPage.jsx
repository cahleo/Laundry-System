import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "../context/ThemeContext";
import { api } from "../lib/api";
import { peso } from "../lib/format";
import Card from "../components/Card";
import StatCard from "../components/StatCard";
import Clothesline from "../components/Clothesline";

export default function ReportsPage() {
  const { t } = useTheme();
  const [range, setRange] = useState("daily");
  const [data, setData] = useState([]);

  useEffect(() => {
    api.reports(range).then((r) =>
      setData(r.data.map((d) => ({ label: d.bucket, income: Number(d.income), count: Number(d.order_count) })))
    );
  }, [range]);

  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const totalOrders = data.reduce((s, d) => s + d.count, 0);

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {["daily", "weekly", "monthly"].map((r) => (
          <button key={r} onClick={() => setRange(r)} style={{
            fontSize: 12.5, fontWeight: 600, padding: "7px 14px", borderRadius: 999, border: "none", cursor: "pointer",
            background: range === r ? t.cyan : t.surfaceAlt, color: range === r ? "#04222B" : t.inkSoft,
            fontFamily: "Inter, sans-serif", textTransform: "capitalize",
          }}>{r}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 6 }}>
        <StatCard label="Completed orders" value={totalOrders} sub={`Last ${data.length} ${range} periods`} />
        <StatCard label="Income" value={peso(totalIncome)} />
      </div>

      <Clothesline label="Income" />
      <Card style={{ padding: "20px 20px 8px" }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid stroke={t.line} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: t.inkSoft, fontFamily: "Inter, sans-serif" }} axisLine={{ stroke: t.line }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: t.inkSoft, fontFamily: "Inter, sans-serif" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => peso(v)} contentStyle={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 8, fontFamily: "Inter, sans-serif", fontSize: 12 }} />
            <Bar dataKey="income" fill={t.cyan} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Clothesline label="Order count" />
      <Card style={{ padding: "20px 20px 8px" }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={t.line} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: t.inkSoft, fontFamily: "Inter, sans-serif" }} axisLine={{ stroke: t.line }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: t.inkSoft, fontFamily: "Inter, sans-serif" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 8, fontFamily: "Inter, sans-serif", fontSize: 12 }} />
            <Bar dataKey="count" fill={t.coral} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
