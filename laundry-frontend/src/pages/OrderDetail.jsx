import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ArrowRight, Clock, Mail, ExternalLink } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { STATUSES, STATUS_LABEL, statusTone, peso, fmtDate, fmtDateTime } from "../lib/format";
import { inputStyle } from "../lib/styles";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Btn from "../components/Btn";
import InfoBit from "../components/InfoBit";
import WasherRing from "../components/WasherRing";

export default function OrderDetail() {
  const { t } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);

  async function load() {
    try {
      const r = await api.getOrder(id);
      setOrder(r.order);
    } catch (e) {
      showToast(e.message, "error");
      navigate("/orders");
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (!order) {
    return <div style={{ fontFamily: "Inter, sans-serif", color: t.inkSoft }}>Loading…</div>;
  }

  const idx = STATUSES.indexOf(order.status);
  const isLast = idx === STATUSES.length - 1;

  async function setStatus(newStatus) {
    try {
      await api.setOrderStatus(order.id, newStatus);
      showToast(newStatus === "ready_for_pickup" ? "Status updated — pickup-ready email sent" : `Status updated to ${STATUS_LABEL[newStatus]}`);
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  async function advance() {
    if (!isLast) await setStatus(STATUSES[idx + 1]);
  }

  async function resend() {
    const event = order.status === "picked_up" || order.status === "ready_for_pickup" ? "ready_for_pickup" : "order_created";
    try {
      const r = await api.resendEmail(order.id, event);
      if (r.email?.status === "sent") showToast("Email resent");
      else showToast(r.email?.error || "Could not send email", "error");
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  return (
    <div>
      <button onClick={() => navigate("/orders")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: t.inkSoft, cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 13, marginBottom: 14, padding: 0 }}>
        <ChevronLeft size={15} /> Back to orders
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 260px", gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Card style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 15, fontWeight: 500, color: t.ink }}>{order.tracking_id}</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: t.inkSoft, marginTop: 4 }}>Created {fmtDateTime(order.created_at)}</div>
              </div>
              <Badge tone={statusTone(order.status)}>{STATUS_LABEL[order.status]}</Badge>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 14, marginTop: 20 }}>
              <InfoBit label="Customer" value={order.customer_name} />
              <InfoBit label="Phone" value={order.customer_phone} />
              <InfoBit label="Email" value={order.customer_email} />
              <InfoBit label="Service" value={order.service_name} />
              <InfoBit label="Weight" value={`${order.weight_kg} kg`} />
              <InfoBit label="Price" value={peso(order.price)} />
              <InfoBit label="Estimated completion" value={order.estimated_finish ? fmtDate(order.estimated_finish) : "—"} />
            </div>
          </Card>

          <Card style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
              <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 14.5, color: t.ink }}>Status</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select value={order.status} onChange={(e) => setStatus(e.target.value)} style={inputStyle(t)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
                <Btn disabled={isLast} onClick={advance}>Advance <ArrowRight size={14} /></Btn>
              </div>
            </div>

            <div>
              {[...order.status_history].reverse().map((h, i) => (
                <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i === order.status_history.length - 1 ? "none" : `1px solid ${t.line}` }}>
                  <Clock size={14} color={t.inkSoft} />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: t.ink, fontWeight: 500 }}>{STATUS_LABEL[h.new_status]}</span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: t.inkSoft, marginLeft: "auto" }}>{fmtDateTime(h.changed_at)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 14.5, color: t.ink }}>Notifications</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: t.inkSoft, marginTop: 2 }}>Re-send the last relevant order email.</div>
            </div>
            <Btn variant="ghost" onClick={resend}><Mail size={14} /> Resend email</Btn>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <Card style={{ padding: 20, display: "flex", justifyContent: "center" }}>
            <WasherRing statusIndex={idx} trackingId={order.tracking_id} />
          </Card>
          <a href={`${window.location.origin}/track/${order.tracking_id}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "Inter, sans-serif", fontSize: 12.5, color: t.cyan, textDecoration: "none" }}>
            Customer tracking link <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
