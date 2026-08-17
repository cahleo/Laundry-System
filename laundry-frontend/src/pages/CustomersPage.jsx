import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { tdStyle, inputStyle } from "../lib/styles";
import Card from "../components/Card";
import Btn from "../components/Btn";
import IconBtn from "../components/IconBtn";
import Pagination from "../components/Pagination";
import CustomerModal from "../components/CustomerModal";

const PAGE_SIZE = 8;

export default function CustomersPage() {
  const { t } = useTheme();
  const { showToast } = useToast();

  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [editing, setEditing] = useState(null); // null | {} | customer

  async function load() {
    const r = await api.listCustomers({ q, page, pageSize: PAGE_SIZE });
    setCustomers(r.customers);
    setTotal(r.total);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, page]);
  useEffect(() => { setPage(0); }, [q]);

  async function save(data) {
    if (editing?.id) {
      await api.updateCustomer(editing.id, data);
      showToast("Customer updated");
    } else {
      await api.createCustomer(data);
      showToast("Customer added");
    }
    setEditing(null);
    load();
  }

  async function remove(id) {
    try {
      await api.deleteCustomer(id);
      showToast("Customer deleted");
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <Search size={15} color={t.inkSoft} style={{ position: "absolute", left: 12, top: 11 }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers" style={{ ...inputStyle(t), width: "100%", paddingLeft: 34 }} />
        </div>
        <Btn onClick={() => setEditing({})}><Plus size={14} /> Add customer</Btn>
      </div>

      <Card style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
          <thead>
            <tr>
              {["Name", "Phone", "Email", "Orders", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "12px 14px", fontFamily: "Inter, sans-serif", fontSize: 11.5, fontWeight: 600, color: t.inkSoft, borderBottom: `1px solid ${t.line}`, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td style={tdStyle(t)}>{c.full_name}</td>
                <td style={tdStyle(t)}>{c.phone}</td>
                <td style={tdStyle(t)}>{c.email}</td>
                <td style={tdStyle(t)}>{c.order_count}</td>
                <td style={{ ...tdStyle(t), textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <IconBtn onClick={() => setEditing(c)}><Pencil size={13} /></IconBtn>
                    <IconBtn danger onClick={() => remove(c.id)}><Trash2 size={13} /></IconBtn>
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 28, textAlign: "center", color: t.inkSoft, fontFamily: "Inter, sans-serif", fontSize: 13 }}>No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
      <Pagination page={page} setPage={setPage} total={total} pageSize={PAGE_SIZE} />

      {editing !== null && (
        <CustomerModal customer={editing.id ? editing : null} onClose={() => setEditing(null)} onSave={save} />
      )}
    </div>
  );
}
