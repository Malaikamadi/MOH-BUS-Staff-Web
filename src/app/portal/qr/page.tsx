"use client";

import { useEffect, useState } from "react";

import { StaffQrCard } from "@/components/portal/staff-qr-card";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/hooks/use-auth";
import { getCurrentStaffProfile } from "@/services/passenger.service";
import type { PassengerDetail } from "@/types";
import { formatCurrency } from "@/utils/format";

export default function MyQrPage() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<PassengerDetail | null>(null);

  useEffect(() => {
    if (!session) return;
    void getCurrentStaffProfile(session.user.email).then(setProfile);
  }, [session]);

  if (!profile) return <p className="text-sm text-foreground-muted">Retrieving your QR code…</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My QR code"
        description="This code is permanently linked to your staff account. Recharging does not change it. Download a copy for your phone or print a transport card — the code holds a secure token only, never your identity number or balance."
      />
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <Card>
          <StaffQrCard
            token={profile.qr.secureToken}
            staffName={profile.passenger.name}
            staffNumber={profile.passenger.staffNumber}
          />
        </Card>
        <Card>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Account status</p>
              <div className="mt-2">
                <StatusBadge status={profile.account.status} />
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-ink-500">QR status</p>
              <div className="mt-2">
                <StatusBadge status={profile.qr.status} />
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Wallet balance</p>
              <p className="mt-2 font-display text-2xl font-semibold" data-numeric>
                {formatCurrency(profile.account.balance)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Staff number</p>
              <p className="mt-2 font-medium">{profile.passenger.staffNumber}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
