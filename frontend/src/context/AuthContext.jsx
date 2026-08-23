import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("thalassa_token") || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("thalassa_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalIntent, setAuthModalIntent] = useState("");
  const [targetPageAfterAuth, setTargetPageAfterAuth] = useState(null);

  // Validate stored token on mount
  useEffect(() => {
    async function verifySession() {
      const storedToken = localStorage.getItem("thalassa_token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem("thalassa_user", JSON.stringify(data.user));
        }
      } catch (err) {
        console.warn("Stored session invalid or expired:", err.message);
        localStorage.removeItem("thalassa_token");
        localStorage.removeItem("thalassa_user");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    verifySession();

    // Listen for unauthorized 401 events from axios interceptor
    function handleUnauthorized() {
      setToken(null);
      setUser(null);
    }

    window.addEventListener("thalassa_unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("thalassa_unauthorized", handleUnauthorized);
    };
  }, []);

  const openAuthModal = useCallback((intent = "", targetPage = null) => {
    setAuthModalIntent(intent);
    setTargetPageAfterAuth(targetPage);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setAuthModalIntent("");
    setTargetPageAfterAuth(null);
  }, []);

  const handleAuthSuccess = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("thalassa_token", authToken);
    localStorage.setItem("thalassa_user", JSON.stringify(userData));
    closeAuthModal();
  }, [closeAuthModal]);

  const login = useCallback(async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    if (data?.token && data?.user) {
      handleAuthSuccess(data.user, data.token);
      return data;
    }
    throw new Error("Invalid response from login server");
  }, [handleAuthSuccess]);

  const signup = useCallback(async (formData) => {
    const { data } = await api.post("/auth/signup", formData);
    if (data?.token && data?.user) {
      handleAuthSuccess(data.user, data.token);
      return data;
    }
    throw new Error("Invalid response from registration server");
  }, [handleAuthSuccess]);

  const demoLogin = useCallback(async (role = "researcher") => {
    const { data } = await api.post("/auth/demo", { role });
    if (data?.token && data?.user) {
      handleAuthSuccess(data.user, data.token);
      return data;
    }
    throw new Error("Invalid response from demo login server");
  }, [handleAuthSuccess]);

  const logout = useCallback(() => {
    localStorage.removeItem("thalassa_token");
    localStorage.removeItem("thalassa_user");
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(user && token);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      loading,
      authModalOpen,
      authModalIntent,
      targetPageAfterAuth,
      openAuthModal,
      closeAuthModal,
      login,
      signup,
      demoLogin,
      logout,
    }),
    [
      user,
      token,
      isAuthenticated,
      loading,
      authModalOpen,
      authModalIntent,
      targetPageAfterAuth,
      openAuthModal,
      closeAuthModal,
      login,
      signup,
      demoLogin,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
