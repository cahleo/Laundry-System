import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  function setAdminFromUser(user) {
    if (!user) {
      setAdmin(null);
      return;
    }

    setAdmin({
      id: user.id,
      email: user.email,
      fullName:
        user.user_metadata?.fullName ||
        user.user_metadata?.full_name ||
        user.email,
    });
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminFromUser(session?.user || null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminFromUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
 

  async function login(email, password) {
  const { data, error } = await supabase.functions.invoke(
    "secure-login",
    {
      body: {
        email,
        password,
      },
    }
  );

  console.log("LOGIN DATA:", data);
  console.log("LOGIN ERROR:", error);

  if (error) {
    // Try to read the error returned by the Edge Function
    let message = "Unable to sign in. Please try again.";

    try {
      if (error.context) {
        const response = await error.context.json();
        console.log("LOGIN ERROR RESPONSE:", response);

        if (response?.error) {
          message = response.error;
        }
      }
    } catch (err) {
      console.log("Could not read Edge Function error:", err);
    }

    throw new Error(message);
  }

  if (!data?.success) {
    throw new Error(
      data?.error || "Incorrect email or password."
    );
  }

  if (data.access_token && data.refresh_token) {
    const {
      data: sessionData,
      error: sessionError,
    } = await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (sessionData.user) {
      setAdminFromUser(sessionData.user);
    }
  }
}

  async function signup(fullName, email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // If email confirmation is enabled,
    // Supabase normally returns a user without an active session.
    if (data.user && !data.session) {
      return {
        requiresVerification: true,
        email: data.user.email,
      };
    }

    // If confirmation is disabled, allow the user to continue.
    if (data.user) {
      setAdminFromUser(data.user);
    }

    return {
      requiresVerification: false,
      email: data.user?.email,
    };
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    setAdmin(null);
  }

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}