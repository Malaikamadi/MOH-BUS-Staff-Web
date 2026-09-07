"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { DataTable, Pagination } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { listBuses } from "@/services/admin.service";
import type { Bus, Paginated } from "@/types";

export default function BusesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Bus> | null>(null);

  useEffect(() => {
    void listBuses({ page, search }).then(setData);
  }, [page, search]);

  return (
    <div className="space-y-6">
      <PageHeader title="Buses" description="Fleet assigned to ministry staff transport routes." />
      <Card>
        <div className="border-b border-border-subtle p-4">
          <Input placeholder="Search bus or registration number" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <DataTable
          data={data?.items ?? []}
          rowKey={(row) => row.id}
          columns={[
            { key: "busNumber", header: "Bus number" },
            { key: "registrationNumber", header: "Registration" },
            { key: "routeName", header: "Assigned route", render: (row) => row.routeName ?? "—" },
            { key: "conductorName", header: "Conductor", render: (row) => row.conductorName ?? "Unassigned" },
            { key: "capacity", header: "Capacity" },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
          ]}
        />
        {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
      </Card>
    </div>
  );
}
