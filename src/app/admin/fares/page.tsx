"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, Pagination } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { listFares, setFareStatus } from "@/services/admin.service";
import type { Fare, Paginated } from "@/types";
import { formatCurrency } from "@/utils/format";
import { formatDate } from "@/utils/date";

export default function FaresPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Fare> | null>(null);

  async function load() {
    setData(await listFares({ page, search }));
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fares"
        description="Staff fares are owned by the backend and applied when a conductor scans a QR. They are never hardcoded in the mobile app."
      />
      <Card>
        <div className="border-b border-border-subtle p-4">
          <Input placeholder="Search fares" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <DataTable
          data={data?.items ?? []}
          rowKey={(row) => row.id}
          columns={[
            { key: "name", header: "Fare" },
            { key: "routeName", header: "Route" },
            { key: "category", header: "Category" },
            { key: "amount", header: "Amount", className: "text-right", render: (row) => formatCurrency(row.amount) },
            { key: "effectiveFrom", header: "Effective from", render: (row) => formatDate(row.effectiveFrom) },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
            {
              key: "actions",
              header: "",
              render: (row) => (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void setFareStatus(row.id, row.status === "active" ? "inactive" : "active").then(load)}
                >
                  {row.status === "active" ? "Deactivate" : "Activate"}
                </Button>
              ),
            },
          ]}
        />
        {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
      </Card>
    </div>
  );
}
