import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { inputStyle } from "../lib/styles";
import Modal from "./Modal";
import Field from "./Field";
import Btn from "./Btn";

export default function CustomerModal({ customer, onClose, onSave }) {
  const { t } = useTheme();
  const [fullName, setFullName] = useState(customer?.full_name || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!fullName.trim()) { setError("Full name is required."); return; }
    setBusy(true);
    setError("");
    try {
      await onSave({ fullName: fullName.trim(), phone: phone.trim(), email: email.trim() });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={customer ? "Edit customer" : "Add customer"} onClose={onClose}>
      <div onKeyDown={(e) => { if (e.key === "Enter" && !busy) submit(); }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Full name"><input style={inputStyle(t)} value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
        <Field label="Phone"><input style={inputStyle(t)} value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
        <Field label="Email"><input style={inputStyle(t)} value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></Field>
        {error && <div style={{ color: t.coral, fontSize: 12.5, fontFamily: "Inter, sans-serif" }}>{error}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={submit} disabled={busy}>Save</Btn>
        </div>
      </div>
    </Modal>
  );
}
