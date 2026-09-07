"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { requestPasswordReset } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await requestPasswordReset({ email });
      setMessage(result.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email on your staff account. If it is registered, we will send a reset link."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        {message && <p className="text-sm text-success-700">{message}</p>}
        <Button type="submit" fullWidth loading={loading} className="h-11">
          Send reset link
        </Button>
      </form>
      <p className="mt-5 text-sm">
        <Link href={routes.login} className="font-medium text-brand-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
