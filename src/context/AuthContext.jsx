import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { advanceSessionGeneration, apiRequest } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const generation = useRef(0);

  const restore = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true);
    setAuthError("");
    try {
      const { data } = await apiRequest("/api/auth/me");
      if (current === generation.current) setUser(data);
    } catch (error) {
      if (current === generation.current) {
        setUser(null);
        if (error.status !== 401) setAuthError(error.message);
      }
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    restore();
    function expire() {
      generation.current += 1;
      setUser(null);
      setLoading(false);
      setAuthError("");
    }
    window.addEventListener("auth:expired", expire);
    return () => {
      generation.current += 1;
      window.removeEventListener("auth:expired", expire);
    };
  }, [restore]);

  const register = useCallback(({ name, email, password, role }) =>
    apiRequest("/api/auth/register", {
      method: "POST",
      body: { fullName: name.trim(), email: email.trim(), password, role: role.toUpperCase() },
    }), []);

  const login = useCallback(async (email, password) => {
    advanceSessionGeneration();
    await apiRequest("/api/auth/login", { method: "POST", body: { email: email.trim(), password } });
    const { data } = await apiRequest("/api/auth/me");
    generation.current += 1;
    setUser(data);
    setAuthError("");
    setLoading(false);
    return data;
  }, []);

  const logout = useCallback(async () => {
    advanceSessionGeneration();
    await apiRequest("/api/auth/logout", { method: "POST", body: {} });
    generation.current += 1;
    setUser(null);
    setAuthError("");
  }, []);

  const value = useMemo(() => ({ user, loading, authError, restore, register, login, logout }), [user, loading, authError, restore, register, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider.");
  return context;
}
