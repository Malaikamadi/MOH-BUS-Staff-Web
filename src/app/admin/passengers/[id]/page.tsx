"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { StaffWalletTopUp } from "@/components/office/staff-wallet-topup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getPassenger, setPassengerStatus } from "@/services/passenger.service";
import { listStaffTransactions } from "@/services/transaction.service";
import { listStaffTrips } from "@/services/trip.service";
import type { PassengerDetail, Transaction, Trip } from "@/types";
import { formatDateTime } from "@/utils/date";
import { formatCurrency, truncateToken } from "@/utils/format";

const tabs = ["Overview", "Account", "QR information", "Transactions", "Trip history"] as const;

export default function StaffDetailPage() {
  const params = useParams<{ id: string }>();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const [detail, setDetail] = useState<PassengerDetail | null>(null);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [staffTrips, setStaffTrips] = useState<Trip[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const next = await getPassenger(params.id);
    setDetail(next);
    const [txnPage, tripPage] = await Promise.all([
      listStaffTransactions(params.id, { pageSize: 25 }),
      listStaffTrips(params.id, { pageSize: 25 }),
    ]);
    setTxns(txnPage.items);
    setStaffTrips(tripPage.items);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function changeStatus(status: "active" | "suspended") {
    await setPassengerStatus(params.id, status);
    setMessage(status === "active" ? "Account activated." : "Account suspended.");
    await load();
  }

  if (!detail) return <p className="text-sm text-foreground-muted">Loading staff record…</p>;

  const { passenger, account, qr, identity, stats } = detail;

  return (
    <div className="space-y-6">
      <PageHeader
        title={passenger.name}
        description={`${passenger.designation} · ${passenger.facility}`}
        actions={
          <>
            {passenger.status !== "active" && (
              <Button onClick={() => void changeStatus("active")}>Activate account</Button>
            )}
            {passenger.status === "active" && (
              <Button variant="danger" onClick={() => void changeStatus("suspended")}>
                Suspend account
              </Button>
            )}
          </>
        }
      />
      {message && <p className="text-sm text-success-700">{message}</p>}

      <div className="flex flex-wrap gap-1 border-b border-border-subtle">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium ${
              tab === item ? "border-brand-600 text-brand-800" : "border-transparent text-ink-500"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent>
                <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Wallet</p>
                <p className="mt-2 font-display text-2xl font-semibold" data-numeric>
                  {formatCurrency(account.balance)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Trips</p>
                <p className="mt-2 font-display text-2xl font-semibold">{stats.totalTrips}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Status</p>
                <div className="mt-3">
                  <StatusBadge status={passenger.status} />
                </div>
              </CardContent>
            </Card>
          </div>
          <StaffWalletTopUp staffName={passenger.name} account={account} onCredited={() => load()} />
        </div>
      )}

      {tab === "Account" && (
        <Card>
          <CardHeader>
            <CardTitle>Account information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
            <Field label="Staff number" value={passenger.staffNumber} />
            <Field label="Account number" value={account.accountNumber} />
            <Field label="Email" value={passenger.email} />
            <Field label="Phone" value={passenger.phone} />
            <Field label="Facility" value={passenger.facility} />
            <Field label="NIN (masked)" value={identity.ninMasked} />
            <Field label="Total recharged" value={formatCurrency(stats.totalRecharged)} />
            <Field label="Total spent" value={formatCurrency(stats.totalSpent)} />
          </CardContent>
        </Card>
      )}

      {tab === "QR information" && (
        <Card>
          <CardHeader>
            <CardTitle>QR account</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
            <Field label="QR status" value={<StatusBadge status={qr.status} />} />
            <Field label="Issued" value={formatDateTime(qr.createdAt)} />
            <Field label="Secure token" value={truncateToken(qr.secureToken)} />
            <Field label="Scan count" value={String(qr.scanCount)} />
          </CardContent>
        </Card>
      )}

      {tab === "Transactions" && (
        <Card>
          <CardContent className="space-y-3 p-0">
            {txns.map((row) => (
              <div key={row.id} className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
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
      )}

      {tab === "Trip history" && (
        <Card>
          <CardContent className="space-y-3 p-0">
            {staffTrips.map((row) => (
              <div key={row.id} className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{row.routeName}</p>
                  <p className="text-xs text-foreground-muted">
                    {row.busNumber} · {formatDateTime(row.createdAt)}
                  </p>
                </div>
                <StatusBadge status={row.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.12em] text-ink-500">{label}</p>
      <p className="mt-1 font-medium text-ink-900">{value}</p>
    </div>
  );
}
