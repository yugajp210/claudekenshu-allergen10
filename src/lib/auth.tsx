"use client";

import * as React from "react";

const VALID_EMAIL = "team@zettai.co.jp";
const VALID_PASSWORD = "Zettai20250722";
const STORAGE_KEY = "allercheck-auth";

type AuthState = {
  email: string;
  signedInAt: string;
};

type AuthApi = {
  user: AuthState | null;
  signIn: (email: string, password: string) => { ok: true } | { ok: false; reason: string };
  signOut: () => void;
  /** ハイドレーション完了前は null。完了後にtrueかfalse。 */
  ready: boolean;
};

const AuthContext = React.createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthState | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    // SSR と整合させるため、ハイドレーション後に localStorage を読む。
    // 単発の useEffect → 単発の setState なのでカスケード再描画は発生しない。
    let stored: AuthState | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthState;
        if (parsed?.email) stored = parsed;
      }
    } catch {
      /* ignore */
    }
    /* eslint-disable react-hooks/set-state-in-effect */
    if (stored) setUser(stored);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const signIn: AuthApi["signIn"] = (email, password) => {
    const e = email.trim().toLowerCase();
    if (e !== VALID_EMAIL.toLowerCase()) {
      return { ok: false, reason: "メールアドレスまたはパスワードが正しくありません" };
    }
    if (password !== VALID_PASSWORD) {
      return { ok: false, reason: "メールアドレスまたはパスワードが正しくありません" };
    }
    const state: AuthState = { email: VALID_EMAIL, signedInAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setUser(state);
    return { ok: true };
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, signIn, signOut, ready }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
