import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, ask the backend if the PHP session is still valid.
  useEffect(() => {
    api.me()
      .then((r) => setAdmin(r.admin))
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const r = await api.login(email, password);
    setAdmin(r.admin);
  }

  async function signup(fullName, email, password) {
    const r = await api.signup(fullName, email, password);
    setAdmin(r.admin);
  }

  async function logout() {
    await api.logout();
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
