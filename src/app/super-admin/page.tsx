"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { routes } from "@/config/routes";
import { getSuperAdminDashboard } from "@/services/super-admin.service";
import type { SuperAdminDashboard } from "@/types";
import { roleLabel } from "@/lib/roles";
import { formatCurrency, formatNumber } from "@/utils/format";
import { formatDateTime } from "@/utils/date";

export default function SuperAdminDashboardPage() {
  const [data, setData] = useState<SuperAdminDashboard | null>(null);

  useEffect(() => {
    void getSuperAdminDashboard().then(setData);
  }, []);

  if (!data) return <p className="text-sm text-foreground-muted">Loading super-admin overview…</p>;

  const tiles = [
    { label: "All users", value: formatNumber(data.stats.totalUsers) },
    { label: "Enrolled staff", value: formatNumber(data.stats.staff) },
    { label: "Recharge clerks", value: formatNumber(data.stats.officers) },
    { label: "Wallet float", value: formatCurrency(data.stats.walletFloat) },
    { label: "Office top-ups today", value: formatNumber(data.stats.officeRechargesToday) },
    { label: "Office value today", value: formatCurrency(data.stats.officeValueToday) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super administration"
        description="Control operators, head-office wallet top-ups, and the shared transport database."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">{tile.label}</p>
              <p className="mt-2 font-display text-2xl font-semibold text-ink-900" data-numeric>
                {tile.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Operators</CardTitle>
            <Link href={routes.superAdmin.operators} className="text-sm font-medium text-brand-700">
              Manage
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.operators.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink-900">{row.name}</p>
                  <p className="text-xs text-foreground-muted">
                    {roleLabel(row.role)} · {row.email}
                  </p>
                </div>
                <StatusBadge status={row.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest head-office recharges</CardTitle>
            <Link href={routes.superAdmin.recharges} className="text-sm font-medium text-brand-700">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentOfficeRecharges.length === 0 && (
              <p className="text-sm text-foreground-muted">No head-office top-ups yet.</p>
            )}
            {data.recentOfficeRecharges.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink-900">{row.passengerName}</p>
                  <p className="text-xs text-foreground-muted">
                    {row.processedByName ?? "Clerk"} · {formatDateTime(row.createdAt)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-success-700" data-numeric>
                  {formatCurrency(row.amount, { signed: true })}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
