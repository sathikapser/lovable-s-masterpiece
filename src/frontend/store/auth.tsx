import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { appConfig } from "../lib/config";
import { users } from "../lib/mock-data";
import type { Role, User } from "../lib/types";

const STORAGE_KEY = "tollgrid.session";

interface Session {
  user: User;
  siteId: string;
  token: string;
  refreshToken: string;
  expiresAt: number;
  rememberDevice: boolean;
}

interface AuthContextValue {
  session: Session | null;
  hydrated: boolean;
  signIn: (input: {
    username: string;
    password: string;
    siteId: string;
    rememberDevice: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
  signOut: (reason?: "manual" | "timeout") => void;
  can: (roles: Role[]) => boolean;
  timedOut: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (parsed.expiresAt < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // Read persisted token after hydration only (avoids SSR mismatch).
  useEffect(() => {
    setSession(readSession());
    setHydrated(true);
  }, []);

  const signOut = useCallback((reason: "manual" | "timeout" = "manual") => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setTimedOut(reason === "timeout");
  }, []);

  // Session-timeout + silent token refresh handling.
  useEffect(() => {
    if (!session) return;
    const id = window.setInterval(() => {
      const current = readSession();
      if (!current) {
        signOut("timeout");
        return;
      }
      if (current.expiresAt - Date.now() < 60_000) {
        const refreshed: Session = {
          ...current,
          token: `at_${Math.random().toString(36).slice(2)}`,
          expiresAt: Date.now() + appConfig.sessionTimeoutMs,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshed));
        setSession(refreshed);
      }
    }, 30_000);
    return () => window.clearInterval(id);
  }, [session, signOut]);

  const signIn = useCallback<AuthContextValue["signIn"]>(async (input) => {
    await new Promise((r) => setTimeout(r, 650));
    const match = users.find((u) => u.username === input.username.trim().toLowerCase());
    if (!match || input.password.length < 4) {
      return { ok: false, error: "Invalid operator ID or password." };
    }
    if (match.status === "deactivated") {
      return { ok: false, error: "This account has been deactivated. Contact an administrator." };
    }
    const next: Session = {
      user: match,
      siteId: input.siteId,
      token: `at_${Math.random().toString(36).slice(2)}`,
      refreshToken: `rt_${Math.random().toString(36).slice(2)}`,
      expiresAt: Date.now() + appConfig.sessionTimeoutMs,
      rememberDevice: input.rememberDevice,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
    setTimedOut(false);
    return { ok: true };
  }, []);

  const can = useCallback(
    (roles: Role[]) => (session ? roles.includes(session.user.role) : false),
    [session],
  );

  const value = useMemo(
    () => ({ session, hydrated, signIn, signOut, can, timedOut }),
    [session, hydrated, signIn, signOut, can, timedOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
