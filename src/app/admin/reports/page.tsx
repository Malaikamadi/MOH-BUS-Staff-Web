"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { getReports } from "@/services/report.service";
import type { ReportBundle } from "@/types";
import { formatCurrency, formatNumber } from "@/utils/format";

function toCsv(rows: Record<string, string | number>[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(","), ...rows.map((row) => headers.map((key) => `"${row[key]}"`).join(","))];
  return lines.join("\n");
}

export default function ReportsPage() {
  const [from, setFrom] = useState("2026-08-01");
  const [to, setTo] = useState("2026-09-03");
  const [data, setData] = useState<ReportBundle | null>(null);

  async function load() {
    setData(await getReports({ from, to }));
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exportCsv() {
    if (!data) return;
    const csv = toCsv(
      data.byRoute.map((row) => ({
        route: row.routeName,
        trips: row.trips,
        revenue: row.revenue,
        averageFare: row.averageFare,
      })),
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `moh-transport-report-${from}-to-${to}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Revenue, trip volume, recharge activity and conductor performance for the selected period."
        actions={<Button variant="secondary" onClick={exportCsv}>Export CSV</Button>}
      />
      <Card className="p-4">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            void load();
          }}
        >
          <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Button type="submit" className="h-11">
            Generate
          </Button>
        </form>
      </Card>

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Revenue", value: formatCurrency(summary.totalRevenue) },
            { label: "Trips", value: formatNumber(summary.totalTrips) },
            { label: "Recharges", value: formatCurrency(summary.rechargeValue) },
            { label: "Failed transactions", value: formatNumber(summary.failedTransactions) },
          ].map((tile) => (
            <Card key={tile.label}>
              <CardContent>
                <p className="text-xs uppercase tracking-[0.12em] text-ink-500">{tile.label}</p>
                <p className="mt-2 font-display text-2xl font-semibold" data-numeric>
                  {tile.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Revenue by route</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data?.byRoute.map((row) => (
            <div key={row.routeId} className="flex items-center justify-between text-sm">
              <span>{row.routeName}</span>
              <span className="font-semibold" data-numeric>
                {formatCurrency(row.revenue)} · {row.trips} trips
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conductor activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data?.conductors.map((row) => (
            <div key={row.conductorId} className="flex items-center justify-between text-sm">
              <span>
                {row.conductorName} · {row.staffNumber}
              </span>
              <span className="font-semibold" data-numeric>
                {row.trips} trips · {formatCurrency(row.revenue)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
