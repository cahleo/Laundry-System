import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, ChevronRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { api } from "../lib/api";
import { STATUSES, STATUS_LABEL, statusTone, peso } from "../lib/format";
import { inputStyle, tdStyle } from "../lib/styles";
import Card from "../components/Card";
import Btn from "../components/Btn";
import Badge from "../components/Badge";
import Pagination from "../components/Pagination";
import NewOrderModal from "../components/NewOrderModal";

const PAGE_SIZE = 8;

export default function OrdersPage() {
  const { t } = useTheme();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [showNew, setShowNew] = useState(false);

  async function loadOrders() {
    try {
      const r = await api.listOrders({ q, status, page, pageSize: PAGE_SIZE });
      setOrders(r?.orders || []);
      setTotal(r?.total || 0);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setOrders([]);
      setTotal(0);
    }
  }

  useEffect(() => { loadOrders(); /* eslint-disable-next-line */ }, [q, status, page]);
  useEffect(() => { setPage(0); }, [q, status]);
  useEffect(() => {
    api.listCustomers({ pageSize: 50 }).then((r) => setCustomers(r?.customers || []));
    api.listServices().then((r) => setServices(r?.services || []));
  }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <Search size={15} color={t.inkSoft} style={{ position: "absolute", left: 12, top: 11 }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or tracking id"
            style={{ ...inputStyle(t), width: "100%", paddingLeft: 34 }} />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle(t)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <Btn onClick={() => setShowNew(true)}><Plus size={14} /> New order</Btn>
      </div>

      <Card style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
          <thead>
            <tr>
              {["Tracking id", "Customer", "Service", "Weight", "Price", "Status", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "12px 14px", fontFamily: "Inter, sans-serif", fontSize: 11.5, fontWeight: 600, color: t.inkSoft, borderBottom: `1px solid ${t.line}`, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(orders) ? orders : []).map((o) => (
              <tr key={o.id} onClick={() => navigate(`/orders/${o.id}`)} style={{ cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = t.surfaceAlt)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <td style={tdStyle(t)}><span style={{ fontFamily: "JetBrains Mono, monospace" }}>{o.tracking_id}</span></td>
                <td style={tdStyle(t)}>{o.customer_name}</td>
                <td style={tdStyle(t)}>{o.service_name}</td>
                <td style={tdStyle(t)}>{o.weight_kg} kg</td>
                <td style={tdStyle(t)}>{peso(o.price)}</td>
                <td style={tdStyle(t)}><Badge tone={statusTone(o.status)}>{STATUS_LABEL[o.status] || o.status}</Badge></td>
                <td style={tdStyle(t)}><ChevronRight size={15} color={t.inkSoft} /></td>
              </tr>
            ))}
            {(orders?.length || 0) === 0 && (
              <tr><td colSpan={7} style={{ padding: 28, textAlign: "center", color: t.inkSoft, fontFamily: "Inter, sans-serif", fontSize: 13 }}>No orders match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
      <Pagination page={page} setPage={setPage} total={total} pageSize={PAGE_SIZE} />

      {showNew && (
        <NewOrderModal
          customers={customers}
          services={services}
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); loadOrders(); }}
        />
      )}
    </div>
  );
}