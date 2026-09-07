import { accounts, newId, passengers, transactions } from "@/data/store";
import { apiRequest, mockLatency, useLiveApi } from "@/services/api";
import type { PaymentMethod, RechargeRequest, RechargeResult, TransportAccount } from "@/types";

export const paymentMethods: PaymentMethod[] = [
  { id: "mobile_money", label: "Orange Money / Afrimoney", description: "Instant credit to your staff wallet", feePercent: 0, enabled: true },
  { id: "bank_transfer", label: "Bank transfer", description: "Credited once the bank confirms payment", feePercent: 0, enabled: true },
  { id: "card", label: "Debit or credit card", description: "Available at any time", feePercent: 1.5, enabled: true },
  { id: "agent", label: "Facility transport office", description: "Cash top-up at your duty station", feePercent: 0, enabled: true },
];

export async function getWallet(accountId: string): Promise<TransportAccount> {
  if (useLiveApi()) return apiRequest(`/wallet/${accountId}`);
  await mockLatency();
  const account = accounts.find((row) => row.id === accountId);
  if (!account) throw new Error("Wallet not found.");
  return account;
}

export async function listPaymentMethods() {
  if (useLiveApi()) return apiRequest<PaymentMethod[]>("/wallet/methods");
  await mockLatency(120);
  return paymentMethods;
}

export async function rechargeWallet(request: RechargeRequest): Promise<RechargeResult> {
  if (useLiveApi()) {
    return apiRequest("/wallet/recharge", { method: "POST", body: request });
  }

  await mockLatency(700);
  const account = accounts.find((row) => row.id === request.accountId);
  const passenger = passengers.find((row) => row.accountId === request.accountId);
  if (!account || !passenger) throw new Error("Wallet not found.");
  if (account.status !== "active") throw new Error("This wallet cannot accept a recharge.");
  if (request.amount < 5) throw new Error("The minimum recharge is Le 5.00.");

  account.balance += request.amount;
  account.updatedAt = new Date().toISOString();

  const transaction = {
    id: newId("txn"),
    reference: `TXN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    accountId: account.id,
    passengerId: passenger.id,
    passengerName: passenger.name,
    type: "recharge" as const,
    description: `Wallet recharge · ${request.method.replace("_", " ")}`,
    amount: request.amount,
    balanceAfter: account.balance,
    status: "successful" as const,
    method: request.method,
    createdAt: new Date().toISOString(),
  };
  transactions.unshift(transaction);

  return { transaction, balance: account.balance };
}
