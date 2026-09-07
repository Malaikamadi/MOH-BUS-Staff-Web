"use client";

import { useState } from "react";

import { deskPaymentMethods } from "@/components/office/wallet-recharge-desk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { processOfficeRecharge } from "@/services/office.service";
import type { OfficeRechargeRequest, TransportAccount } from "@/types";
import { formatCurrency } from "@/utils/format";

const presets = [20, 50, 100, 200, 500];

export function StaffWalletTopUp({
  staffName,
  account,
  onCredited,
}: {
  staffName: string;
  account: TransportAccount;
  onCredited: (balance: number) => Promise<void> | void;
}) {
  const [amount, setAmount] = useState(100);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState<OfficeRechargeRequest["method"]>("agent");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedAmount = Number(custom) > 0 ? Number(custom) : amount;

  async function confirm() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const previous = account.balance;
      const result = await processOfficeRecharge({
        accountId: account.id,
        amount: selectedAmount,
        method,
        note: note.trim() || undefined,
      });
      setMessage(
        `${staffName}: ${formatCurrency(previous)} + ${formatCurrency(selectedAmount)} = ${formatCurrency(result.balance)}. Same QR remains active.`,
      );
      setCustom("");
      await onCredited(result.balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment could not be confirmed.");
    } finally {
      setLoading(false);
    }
  }

  if (account.status !== "active") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recharge this wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-danger-600">This wallet cannot accept a recharge.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recharge this wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground-muted">
          Current balance{" "}
          <strong className="text-ink-900" data-numeric>
            {formatCurrency(account.balance)}
          </strong>
          . Enter the amount paid — the QR code does not change.
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
        {error && <p className="text-sm text-danger-500">{error}</p>}
        {message && <p className="text-sm text-success-700">{message}</p>}
        <Button disabled={selectedAmount < 5} loading={loading} onClick={() => void confirm()}>
          Credit {formatCurrency(selectedAmount)}
        </Button>
      </CardContent>
    </Card>
  );
}
