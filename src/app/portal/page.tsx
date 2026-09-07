"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { routes } from "@/config/routes";
import { useAuth } from "@/hooks/use-auth";
import { getCurrentStaffProfile } from "@/services/passenger.service";
import { listStaffTransactions } from "@/services/transaction.service";
import { listStaffTrips } from "@/services/trip.service";
import type { PassengerDetail, Transaction, Trip } from "@/types";
import { formatDateTime } from "@/utils/date";
import { formatCurrency } from "@/utils/format";

export default function PortalDashboardPage() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<PassengerDetail | null>(null);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [staffTrips, setStaffTrips] = useState<Trip[]>([]);

  useEffect(() => {
    void getCurrentStaffProfile(session?.user.email).then(async (next) => {
      setProfile(next);
      const [txnPage, tripPage] = await Promise.all([
        listStaffTransactions(next.passenger.id, { pageSize: 5 }),
        listStaffTrips(next.passenger.id, { pageSize: 5 }),
      ]);
      setTxns(txnPage.items);
      setStaffTrips(tripPage.items);
    });
  }, [session?.user.email]);

  if (!profile) return <p className="text-sm text-foreground-muted">Loading your account…</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${session?.user.name.split(" ")[0] ?? profile.passenger.name}`}
        description={`${profile.passenger.designation} · ${profile.passenger.facility}`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Wallet balance</p>
            <p className="mt-2 font-display text-3xl font-semibold text-brand-800" data-numeric>
              {formatCurrency(profile.account.balance)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs uppercase tracking-[0.12em] text-ink-500">QR status</p>
            <div className="mt-3">
              <StatusBadge status={profile.qr.status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Account</p>
            <div className="mt-3">
              <StatusBadge status={profile.account.status} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <ButtonLink href={routes.portal.qr}>View my QR</ButtonLink>
        <ButtonLink href={routes.portal.recharge} variant="secondary">
          Recharge wallet
        </ButtonLink>
        <ButtonLink href={routes.portal.transactions} variant="secondary">
          View transactions
        </ButtonLink>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
            <Link href={routes.portal.transactions} className="text-sm font-medium text-brand-700">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {txns.map((row) => (
              <div key={row.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{row.description}</p>
                  <p className="text-xs text-foreground-muted">{formatDateTime(row.createdAt)}</p>
                </div>
                <p className="text-sm font-semibold" data-numeric>
                  {formatCurrency(row.amount, { signed: true })}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent trips</CardTitle>
            <Link href={routes.portal.trips} className="text-sm font-medium text-brand-700">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {staffTrips.map((row) => (
              <div key={row.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{row.routeName}</p>
                  <p className="text-xs text-foreground-muted">{formatDateTime(row.createdAt)}</p>
                </div>
                <StatusBadge status={row.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
