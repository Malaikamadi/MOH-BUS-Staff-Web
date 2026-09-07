"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { DataTable, Pagination } from "@/components/ui/data-table";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { routes } from "@/config/routes";
import { listPassengers } from "@/services/passenger.service";
import type { Paginated, Passenger } from "@/types";
import { formatCurrency } from "@/utils/format";
import { formatDate } from "@/utils/date";

export default function StaffListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Passenger> | null>(null);

  useEffect(() => {
    void listPassengers({
      page,
      search,
      filters: { status: status || undefined },
    }).then(setData);
  }, [page, search, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff accounts"
        description="Search, filter and manage Ministry of Health staff transport accounts."
      />
      <Card>
        <div className="flex flex-col gap-3 border-b border-border-subtle p-4 sm:flex-row">
          <Input
            placeholder="Search name, staff number or facility"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
          />
          <Select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
            className="sm:max-w-48"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </Select>
        </div>
        <DataTable
          data={data?.items ?? []}
          rowKey={(row) => row.id}
          onRowClick={(row) => router.push(routes.admin.passenger(row.id))}
          columns={[
            { key: "name", header: "Staff", render: (row) => (
              <span>
                <span className="block font-medium text-ink-900">{row.name}</span>
                <span className="text-xs text-foreground-muted">{row.staffNumber}</span>
              </span>
            ) },
            { key: "facility", header: "Facility" },
            { key: "designation", header: "Designation" },
            {
              key: "balance",
              header: "Wallet",
              className: "text-right",
              render: (row) => formatCurrency(row.walletBalance ?? 0),
            },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
            { key: "createdAt", header: "Enrolled", render: (row) => formatDate(row.createdAt) },
          ]}
        />
        {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
      </Card>
    </div>
  );
}
