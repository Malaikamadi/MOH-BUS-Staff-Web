"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { DataTable, Pagination } from "@/components/ui/data-table";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { routes } from "@/config/routes";
import { listTransactions } from "@/services/transaction.service";
import type { Paginated, Transaction } from "@/types";
import { formatDateTime } from "@/utils/date";
import { formatCurrency, humanise } from "@/utils/format";

export default function AdminTransactionsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Transaction> | null>(null);

  useEffect(() => {
    void listTransactions({ page, search, filters: { type: type || undefined } }).then(setData);
  }, [page, search, type]);

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" description="Recharges, fare deductions, refunds and adjustments across all staff wallets." />
      <Card>
        <div className="flex flex-col gap-3 border-b border-border-subtle p-4 sm:flex-row">
          <Input placeholder="Search reference or staff" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={type} onChange={(e) => setType(e.target.value)} className="sm:max-w-48">
            <option value="">All types</option>
            <option value="recharge">Recharge</option>
            <option value="fare">Fare deduction</option>
            <option value="refund">Refund</option>
            <option value="adjustment">Adjustment</option>
          </Select>
        </div>
        <DataTable
          data={data?.items ?? []}
          rowKey={(row) => row.id}
          onRowClick={(row) => router.push(routes.admin.transaction(row.id))}
          columns={[
            { key: "reference", header: "Transaction ID" },
            { key: "passengerName", header: "Staff" },
            { key: "type", header: "Type", render: (row) => humanise(row.type) },
            { key: "amount", header: "Amount", className: "text-right", render: (row) => formatCurrency(row.amount, { signed: true }) },
            { key: "createdAt", header: "Date", render: (row) => formatDateTime(row.createdAt) },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
          ]}
        />
        {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
      </Card>
    </div>
  );
}
