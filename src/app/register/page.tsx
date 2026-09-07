"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { useAuth } from "@/hooks/use-auth";

const facilities = [
  "Connaught Hospital",
  "Princess Christian Maternity Hospital",
  "Ola During Children's Hospital",
  "Lumley Government Hospital",
  "Bo Government Hospital",
  "Kenema Government Hospital",
  "Makeni Regional Hospital",
  "Youyi Building Headquarters",
];

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    staffNumber: "",
    designation: "",
    facility: facilities[0],
    nin: "",
    password: "",
  });

  function update(name: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [name]: event.target.value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await signUp(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete enrolment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Staff enrolment"
      subtitle="Create your Ministry of Health transport account. A wallet and permanent QR code will be issued automatically."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Full name" name="fullName" required value={form.fullName} onChange={update("fullName")} />
        <Input label="Work email" name="email" type="email" required value={form.email} onChange={update("email")} />
        <Input label="Phone number" name="phone" required value={form.phone} onChange={update("phone")} />
        <Input
          label="Ministry staff number"
          name="staffNumber"
          required
          placeholder="MOH-SL-000000"
          value={form.staffNumber}
          onChange={update("staffNumber")}
        />
        <Input
          label="Designation"
          name="designation"
          required
          value={form.designation}
          onChange={update("designation")}
        />
        <Select label="Duty facility" name="facility" value={form.facility} onChange={update("facility")}>
          {facilities.map((facility) => (
            <option key={facility}>{facility}</option>
          ))}
        </Select>
        <Input
          label="National Identification Number"
          name="nin"
          required
          hint="Used only for enrolment. Never written into your QR code."
          value={form.nin}
          onChange={update("nin")}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          required
          value={form.password}
          onChange={update("password")}
        />
        {error && <p className="text-sm text-danger-500">{error}</p>}
        <Button type="submit" fullWidth loading={loading} className="h-11">
          Create account
        </Button>
      </form>
      <p className="mt-5 text-sm text-foreground-muted">
        Already enrolled?{" "}
        <Link href={routes.login} className="font-medium text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
