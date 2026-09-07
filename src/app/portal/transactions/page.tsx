"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { DataTable, Pagination } from "@/components/ui/data-table";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/hooks/use-auth";
import { getCurrentStaffProfile } from "@/services/passenger.service";
import { listStaffTransactions } from "@/services/transaction.service";
import type { Paginated, Transaction } from "@/types";
import { formatDateTime } from "@/utils/date";
import { formatCurrency, humanise } from "@/utils/format";

export default function PortalTransactionsPage() {
  const { session } = useAuth();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Transaction> | null>(null);
  const [passengerId, setPassengerId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    void getCurrentStaffProfile(session.user.email).then((profile) => setPassengerId(profile.passenger.id));
  }, [session]);

  useEffect(() => {
    if (!passengerId) return;
    void listStaffTransactions(passengerId, {
      page,
      search,
      from: from || undefined,
      filters: { type: type || undefined },
    }).then(setData);
  }, [passengerId, page, search, type, from]);

  return (
    <div className="space-y-6">
      <PageHeader title="Transaction history" description="Every recharge, fare deduction, refund and adjustment on your staff wallet." />
      <Card>
        <div className="grid gap-3 border-b border-border-subtle p-4 sm:grid-cols-3">
          <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            <option value="recharge">Recharge</option>
            <option value="fare">Fare deduction</option>
            <option value="refund">Refund</option>
            <option value="adjustment">Adjustment</option>
          </Select>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <DataTable
          data={data?.items ?? []}
          rowKey={(row) => row.id}
          columns={[
            { key: "createdAt", header: "Date", render: (row) => formatDateTime(row.createdAt) },
            { key: "reference", header: "Transaction ID" },
            { key: "type", header: "Type", render: (row) => humanise(row.type) },
            { key: "description", header: "Description" },
            { key: "amount", header: "Amount", className: "text-right", render: (row) => formatCurrency(row.amount, { signed: true }) },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
          ]}
        />
        {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
      </Card>
    </div>
  );
}
