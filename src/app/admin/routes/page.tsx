"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { DataTable, Pagination } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { listRoutes } from "@/services/admin.service";
import type { Paginated, TransportRoute } from "@/types";
import { formatCurrency } from "@/utils/format";

export default function RoutesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<TransportRoute> | null>(null);

  useEffect(() => {
    void listRoutes({ page, search }).then(setData);
  }, [page, search]);

  return (
    <div className="space-y-6">
      <PageHeader title="Routes" description="Published staff transport routes. Fares are managed separately and applied at scan time." />
      <Card>
        <div className="border-b border-border-subtle p-4">
          <Input placeholder="Search routes" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <DataTable
          data={data?.items ?? []}
          rowKey={(row) => row.id}
          columns={[
            { key: "code", header: "Code" },
            { key: "name", header: "Route" },
            { key: "origin", header: "Origin" },
            { key: "destination", header: "Destination" },
            { key: "stops", header: "Stops", render: (row) => String(row.stops.length) },
            { key: "fare", header: "Staff fare", className: "text-right", render: (row) => formatCurrency(row.fare) },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
          ]}
        />
        {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
      </Card>
    </div>
  );
}
