"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { DataTable, Pagination } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { listHeadOfficeRecharges } from "@/services/super-admin.service";
import type { Paginated, Transaction } from "@/types";
import { formatDateTime } from "@/utils/date";
import { formatCurrency } from "@/utils/format";

export default function SuperAdminRechargesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Transaction> | null>(null);

  useEffect(() => {
    void listHeadOfficeRecharges({ page, search }).then(setData);
  }, [page, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Head office recharges"
        description="Every wallet top-up processed at Youyi Building, attributed to the clerk who took the payment."
      />
      <Card>
        <div className="border-b border-border-subtle p-4">
          <Input
            placeholder="Search staff, clerk or reference"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
          />
        </div>
        <DataTable
          data={data?.items ?? []}
          rowKey={(row) => row.id}
          columns={[
            { key: "createdAt", header: "When", render: (row) => formatDateTime(row.createdAt) },
            { key: "passengerName", header: "Staff" },
            { key: "processedByName", header: "Clerk", render: (row) => row.processedByName ?? "—" },
            {
              key: "amount",
              header: "Amount",
              className: "text-right",
              render: (row) => formatCurrency(row.amount, { signed: true }),
            },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
          ]}
        />
        {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
      </Card>
    </div>
  );
}
