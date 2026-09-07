"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getOfficeDashboard, processOfficeRecharge, searchOfficeStaff } from "@/services/office.service";
import type { OfficeDashboard, OfficeRechargeRequest, OfficeStaffMatch } from "@/types";
import { formatCurrency } from "@/utils/format";

const presets = [20, 50, 100, 200, 500];

export default function OfficeDeskPage() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<OfficeStaffMatch[]>([]);
  const [selected, setSelected] = useState<OfficeStaffMatch | null>(null);
  const [dashboard, setDashboard] = useState<OfficeDashboard | null>(null);
  const [amount, setAmount] = useState(50);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState<OfficeRechargeRequest["method"]>("agent");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{ balance: number; amount: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void getOfficeDashboard().then(setDashboard);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setMatches([]);
      return;
    }
    const timer = setTimeout(() => {
      void searchOfficeStaff(query).then(setMatches);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const selectedAmount = Number(custom) > 0 ? Number(custom) : amount;

  async function confirm() {
    if (!selected) return;
    setLoading(true);
    setError("");
    try {
      const result = await processOfficeRecharge({
        accountId: selected.account.id,
        amount: selectedAmount,
        method,
        note: note.trim() || undefined,
      });
      setReceipt({ balance: result.balance, amount: selectedAmount });
      setSelected({
        ...selected,
        account: { ...selected.account, balance: result.balance },
        passenger: { ...selected.passenger, walletBalance: result.balance },
      });
      setDashboard(await getOfficeDashboard());
    } catch (err) {
      setError(err instanceof Error ? err.message : "The top-up could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Head office recharge desk"
        description="Look up a ministry staff member at Youyi Building and credit their transport wallet. The QR code does not change."
      />

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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Find staff</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Name, staff number, email or phone"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setReceipt(null);
              }}
              placeholder="Start typing at least 2 characters"
            />
            <div className="space-y-2">
              {matches.map((row) => (
                <button
                  key={row.passenger.id}
                  type="button"
                  onClick={() => {
                    setSelected(row);
                    setReceipt(null);
                    setError("");
                  }}
                  className={`w-full rounded-xl border px-4 py-3 text-left ${
                    selected?.passenger.id === row.passenger.id
                      ? "border-brand-600 bg-brand-50"
                      : "border-border-subtle hover:bg-surface-muted"
                  }`}
                >
                  <span className="block text-sm font-semibold text-ink-900">{row.passenger.name}</span>
                  <span className="text-xs text-foreground-muted">
                    {row.passenger.staffNumber} · {row.passenger.facility} · {formatCurrency(row.account.balance)}
                  </span>
                </button>
              ))}
              {query.trim().length >= 2 && matches.length === 0 && (
                <p className="text-sm text-foreground-muted">No staff match that search.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{selected ? "Credit wallet" : "Select a staff member"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selected && (
              <p className="text-sm text-foreground-muted">
                Search on the left, then take cash or assisted mobile money and credit the account.
              </p>
            )}
            {selected && (
              <>
                <div className="rounded-xl bg-surface-muted p-4">
                  <p className="font-semibold text-ink-900">{selected.passenger.name}</p>
                  <p className="text-sm text-foreground-muted">
                    {selected.passenger.staffNumber} · {selected.account.accountNumber}
                  </p>
                  <p className="mt-2 text-sm">
                    Current balance{" "}
                    <strong data-numeric>{formatCurrency(selected.account.balance)}</strong>
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={selected.account.status} />
                  </div>
                </div>

                {selected.account.status !== "active" ? (
                  <p className="text-sm text-danger-600">This wallet cannot accept a recharge.</p>
                ) : (
                  <>
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
                    <Select
                      label="How was payment taken?"
                      value={method}
                      onChange={(event) => setMethod(event.target.value as OfficeRechargeRequest["method"])}
                    >
                      <option value="agent">Cash at Youyi Building</option>
                      <option value="mobile_money">Orange Money / Afrimoney assisted</option>
                      <option value="bank_transfer">Bank transfer confirmed</option>
                    </Select>
                    <Input
                      label="Receipt note (optional)"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder="Receipt number or teller reference"
                    />
                    {error && <p className="text-sm text-danger-500">{error}</p>}
                    {receipt && (
                      <p className="text-sm text-success-700">
                        Credited {formatCurrency(receipt.amount)}. New balance{" "}
                        <strong data-numeric>{formatCurrency(receipt.balance)}</strong>.
                      </p>
                    )}
                    <Button loading={loading} onClick={() => void confirm()}>
                      Credit {formatCurrency(selectedAmount)}
                    </Button>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
