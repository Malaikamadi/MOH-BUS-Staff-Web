import type { ID, ISODateString } from "./common";

export type TransactionType = "recharge" | "fare" | "refund" | "adjustment";

export type TransactionStatus = "successful" | "pending" | "failed" | "reversed";

export type PaymentMethodId = "card" | "bank_transfer" | "ussd" | "mobile_money" | "agent";

export interface Transaction {
  id: ID;
  /** Public-facing reference, e.g. `TXN-2A93F1`. */
  reference: string;
  accountId: ID;
  passengerId: ID;
  passengerName: string;
  type: TransactionType;
  description: string;
  /** Positive for credits, negative for debits. */
  amount: number;
  balanceAfter: number;
  status: TransactionStatus;
  method?: PaymentMethodId;
  /** Present when the transaction was produced by a trip. */
  tripId?: ID;
  failureReason?: string;
  /** Set when a head-office clerk or administrator processed the top-up. */
  processedByUserId?: ID;
  processedByName?: string;
  createdAt: ISODateString;
}

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  description: string;
  /** Fee shown to the passenger before confirmation. */
  feePercent: number;
  enabled: boolean;
}

export interface RechargeRequest {
  accountId: ID;
  amount: number;
  method: PaymentMethodId;
  note?: string;
}

export interface RechargeResult {
  transaction: Transaction;
  balance: number;
}
