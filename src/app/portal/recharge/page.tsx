"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/hooks/use-auth";
import { getCurrentStaffProfile } from "@/services/passenger.service";
import { listPaymentMethods, rechargeWallet } from "@/services/wallet.service";
import type { PaymentMethod, PaymentMethodId, TransportAccount } from "@/types";
import { formatCurrency } from "@/utils/format";

const presets = [20, 50, 100, 200, 500];
const steps = ["Amount", "Payment method", "Confirm", "Done"] as const;

export default function RechargePage() {
  const { session } = useAuth();
  const [step, setStep] = useState<(typeof steps)[number]>("Amount");
  const [amount, setAmount] = useState(50);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState<PaymentMethodId>("mobile_money");
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [account, setAccount] = useState<TransportAccount | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [newBalance, setNewBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!session) return;
    void Promise.all([getCurrentStaffProfile(session.user.email), listPaymentMethods()]).then(([profile, list]) => {
      setAccount(profile.account);
      setMethods(list.filter((item) => item.enabled));
    });
  }, [session]);

  const selected = Number(custom) > 0 ? Number(custom) : amount;
  const selectedMethod = methods.find((item) => item.id === method);

  async function confirm() {
    if (!account) return;
    setLoading(true);
    setError("");
    try {
      const result = await rechargeWallet({ accountId: account.id, amount: selected, method });
      setNewBalance(result.balance);
      setAccount({ ...account, balance: result.balance });
      setStep("Done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recharge wallet"
        description="Top up your Leone wallet. Your QR code does not change after a recharge."
      />

      <ol className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
        {steps.map((item) => (
          <li key={item} className={item === step ? "text-brand-700" : ""}>
            {item}
          </li>
        ))}
      </ol>

      {account && (
        <p className="text-sm text-foreground-muted">
          Current balance{" "}
          <span className="font-semibold text-ink-900" data-numeric>
            {formatCurrency(account.balance)}
          </span>
        </p>
      )}

      {step === "Amount" && (
        <Card>
          <CardContent className="space-y-4">
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
                    amount === value && !custom ? "border-brand-600 bg-brand-50 text-brand-800" : "border-border-strong"
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
              onChange={(e) => setCustom(e.target.value)}
            />
            <Button onClick={() => setStep("Payment method")}>Continue</Button>
          </CardContent>
        </Card>
      )}

      {step === "Payment method" && (
        <Card>
          <CardContent className="space-y-4">
            <Select label="Payment method" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethodId)}>
              {methods.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
            <p className="text-sm text-foreground-muted">{selectedMethod?.description}</p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep("Amount")}>
                Back
              </Button>
              <Button onClick={() => setStep("Confirm")}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "Confirm" && (
        <Card>
          <CardContent className="space-y-4">
            <p className="text-sm">
              You are about to recharge{" "}
              <strong data-numeric>{formatCurrency(selected)}</strong> using {selectedMethod?.label}.
            </p>
            {error && <p className="text-sm text-danger-500">{error}</p>}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep("Payment method")}>
                Back
              </Button>
              <Button loading={loading} onClick={() => void confirm()}>
                Confirm payment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "Done" && newBalance !== null && (
        <Card>
          <CardContent className="space-y-3">
            <p className="font-display text-xl font-semibold text-success-700">Payment successful</p>
            <p className="text-sm text-ink-600">
              Your new balance is{" "}
              <strong data-numeric>{formatCurrency(newBalance)}</strong>. Your QR code is unchanged.
            </p>
            <Button
              onClick={() => {
                setStep("Amount");
                setNewBalance(null);
              }}
            >
              Make another recharge
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
