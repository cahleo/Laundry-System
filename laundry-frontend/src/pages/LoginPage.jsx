import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shirt, ShieldCheck } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { inputStyle } from "../lib/styles";
import Card from "../components/Card";
import Field from "../components/Field";
import Btn from "../components/Btn";

export default function LoginPage() {
  const { t } = useTheme();
  const { login, signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await signup(fullName, email, password);
      navigate("/");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 20, background: t.bg }}>
      <Card style={{ width: 380, padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: t.cyanSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shirt size={18} color={t.cyan} />
          </div>
          <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 18, color: t.ink }}>BrightWash</span>
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: t.inkSoft, margin: "0 0 20px" }}>
          {mode === "login" ? "Staff sign-in." : "Create a staff account."} Every account has full admin access — there's just one role.
        </p>

        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          <button type="button" onClick={() => setMode("login")} style={{
            fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 999, border: "none", cursor: "pointer",
            background: mode === "login" ? t.cyanSoft : "transparent", color: mode === "login" ? t.cyan : t.inkSoft,
          }}>Sign in</button>
          <button type="button" onClick={() => setMode("signup")} style={{
            fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 999, border: "none", cursor: "pointer",
            background: mode === "signup" ? t.cyanSoft : "transparent", color: mode === "signup" ? t.cyan : t.inkSoft,
          }}>Create account</button>
        </div>

        <div onKeyDown={(e) => { if (e.key === "Enter" && !busy) submit(); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "signup" && (
            <Field label="Full name">
              <input style={inputStyle(t)} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </Field>
          )}
          <Field label="Email">
            <input style={inputStyle(t)} value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </Field>
          <Field label="Password">
            <input style={inputStyle(t)} value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
          </Field>
          <Btn onClick={submit} disabled={busy} style={{ justifyContent: "center", marginTop: 6 }}>
            {mode === "login" ? "Sign in" : "Create account"} <ArrowRight size={14} />
          </Btn>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 18, fontSize: 11.5, color: t.inkSoft, fontFamily: "Inter, sans-serif" }}>
          <ShieldCheck size={13} /> Connects to the PHP API configured in src/lib/api.js.
        </div>
      </Card>
    </div>
  );
}
