import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Search, Check, Shirt } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { api } from "../lib/api";
import { STATUSES, STATUS_LABEL, fmtDate } from "../lib/format";
import { inputStyle } from "../lib/styles";
import Card from "../components/Card";
import Btn from "../components/Btn";
import InfoBit from "../components/InfoBit";
import WasherRing from "../components/WasherRing";

export default function TrackPage() {
  const { t } = useTheme();
  const params = useParams();
  const [input, setInput] = useState(params.trackingId || "");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function search(id) {
    if (!id.trim()) return;
    try {
      const r = await api.track(id.trim());
      setOrder(r.order);
      setError("");
    } catch (e) {
      setOrder(null);
      setError(e.message);
    } finally {
      setSearched(true);
    }
  }

  useEffect(() => {
    if (params.trackingId) search(params.trackingId);
    // eslint-disable-next-line
  }, [params.trackingId]);

  const idx = order ? STATUSES.indexOf(order.status) : -1;

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, justifyContent: "center" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: t.cyanSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shirt size={17} color={t.cyan} />
          </div>
          <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 17, color: t.ink }}>Track your order</span>
        </div>

        <div onKeyDown={(e) => { if (e.key === "Enter") search(input); }} style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter tracking id, e.g. LX-7F3K2Q"
            style={{ ...inputStyle(t), flex: 1, fontFamily: "JetBrains Mono, monospace" }} />
          <Btn onClick={() => search(input)}><Search size={14} /> Track</Btn>
        </div>

        {searched && !order && (
          <Card style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: t.inkSoft }}>{error || "No order found."}</div>
          </Card>
        )}

        {order && (
          <Card style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <WasherRing statusIndex={idx} trackingId={order.trackingId} size={200} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
              <InfoBit label="Name" value={order.customerName} />
              <InfoBit label="Date received" value={fmtDate(order.dateReceived)} />
              <InfoBit label="Est. completion" value={order.estimatedCompletion ? fmtDate(order.estimatedCompletion) : "—"} />
            </div>
            <div style={{ borderTop: `1px solid ${t.line}`, paddingTop: 14 }}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, fontWeight: 600, color: t.inkSoft, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Progress</div>
              {STATUSES.map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, background: i <= idx ? t.cyan : "transparent", border: i <= idx ? "none" : `1.5px solid ${t.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {i <= idx && <Check size={11} color="#04222B" />}
                  </div>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: i <= idx ? t.ink : t.inkSoft, fontWeight: i === idx ? 600 : 500 }}>{STATUS_LABEL[s]}</span>
                </div>
              ))}
            </div>
            {order.pickedUp && (
              <div style={{ marginTop: 14, textAlign: "center", fontFamily: "Inter, sans-serif", fontSize: 12.5, color: t.green, fontWeight: 600 }}>
                Picked up — thanks for choosing BrightWash!
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
