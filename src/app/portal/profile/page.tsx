"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/hooks/use-auth";
import { getCurrentStaffProfile } from "@/services/passenger.service";
import type { PassengerDetail } from "@/types";
import { maskPhone } from "@/utils/format";

export default function ProfilePage() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<PassengerDetail | null>(null);

  useEffect(() => {
    void getCurrentStaffProfile(session?.user.email).then(setProfile);
  }, [session?.user.email]);

  if (!profile) return <p className="text-sm text-foreground-muted">Loading profile…</p>;

  const { passenger, account, identity } = profile;

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your staff transport record. Identity numbers are shown masked only." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Field label="Full name" value={passenger.name} />
            <Field label="Designation" value={passenger.designation} />
            <Field label="Duty facility" value={passenger.facility} />
            <Field label="National ID" value={identity.ninMasked} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Field label="Email" value={passenger.email} />
            <Field label="Phone" value={maskPhone(passenger.phone)} />
            <Field label="City" value={identity.city ?? "—"} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
            <Field label="Staff number" value={passenger.staffNumber} />
            <Field label="Account number" value={account.accountNumber} />
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Status</p>
              <div className="mt-1">
                <StatusBadge status={account.status} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.12em] text-ink-500">{label}</p>
      <p className="mt-1 font-medium text-ink-900">{value}</p>
    </div>
  );
}
