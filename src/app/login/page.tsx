"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appConfig } from "@/config/app";
import { routes } from "@/config/routes";
import { demoCredentials } from "@/data/demo";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Use your ministry staff, head-office, or administrator credentials."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && <p className="text-sm text-danger-500">{error}</p>}
        <Button type="submit" fullWidth loading={loading} className="h-11">
          Sign in
        </Button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm">
        <Link href={routes.forgotPassword} className="font-medium text-brand-700 hover:underline">
          Forgot password
        </Link>
        <Link href={routes.register} className="font-medium text-brand-700 hover:underline">
          Enrol as staff
        </Link>
      </div>

      {appConfig.api.showDemoAccounts && (
        <div className="mt-8 rounded-xl border border-border-subtle bg-surface-muted p-4 text-xs text-ink-600">
          <p className="font-semibold text-ink-800">Demo accounts</p>
          <p className="mt-2">
            Super administrator · {demoCredentials.superAdmin.email} · {demoCredentials.superAdmin.password}
          </p>
          <p className="mt-1">
            Operations administrator · {demoCredentials.admin.email} · {demoCredentials.admin.password}
          </p>
          <p className="mt-1">
            Head office recharge clerk · {demoCredentials.officer.email} · {demoCredentials.officer.password}
          </p>
          <p className="mt-1">
            Staff · {demoCredentials.staff.email} · {demoCredentials.staff.password}
          </p>
        </div>
      )}
    </AuthShell>
  );
}
