"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { routes } from "@/config/routes";
import { getTransaction } from "@/services/transaction.service";
import type { Transaction } from "@/types";
import { formatDateTime } from "@/utils/date";
import { formatCurrency, humanise } from "@/utils/format";

export default function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const [txn, setTxn] = useState<Transaction | null>(null);

  useEffect(() => {
    void getTransaction(params.id).then(setTxn);
  }, [params.id]);

  if (!txn) return <p className="text-sm text-foreground-muted">Loading transaction…</p>;

  return (
    <div className="space-y-6">
      <PageHeader title={txn.reference} description={txn.description} />
      <Card>
        <CardHeader>
          <CardTitle>Transaction details</CardTitle>
          <StatusBadge status={txn.status} />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Staff</p>
            <Link href={routes.admin.passenger(txn.passengerId)} className="mt-1 block font-medium text-brand-700">
              {txn.passengerName}
            </Link>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Type</p>
            <p className="mt-1 font-medium">{humanise(txn.type)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Amount</p>
            <p className="mt-1 font-semibold" data-numeric>
              {formatCurrency(txn.amount, { signed: true })}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Balance after</p>
            <p className="mt-1 font-medium" data-numeric>
              {formatCurrency(txn.balanceAfter)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Date</p>
            <p className="mt-1 font-medium">{formatDateTime(txn.createdAt)}</p>
          </div>
          {txn.failureReason && (
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Failure reason</p>
              <p className="mt-1 font-medium text-danger-700">{txn.failureReason}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
