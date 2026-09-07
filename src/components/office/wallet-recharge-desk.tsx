"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { appConfig } from "@/config/app";
import { demoOfficeLookup } from "@/data/demo";
import { getOfficeDashboard, processOfficeRecharge, searchOfficeStaff } from "@/services/office.service";
import type { OfficeDashboard, OfficeRechargeRequest, OfficeStaffMatch } from "@/types";
import { formatCurrency } from "@/utils/format";

const presets = [20, 50, 100, 200, 500];
const steps = ["Lookup", "Profile", "Amount", "Payment", "Confirm", "Done"] as const;
type Step = (typeof steps)[number];

export const deskPaymentMethods: { id: OfficeRechargeRequest["method"]; label: string }[] = [
  { id: "agent", label: "Cash at Youyi Building" },
  { id: "mobile_money", label: "Orange Money / Afrimoney" },
  { id: "bank_transfer", label: "Bank transfer confirmed" },
];

export function WalletRechargeDesk({
  title,
  description,
  onCompleted,
}: {
  title: string;
  description: string;
  onCompleted?: () => void;
}) {
  const [step, setStep] = useState<Step>("Lookup");
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<OfficeStaffMatch[]>([]);
  const [selected, setSelected] = useState<OfficeStaffMatch | null>(null);
  const [dashboard, setDashboard] = useState<OfficeDashboard | null>(null);
  const [amount, setAmount] = useState(100);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState<OfficeRechargeRequest["method"]>("agent");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [receipt, setReceipt] = useState<{ previous: number; amount: number; balance: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void getOfficeDashboard().then(setDashboard);
  }, []);

  const selectedAmount = Number(custom) > 0 ? Number(custom) : amount;
  const methodLabel = deskPaymentMethods.find((item) => item.id === method)?.label ?? method;

  async function lookup(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSearched(true);
    setReceipt(null);
    const results = await searchOfficeStaff(query);
    setMatches(results);
    if (results.length === 1) {
      setSelected(results[0]);
      setStep("Profile");
    } else {
      setSelected(null);
    }
  }

  function openProfile(row: OfficeStaffMatch) {
    setSelected(row);
    setStep("Profile");
    setError("");
    setReceipt(null);
  }

  function resetDesk() {
    setStep("Lookup");
    setQuery("");
    setMatches([]);
    setSelected(null);
    setAmount(100);
    setCustom("");
    setMethod("agent");
    setNote("");
    setError("");
    setSearched(false);
    setReceipt(null);
  }

  async function confirm() {
    if (!selected) return;
    setLoading(true);
    setError("");
    try {
      const previous = selected.account.balance;
      const result = await processOfficeRecharge({
        accountId: selected.account.id,
        amount: selectedAmount,
        method,
        note: note.trim() || undefined,
      });
      setReceipt({ previous, amount: selectedAmount, balance: result.balance });
      setSelected({
        ...selected,
        account: { ...selected.account, balance: result.balance },
        passenger: { ...selected.passenger, walletBalance: result.balance },
      });
      setDashboard(await getOfficeDashboard());
      setStep("Done");
      onCompleted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment could not be confirmed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      {dashboard && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">Top-ups today</p>
              <p className="mt-2 font-display text-2xl font-semibold">{dashboard.stats.rechargesToday}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">Value today</p>
              <p className="mt-2 font-display text-2xl font-semibold" data-numeric>
                {formatCurrency(dashboard.stats.valueToday)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">Staff helped</p>
              <p className="mt-2 font-display text-2xl font-semibold">{dashboard.stats.staffHelpedToday}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <ol className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
        {steps.map((item) => (
          <li key={item} className={item === step ? "text-brand-700" : ""}>
            {item}
          </li>
        ))}
      </ol>

      {step === "Lookup" && (
        <Card>
          <CardHeader>
            <CardTitle>Find the staff wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(event) => void lookup(event)} className="space-y-4">
              <Input
                label="National identity number, staff number, name or QR code"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Type the NIN, staff number, or paste the QR payload"
                autoFocus
              />
              {appConfig.api.showDemoAccounts && (
                <p className="text-xs text-foreground-muted">
                  Demo: Aminata Sesay NIN {demoOfficeLookup.nin}, or QR {demoOfficeLookup.qr}
                </p>
              )}
              {searched && matches.length === 0 && (
                <p className="text-sm text-danger-600">No staff account matches that lookup.</p>
              )}
              {matches.length > 1 && (
                <div className="space-y-2">
                  {matches.map((row) => (
                    <button
                      key={row.passenger.id}
                      type="button"
                      onClick={() => openProfile(row)}
                      className="w-full rounded-xl border border-border-subtle px-4 py-3 text-left hover:bg-surface-muted"
                    >
                      <span className="block text-sm font-semibold text-ink-900">{row.passenger.name}</span>
                      <span className="text-xs text-foreground-muted">
                        {row.passenger.staffNumber} · NIN {row.ninMasked} · {formatCurrency(row.account.balance)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === "Profile" && selected && (
        <Card>
          <CardHeader>
            <CardTitle>Staff profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-surface-muted p-4">
              <p className="font-display text-xl font-semibold text-ink-900">{selected.passenger.name}</p>
              <p className="mt-1 text-sm text-foreground-muted">
                {selected.passenger.staffNumber} · {selected.passenger.designation}
              </p>
              <p className="text-sm text-foreground-muted">{selected.passenger.facility}</p>
              <p className="mt-3 text-sm">
                NIN <span className="font-medium text-ink-800">{selected.ninMasked}</span>
              </p>
              <p className="mt-2 text-sm">
                Current balance{" "}
                <strong className="font-display text-lg text-ink-900" data-numeric>
                  {formatCurrency(selected.account.balance)}
                </strong>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={selected.account.status} />
                <StatusBadge status={selected.qrStatus} />
              </div>
            </div>
            {selected.account.status !== "active" ? (
              <p className="text-sm text-danger-600">This wallet cannot accept a recharge.</p>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={resetDesk}>
                  Search again
                </Button>
                <Button onClick={() => setStep("Amount")}>Recharge</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === "Amount" && selected && (
        <Card>
          <CardHeader>
            <CardTitle>Enter amount</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground-muted">
              {selected.passenger.name} · current balance {formatCurrency(selected.account.balance)}
            </p>
            <div className="flex flex-wrap gap-2">
              {presets.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setAmount(value);
                    setCustom("");
                  }}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                    amount === value && !custom
                      ? "border-brand-600 bg-brand-50 text-brand-800"
                      : "border-border-strong"
                  }`}
                >
                  {formatCurrency(value, { whole: true })}
                </button>
              ))}
            </div>
            <Input
              label="Custom amount"
              type="number"
              min={5}
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep("Profile")}>
                Back
              </Button>
              <Button disabled={selectedAmount < 5} onClick={() => setStep("Payment")}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "Payment" && selected && (
        <Card>
          <CardHeader>
            <CardTitle>Select payment method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Recharging <strong data-numeric>{formatCurrency(selectedAmount)}</strong> for {selected.passenger.name}.
            </p>
            <Select
              label="Payment method"
              value={method}
              onChange={(event) => setMethod(event.target.value as OfficeRechargeRequest["method"])}
            >
              {deskPaymentMethods.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
            <Input
              label="Receipt note (optional)"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Receipt number or teller reference"
            />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep("Amount")}>
                Back
              </Button>
              <Button onClick={() => setStep("Confirm")}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "Confirm" && selected && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-1 text-sm text-ink-700">
              <li>
                Staff <strong>{selected.passenger.name}</strong>
              </li>
              <li>
                Amount <strong data-numeric>{formatCurrency(selectedAmount)}</strong>
              </li>
              <li>Method {methodLabel}</li>
              <li>
                Balance after{" "}
                <strong data-numeric>{formatCurrency(selected.account.balance + selectedAmount)}</strong>
              </li>
            </ul>
            {error && <p className="text-sm text-danger-500">{error}</p>}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep("Payment")}>
                Back
              </Button>
              <Button loading={loading} onClick={() => void confirm()}>
                Payment confirmed
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "Done" && selected && receipt && (
        <Card>
          <CardHeader>
            <CardTitle>Wallet updated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-display text-xl font-semibold text-success-700">Payment confirmed</p>
            <p className="text-sm text-ink-700">
              {selected.passenger.name}: {formatCurrency(receipt.previous)} + {formatCurrency(receipt.amount)} ={" "}
              <strong data-numeric>{formatCurrency(receipt.balance)}</strong>
            </p>
            <p className="text-sm font-medium text-ink-900">Same QR remains active. It is not replaced after a recharge.</p>
            <Button onClick={resetDesk}>Serve next staff member</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
