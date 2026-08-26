import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { peso } from "../lib/format";
import Card from "../components/Card";
import Btn from "../components/Btn";
import Badge from "../components/Badge";
import IconBtn from "../components/IconBtn";
import ServiceModal from "../components/ServiceModal";

export default function ServicesPage() {
  const { t } = useTheme();
  const { showToast } = useToast();
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);

  async function load() {
    const r = await api.listServices();
    setServices(r.services);
  }
  useEffect(() => { load(); }, []);

  async function save(data) {
    if (editing?.id) {
      await api.updateService(editing.id, data);
      showToast("Service updated");
    } else {
      await api.createService(data);
      showToast("Service added");
    }
    setEditing(null);
    load();
  }

  async function toggleActive(s) {
  try {
    await api.updateService(s.id, {
      name: s.name,
      pricePerKg: s.price_per_kg,
      isActive: !s.is_active,
    });

    showToast(
      s.is_active
        ? "Service deactivated"
        : "Service activated"
    );

    load();
  } catch (e) {
    showToast(e.message, "error");
  }
}

  async function remove(id) {
    try {
      await api.deleteService(id);
      showToast("Service deleted");
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Btn onClick={() => setEditing({})}><Plus size={14} /> Add service</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px,1fr))", gap: 14 }}>
        {services.map((s) => (
          <Card key={s.id} style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 15, color: t.ink }}>{s.name}</div>
              <Badge tone={s.is_active ? "green" : "amber"}>{s.is_active ? "Active" : "Inactive"}</Badge>
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 20, fontWeight: 700, color: t.ink, marginTop: 10 }}>
              {peso(s.price_per_kg)}<span style={{ fontSize: 12.5, color: t.inkSoft, fontWeight: 500 }}> /kg</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Btn variant="ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => toggleActive(s)}>
                {s.is_active ? "Deactivate" : "Activate"}
              </Btn>
              <IconBtn onClick={() => setEditing(s)}><Pencil size={13} /></IconBtn>
              <IconBtn danger onClick={() => remove(s.id)}><Trash2 size={13} /></IconBtn>
            </div>
          </Card>
        ))}
      </div>
      {editing !== null && (
        <ServiceModal service={editing.id ? editing : null} onClose={() => setEditing(null)} onSave={save} />
      )}
    </div>
  );
}
