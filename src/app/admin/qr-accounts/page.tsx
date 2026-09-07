"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, Pagination } from "@/components/ui/data-table";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { listQrAccounts, replaceQr, setQrStatus } from "@/services/qr.service";
import type { Paginated, QRAccount } from "@/types";
import { formatDate } from "@/utils/date";
import { truncateToken } from "@/utils/format";

export default function QrAccountsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<QRAccount> | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    const next = await listQrAccounts({ page, search, filters: { status: status || undefined } });
    setData(next);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status]);

  async function disable(id: string) {
    await setQrStatus(id, "disabled");
    setMessage("QR disabled. The staff member cannot board until it is reactivated or replaced.");
    await load();
  }

  async function reactivate(id: string) {
    await setQrStatus(id, "active");
    setMessage("QR reactivated.");
    await load();
  }

  async function replace(id: string) {
    if (!window.confirm("This invalidates the current QR and issues a new token. The wallet balance is unchanged.")) {
      return;
    }
    const next = await replaceQr(id);
    setMessage(`New QR issued. Token ${truncateToken(next.secureToken)}. Wallet balance kept.`);
    await load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="QR accounts"
        description="Each staff member has one QR token. Replacing a compromised QR invalidates the old token and keeps the same wallet."
      />
      {message && <p className="text-sm text-success-700">{message}</p>}
      <Card>
        <div className="flex flex-col gap-3 border-b border-border-subtle p-4 sm:flex-row">
          <Input placeholder="Search staff or token" value={search} onChange={(event) => setSearch(event.target.value)} />
          <Select value={status} onChange={(event) => setStatus(event.target.value)} className="sm:max-w-48">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="replaced">Replaced</option>
          </Select>
        </div>
        <DataTable
          data={data?.items ?? []}
          rowKey={(row) => row.id}
          columns={[
            { key: "passengerName", header: "Staff" },
            { key: "secureToken", header: "Token", render: (row) => <span className="font-mono text-xs">{truncateToken(row.secureToken)}</span> },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
            { key: "scanCount", header: "Scans" },
            { key: "createdAt", header: "Created", render: (row) => formatDate(row.createdAt) },
            {
              key: "actions",
              header: "",
              render: (row) => (
                <div className="flex flex-wrap justify-end gap-2">
                  {row.status === "active" && (
                    <Button size="sm" variant="secondary" onClick={() => void disable(row.id)}>
                      Disable
                    </Button>
                  )}
                  {row.status === "disabled" && (
                    <Button size="sm" variant="secondary" onClick={() => void reactivate(row.id)}>
                      Reactivate
                    </Button>
                  )}
                  {row.status !== "replaced" && (
                    <Button size="sm" onClick={() => void replace(row.id)}>
                      Replace
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
        {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
      </Card>
    </div>
  );
}
