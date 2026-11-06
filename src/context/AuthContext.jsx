import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const USERS_KEY = "opportunity-finder-demo-users";
const SESSION_KEY = "opportunity-finder-demo-session";
const DEMO_PASSWORD = "DemoPass123!";
const demoAccounts = [
  { id: "demo-student", name: "Demo Student", email: "student@ncsu.edu", role: "Student" },
  { id: "demo-professor", name: "Demo Professor", email: "professor@ncsu.edu", role: "Professor" },
];
const AuthContext = createContext(null);

function readUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  const users = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(users)) throw new Error("Saved demo accounts are invalid.");
  return users;
}

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { user: null, error: "" };
    const session = JSON.parse(raw);
    const user = readUsers().find((item) => item.id === session.id && item.role === session.role && (import.meta.env.DEV || !demoAccounts.some((demo) => demo.id === item.id)));
    return { user: user || null, error: "" };
  } catch (error) {
    console.error("Could not read the demo session.", error);
    return { user: null, error: "Demo account data could not be read from this browser." };
  }
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password, salt) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Demo sign-in requires Web Crypto in a secure context (HTTPS or localhost).");
  }
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({
    name: "PBKDF2",
    salt: new TextEncoder().encode(salt),
    iterations: 210000,
    hash: "SHA-256",
  }, key, 256);
  return bytesToHex(new Uint8Array(bits));
}

async function makeAccount({ name, email, password, role, id = crypto.randomUUID() }) {
  const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
  return { id, name, email, role, verified: false, salt, passwordHash: await hashPassword(password, salt) };
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(readSession);

  const register = useCallback(async ({ name, email, password, role }) => {
    name = name.trim();
    email = email.trim().toLowerCase();
    if (!name) throw new Error("Enter your full name.");
    if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@ncsu\.edu$/i.test(email) || email.startsWith(".") || email.includes("..") || email.split("@")[0].endsWith(".")) {
      throw new Error("Enter a valid NC State email address ending in @ncsu.edu.");
    }
    if (password.length < 8) throw new Error("Use a password of at least 8 characters.");
    if (role !== "Student" && role !== "Professor") throw new Error("Choose Student or Professor.");
    if (import.meta.env.DEV && demoAccounts.some((account) => account.email === email)) {
      throw new Error("This address is reserved for a development demo account.");
    }
    const users = readUsers();
    if (users.some((user) => user.email === email)) throw new Error("An account with this email already exists.");
    const account = await makeAccount({ name, email, password, role });
    const latestUsers = readUsers();
    if (latestUsers.some((user) => user.email === email)) throw new Error("An account with this email already exists.");
    localStorage.setItem(USERS_KEY, JSON.stringify([...latestUsers, account]));
  }, []);

  const login = useCallback(async (email, password) => {
    email = email.trim().toLowerCase();
    let users = readUsers();
    if (import.meta.env.DEV && demoAccounts.some((account) => account.email === email) && !users.some((user) => user.email === email)) {
      const demo = demoAccounts.find((account) => account.email === email);
      const account = await makeAccount({ ...demo, password: DEMO_PASSWORD });
      users = readUsers();
      if (!users.some((user) => user.email === email)) {
        users = [...users, account];
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
    }
    const user = users.find((item) => item.email === email && (import.meta.env.DEV || !demoAccounts.some((demo) => demo.id === item.id)));
    if (!user || await hashPassword(password, user.salt) !== user.passwordHash) {
      throw new Error("Invalid email or password.");
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, role: user.role }));
    setState({ user, error: "" });
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setState({ user: null, error: "" });
  }, []);

  const setDemoVerification = useCallback((verified) => {
    if (!import.meta.env.DEV || state.user?.role !== "Professor") {
      throw new Error("Demo verification is available only to professors in development.");
    }
    const users = readUsers();
    const user = users.find((item) => item.id === state.user.id && item.role === "Professor");
    if (!user) throw new Error("Your demo account could not be found.");
    const updated = { ...user, verified };
    localStorage.setItem(USERS_KEY, JSON.stringify(users.map((item) => item.id === user.id ? updated : item)));
    setState({ user: updated, error: "" });
  }, [state.user]);

  useEffect(() => {
    function sync(event) {
      if (event.key === null || event.key === USERS_KEY || event.key === SESSION_KEY) setState(readSession());
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const value = useMemo(() => ({ user: state.user, authError: state.error, register, login, logout, setDemoVerification }), [state, register, login, logout, setDemoVerification]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider.");
  return context;
}
