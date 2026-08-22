"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { setAuthToken } from "@/lib/api/client";
import { fetchMe, login as apiLogin } from "@/lib/api/endpoints";
import type { User } from "@/lib/api/types";
import { disconnectSocket } from "@/lib/socket";

const TOKEN_STORAGE_KEY = "chat_app_token";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  token: string | null;
  login: (phone: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Session is a bare JWT in localStorage, not an httpOnly cookie: the API
 * is a third-party origin we don't control, so a server-set cookie isn't
 * an option here. Traded XSS-exposure risk for "works at all" — see the
 * README write-up for the fuller reasoning.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Wrapped in its own function so the "no token" branch's setState
    // isn't a bare synchronous call inside the effect body — it's the
    // same restore-on-mount work either way, just past a promise for
    // the token-found path.
    function restore() {
      const stored =
        typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_STORAGE_KEY) : null;

      if (!stored) {
        setStatus("unauthenticated");
        return;
      }

      setAuthToken(stored);
      fetchMe()
        .then((me) => {
          setToken(stored);
          setUser(me);
          setStatus("authenticated");
        })
        .catch(() => {
          // Expired/invalid token — drop it and send them back to /login.
          window.localStorage.removeItem(TOKEN_STORAGE_KEY);
          setAuthToken(null);
          setStatus("unauthenticated");
        });
    }

    restore();
  }, []);

  const login = useCallback(async (phone: string, name: string) => {
    const { token: newToken, user: newUser } = await apiLogin(phone, name);
    window.localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setAuthToken(null);
    disconnectSocket();
    setToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ status, user, token, login, logout }),
    [status, user, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
