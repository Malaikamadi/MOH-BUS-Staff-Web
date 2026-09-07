"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { routes } from "@/config/routes";
import { clearSession, login, logout, readSession, register } from "@/services/auth.service";
import type { AuthSession, LoginCredentials, RegistrationPayload, UserRole } from "@/types";

interface AuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<AuthSession>;
  signUp: (payload: RegistrationPayload) => Promise<AuthSession>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function homeFor(role: UserRole) {
  return role === "admin" ? routes.admin.dashboard : routes.portal.dashboard;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setSession(readSession());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    const isAdmin = pathname.startsWith("/admin");
    const isPortal = pathname.startsWith("/portal");
    if (!isAdmin && !isPortal) return;

    if (!session) {
      router.replace(`${routes.login}?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (isAdmin && session.user.role !== "admin") {
      router.replace(routes.portal.dashboard);
    }
    if (isPortal && session.user.role === "admin") {
      router.replace(routes.admin.dashboard);
    }
  }, [loading, pathname, router, session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      async signIn(credentials) {
        const next = await login(credentials);
        setSession(next);
        router.replace(homeFor(next.user.role));
        return next;
      },
      async signUp(payload) {
        const next = await register(payload);
        setSession(next);
        router.replace(homeFor(next.user.role));
        return next;
      },
      async signOut() {
        await logout();
        setSession(null);
        router.replace(routes.login);
      },
    }),
    [loading, router, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function discardExpiredSession() {
  clearSession();
}
