import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { inputStyle } from "../lib/styles";
import Modal from "./Modal";
import Field from "./Field";
import Btn from "./Btn";

export default function ServiceModal({ service, onClose, onSave }) {
  const { t } = useTheme();
  const [name, setName] = useState(service?.name || "");
  const [price, setPrice] = useState(service?.price_per_kg ?? 60);
  const [active, setActive] = useState(service?.is_active ?? true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim() || Number(price) <= 0) { setError("Enter a name and a positive price per kg."); return; }
    setBusy(true);
    setError("");
    try {
      await onSave({ name: name.trim(), pricePerKg: Number(price), active });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={service ? "Edit service" : "Add service"} onClose={onClose}>
      <div onKeyDown={(e) => { if (e.key === "Enter" && !busy) submit(); }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Name"><input style={inputStyle(t)} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Price per kg (₱)"><input style={inputStyle(t)} type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Inter, sans-serif", fontSize: 13, color: t.ink }}>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active
        </label>
        {error && <div style={{ color: t.coral, fontSize: 12.5, fontFamily: "Inter, sans-serif" }}>{error}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={submit} disabled={busy}>Save</Btn>
        </div>
      </div>
    </Modal>
  );
}
