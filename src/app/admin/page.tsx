"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { routes } from "@/config/routes";
import { getAdminDashboard } from "@/services/admin.service";
import type { AdminDashboardData } from "@/types";
import { formatDateTime } from "@/utils/date";
import { formatCompactCurrency, formatCurrency, formatNumber, formatPercent } from "@/utils/format";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    void getAdminDashboard().then(setData);
  }, []);

  if (!data) {
    return <p className="text-sm text-foreground-muted">Loading dashboard…</p>;
  }

  const tiles = [
    { label: "Enrolled staff", value: formatNumber(data.stats.totalPassengers), change: data.stats.passengerGrowthPercent },
    { label: "Active QR accounts", value: formatNumber(data.stats.activeQrAccounts), change: data.stats.qrGrowthPercent },
    { label: "Trips today", value: formatNumber(data.stats.tripsToday), change: data.stats.tripsGrowthPercent },
    { label: "Today's revenue", value: formatCurrency(data.stats.revenueToday), change: data.stats.revenueGrowthPercent },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations dashboard"
        description="Live view of staff travel, wallet activity and network performance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">{tile.label}</p>
              <p className="mt-2 font-display text-2xl font-semibold text-ink-900" data-numeric>
                {tile.value}
              </p>
              <p className="mt-1 text-xs text-brand-700">{formatPercent(tile.change)} vs last week</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Revenue — last 7 days</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.series}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => formatCompactCurrency(Number(value))} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="#1472c9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low-balance accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.lowBalanceAccounts.length === 0 && (
              <p className="text-sm text-foreground-muted">No accounts below the threshold.</p>
            )}
            {data.lowBalanceAccounts.map((row) => (
              <Link
                key={row.accountId}
                href={routes.admin.passenger(row.passengerId)}
                className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2.5"
              >
                <span>
                  <span className="block text-sm font-medium text-ink-900">{row.passengerName}</span>
                  <span className="text-xs text-foreground-muted">{row.accountNumber}</span>
                </span>
                <span className="text-sm font-semibold text-warning-700" data-numeric>
                  {formatCurrency(row.balance)}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
            <Link href={routes.admin.transactions} className="text-sm font-medium text-brand-700">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentTransactions.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink-900">{row.passengerName}</p>
                  <p className="text-xs text-foreground-muted">{row.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" data-numeric>
                    {formatCurrency(row.amount, { signed: true })}
                  </p>
                  <StatusBadge status={row.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent trips</CardTitle>
            <Link href={routes.admin.trips} className="text-sm font-medium text-brand-700">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentTrips.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink-900">{row.passengerName}</p>
                  <p className="text-xs text-foreground-muted">
                    {row.routeName} · {formatDateTime(row.createdAt)}
                  </p>
                </div>
                <StatusBadge status={row.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Failed transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.failedTransactions.length === 0 && (
            <p className="text-sm text-foreground-muted">No failed transactions today.</p>
          )}
          {data.failedTransactions.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink-900">{row.passengerName}</p>
                <p className="text-xs text-foreground-muted">{row.failureReason ?? row.description}</p>
              </div>
              <p className="text-sm font-semibold text-danger-700" data-numeric>
                {formatCurrency(row.amount)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
