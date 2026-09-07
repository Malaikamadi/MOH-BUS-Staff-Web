"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { routes } from "@/config/routes";
import { canAccessAdmin, canAccessOffice, canAccessPortal, canAccessSuperAdmin, homeFor } from "@/lib/roles";
import { clearSession, login, logout, readSession, register } from "@/services/auth.service";
import type { AuthSession, LoginCredentials, RegistrationPayload } from "@/types";

interface AuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<AuthSession>;
  signUp: (payload: RegistrationPayload) => Promise<AuthSession>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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
    const isSuper = pathname.startsWith("/super-admin");
    const isAdmin = pathname.startsWith("/admin");
    const isOffice = pathname.startsWith("/office");
    const isPortal = pathname.startsWith("/portal");
    if (!isSuper && !isAdmin && !isOffice && !isPortal) return;

    if (!session) {
      router.replace(`${routes.login}?next=${encodeURIComponent(pathname)}`);
      return;
    }

    const role = session.user.role;
    if (isSuper && !canAccessSuperAdmin(role)) router.replace(homeFor(role));
    if (isAdmin && !canAccessAdmin(role)) router.replace(homeFor(role));
    if (isOffice && !canAccessOffice(role)) router.replace(homeFor(role));
    if (isPortal && !canAccessPortal(role)) router.replace(homeFor(role));
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
