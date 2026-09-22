import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shirt, ShieldCheck, Eye, EyeOff, CheckCircle } from "lucide-react";
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

  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [busy, setBusy] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const [loginError, setLoginError] = useState("");

  function passwordIsValid() {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  }

  async function submit() {
    if (busy) return;
    setLoginError("");

    if (mode === "signup") {
      if (!fullName.trim()) {
        showToast("Please enter your full name.", "error");
        return;
      }

      if (!email.trim()) {
        showToast("Please enter your email.", "error");
        return;
      }

      if (!passwordIsValid()) {
        showToast(
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
          "error"
        );
        return;
      }

      if (password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        return;
      }
    }

    setBusy(true);

    try {
      if (mode === "login") {
        await login(email, password);
        navigate("/");
      } else {
        const result = await signup(fullName, email, password);

        if (result?.requiresVerification) {
          setVerificationSent(true);
          setPassword("");
          setConfirmPassword("");
        } else {
          navigate("/");
        }
      }
    } catch (e) {
        if (mode === "login") {
          setLoginError(e.message || "Incorrect email or password.");
        } else {
          showToast(e.message, "error");
        }
} finally {
      setBusy(false);
    }
  }

  function changeMode(newMode) {
    setMode(newMode);
    setVerificationSent(false);
    setPassword("");
    setConfirmPassword("");
  }

  if (verificationSent) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: 20,
          background: t.bg,
        }}
      >
        <Card style={{ width: 380, padding: 32, textAlign: "center" }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: t.cyanSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <CheckCircle size={25} color={t.cyan} />
          </div>

          <div
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              fontSize: 19,
              color: t.ink,
            }}
          >
            Check your email
          </div>

          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              lineHeight: 1.6,
              color: t.inkSoft,
              margin: "10px 0 20px",
            }}
          >
            We've sent a verification link to:
          </p>

          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: t.ink,
              wordBreak: "break-word",
              marginBottom: 20,
            }}
          >
            {email}
          </div>

          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12.5,
              lineHeight: 1.6,
              color: t.inkSoft,
              marginBottom: 22,
            }}
          >
            Please click the verification link in the email before signing
            in.
          </p>

          <Btn
            onClick={() => changeMode("login")}
            style={{ width: "100%", justifyContent: "center" }}
          >
            Go to sign in <ArrowRight size={14} />
          </Btn>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 20,
        background: t.bg,
      }}
    >
      <Card style={{ width: 380, padding: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: t.cyanSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shirt size={18} color={t.cyan} />
          </div>

          <span
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: t.ink,
            }}
          >
            BrightWash
          </span>
        </div>

        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: t.inkSoft,
            margin: "0 0 20px",
          }}
        >
          {mode === "login"
            ? "Staff sign-in."
            : "Create a staff account."}{" "}
          Every account has full admin access — there's just one role.
        </p>

        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          <button
            type="button"
            onClick={() => changeMode("login")}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: mode === "login" ? t.cyanSoft : "transparent",
              color: mode === "login" ? t.cyan : t.inkSoft,
            }}
          >
            Sign in
          </button>

          <button
            type="button"
            onClick={() => changeMode("signup")}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: mode === "signup" ? t.cyanSoft : "transparent",
              color: mode === "signup" ? t.cyan : t.inkSoft,
            }}
          >
            Create account
          </button>
        </div>

        <div
          onKeyDown={(e) => {
            if (e.key === "Enter" && !busy) submit();
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {mode === "signup" && (
            <Field label="Full name">
              <input
                style={inputStyle(t)}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </Field>
          )}

          <Field label="Email">
            <input
              style={inputStyle(t)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
            />
          </Field>

          <Field label="Password">
              <div
                style={{
                  position: "relative",
                  width: "100%",
                }}
              >
                <input
                  style={{
                    ...inputStyle(t),
                    paddingRight: 42,
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 24,
                    height: 24,
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: t.inkSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            {mode === "login" && loginError && (
              <div
                style={{
                  marginTop: -6,
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "#DC2626",
                  lineHeight: 1.5,
                }}
              >
                {loginError}
              </div>
          )}

          {mode === "signup" && (
            <>
               <Field label="Confirm password">
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                    }}
                  >
                    <input
                      style={{
                        ...inputStyle(t),
                        paddingRight: 42,
                      }}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 24,
                        height: 24,
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: t.inkSoft,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </Field>

              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 11.5,
                  color: t.inkSoft,
                  lineHeight: 1.7,
                  marginTop: -5,
                }}
              >
                <div>Password requirements:</div>
                <div>
                  {password.length >= 8 ? "✓" : "○"} At least 8 characters
                </div>
                <div>
                  {/[A-Z]/.test(password) ? "✓" : "○"} Uppercase letter
                </div>
                <div>
                  {/[a-z]/.test(password) ? "✓" : "○"} Lowercase letter
                </div>
                <div>
                  {/[0-9]/.test(password) ? "✓" : "○"} Number
                </div>
                <div>
                  {/[^A-Za-z0-9]/.test(password)
                    ? "✓"
                    : "○"}{" "}
                  Special character
                </div>
              </div>
            </>
          )}

          <Btn
            onClick={submit}
            disabled={busy}
            style={{
              justifyContent: "center",
              marginTop: 6,
            }}
          >
            {mode === "login" ? "Sign in" : "Create account"}
            <ArrowRight size={14} />
          </Btn>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 18,
            fontSize: 11.5,
            color: t.inkSoft,
            fontFamily: "Inter, sans-serif",
          }}
        >
          <ShieldCheck size={13} />
          Secured with Supabase Authentication.
        </div>
      </Card>
    </div>
  );
}
