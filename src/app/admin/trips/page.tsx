"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { DataTable, Pagination } from "@/components/ui/data-table";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { listTrips } from "@/services/trip.service";
import type { Paginated, Trip } from "@/types";
import { formatDateTime } from "@/utils/date";
import { formatCurrency } from "@/utils/format";

export default function AdminTripsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Trip> | null>(null);

  useEffect(() => {
    void listTrips({ page, search, filters: { status: status || undefined } }).then(setData);
  }, [page, search, status]);

  return (
    <div className="space-y-6">
      <PageHeader title="Trips" description="Every scan that reached fare processing, including failed and cancelled journeys." />
      <Card>
        <div className="flex flex-col gap-3 border-b border-border-subtle p-4 sm:flex-row">
          <Input placeholder="Search staff, bus or route" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:max-w-48">
            <option value="">All statuses</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
        <DataTable
          data={data?.items ?? []}
          rowKey={(row) => row.id}
          columns={[
            { key: "reference", header: "Trip ID" },
            { key: "passengerName", header: "Staff" },
            { key: "routeName", header: "Route" },
            { key: "busNumber", header: "Bus" },
            { key: "conductorName", header: "Conductor" },
            { key: "fare", header: "Fare", className: "text-right", render: (row) => formatCurrency(row.fare) },
            { key: "createdAt", header: "Date", render: (row) => formatDateTime(row.createdAt) },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
          ]}
        />
        {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
      </Card>
    </div>
  );
}
