import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { api } from "../lib/api";
import { peso } from "../lib/format";
import { inputStyle } from "../lib/styles";
import Modal from "./Modal";
import Field from "./Field";
import Btn from "./Btn";

export default function NewOrderModal({ customers, services, onClose, onCreated }) {
  const { t } = useTheme();
  const activeServices = services.filter((s) => s.is_active);

  const [quickAdd, setQuickAdd] = useState(false);
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [serviceTypeId, setServiceTypeId] = useState(activeServices[0]?.id || "");
  const [weight, setWeight] = useState("3");
  const [priceOverride, setPriceOverride] = useState(null);
  const [days, setDays] = useState(2);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const service = services.find(
    (s) => String(s.id) === String(serviceTypeId)
  );

  const w = parseFloat(weight) || 0;

  const autoPrice = service
    ? Math.round(w * Number(service.price_per_kg))
    : 0;

  const price = priceOverride !== null
    ? priceOverride
    : autoPrice;

  async function submit() {
    setError("");

    if (!serviceTypeId || w <= 0) {
      setError("Pick a service and enter a weight above 0.");
      return;
    }

    if (!quickAdd && !customerId) {
      setError("Pick a customer.");
      return;
    }

    if (quickAdd && !newName.trim()) {
      setError("Enter the new customer's name.");
      return;
    }

    setBusy(true);

    try {
      let cid = customerId;

      if (quickAdd) {
        const created = await api.createCustomer({
          fullName: newName.trim(),
          phone: newPhone.trim(),
          email: newEmail.trim(),
        });

        cid = created.id;
      }

      const est = new Date();
      est.setDate(est.getDate() + Number(days));

      await api.createOrder({
        customerId: Number(cid),
        serviceTypeId: Number(serviceTypeId),
        weightKg: w,
        price: price,
        estimatedFinish: est
          .toISOString()
          .slice(0, 19)
          .replace("T", " "),
      });

      onCreated();
    } catch (e) {
      console.error("Create order error:", e);
      setError(e.message || "Failed to create order.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="New order" onClose={onClose} width={480}>
      <div
        onKeyDown={(e) => {
          if (e.key === "Enter" && !busy) {
            submit();
          }
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setQuickAdd(false)}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 10px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: !quickAdd ? t.cyanSoft : "transparent",
              color: !quickAdd ? t.cyan : t.inkSoft,
            }}
          >
            Existing customer
          </button>

          <button
            type="button"
            onClick={() => setQuickAdd(true)}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 10px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: quickAdd ? t.cyanSoft : "transparent",
              color: quickAdd ? t.cyan : t.inkSoft,
            }}
          >
            Quick-add new
          </button>
        </div>

        {!quickAdd ? (
          <Field label="Customer">
            <select
              style={inputStyle(t)}
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} — {c.phone || "No phone"}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <Field label="Full name">
              <input
                style={inputStyle(t)}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </Field>

            <Field label="Phone">
              <input
                style={inputStyle(t)}
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </Field>

            <Field label="Email">
              <input
                style={inputStyle(t)}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                type="email"
              />
            </Field>
          </div>
        )}

        <Field label="Service type">
          <select
            style={inputStyle(t)}
            value={serviceTypeId}
            onChange={(e) => {
              setServiceTypeId(e.target.value);
              setPriceOverride(null);
            }}
          >
            {activeServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {peso(s.price_per_kg)}/kg
              </option>
            ))}
          </select>
        </Field>

        <div style={{ display: "flex", gap: 10 }}>
          <Field label="Weight (kg)">
            <input
              style={inputStyle(t)}
              type="number"
              min="0.1"
              step="0.1"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                setPriceOverride(null);
              }}
            />
          </Field>

          <Field label="Est. completion (days)">
            <input
              style={inputStyle(t)}
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </Field>
        </div>

        <Field label={`Price (auto: ${peso(autoPrice)}, editable)`}>
          <input
            style={inputStyle(t)}
            type="number"
            min="0"
            value={price}
            onChange={(e) =>
              setPriceOverride(Number(e.target.value))
            }
          />
        </Field>

        {error && (
          <div
            style={{
              color: t.coral,
              fontSize: 12.5,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 6,
          }}
        >
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>

          <Btn onClick={submit} disabled={busy}>
            {busy ? "Creating..." : "Create order"}
            <ArrowRight size={14} />
          </Btn>
        </div>
      </div>
    </Modal>
  );
}