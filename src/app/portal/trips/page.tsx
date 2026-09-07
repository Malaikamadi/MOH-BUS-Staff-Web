"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { DataTable, Pagination } from "@/components/ui/data-table";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/hooks/use-auth";
import { getCurrentStaffProfile } from "@/services/passenger.service";
import { listStaffTrips } from "@/services/trip.service";
import type { Paginated, Trip } from "@/types";
import { formatDateTime } from "@/utils/date";
import { formatCurrency } from "@/utils/format";

export default function PortalTripsPage() {
  const { session } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Trip> | null>(null);
  const [passengerId, setPassengerId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    void getCurrentStaffProfile(session.user.email).then((profile) => setPassengerId(profile.passenger.id));
  }, [session]);

  useEffect(() => {
    if (!passengerId) return;
    void listStaffTrips(passengerId, {
      page,
      search,
      filters: { status: status || undefined },
    }).then(setData);
  }, [passengerId, page, search, status]);

  return (
    <div className="space-y-6">
      <PageHeader title="Trip history" description="Journeys recorded against your staff QR account." />
      <Card>
        <div className="grid gap-3 border-b border-border-subtle p-4 sm:grid-cols-2">
          <Input placeholder="Search route or bus" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
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
            { key: "createdAt", header: "Date", render: (row) => formatDateTime(row.createdAt) },
            { key: "reference", header: "Trip ID" },
            { key: "routeName", header: "Route" },
            { key: "busNumber", header: "Bus" },
            { key: "fare", header: "Fare", className: "text-right", render: (row) => formatCurrency(row.fare) },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
          ]}
        />
        {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
      </Card>
    </div>
  );
}
