"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, Pagination } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { createConductor, listConductors, setConductorStatus } from "@/services/admin.service";
import type { Conductor, Paginated } from "@/types";
import { formatDate } from "@/utils/date";

export default function ConductorsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Conductor> | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", email: "", staffNumber: "" });

  async function load() {
    setData(await listConductors({ page, search }));
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    await createConductor(form);
    setOpen(false);
    setForm({ name: "", contact: "", email: "", staffNumber: "" });
    await load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conductors"
        description="Register and manage conductors who scan staff QR codes on the ministry app."
        actions={<Button onClick={() => setOpen(true)}>Register conductor</Button>}
      />
      {open && (
        <Card className="p-5">
          <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-2">
            <Input label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Staff number" required value={form.staffNumber} onChange={(e) => setForm({ ...form, staffNumber: e.target.value })} />
            <Input label="Contact" required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit">Save</Button>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
      <Card>
        <div className="border-b border-border-subtle p-4">
          <Input placeholder="Search conductors" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <DataTable
          data={data?.items ?? []}
          rowKey={(row) => row.id}
          columns={[
            { key: "name", header: "Name", render: (row) => (
              <span>
                <span className="block font-medium">{row.name}</span>
                <span className="text-xs text-foreground-muted">{row.staffNumber}</span>
              </span>
            ) },
            { key: "contact", header: "Contact" },
            { key: "busNumber", header: "Bus", render: (row) => row.busNumber ?? "Unassigned" },
            { key: "tripsProcessed", header: "Trips processed" },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
            { key: "createdAt", header: "Registered", render: (row) => formatDate(row.createdAt) },
            {
              key: "actions",
              header: "",
              render: (row) => (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void setConductorStatus(row.id, row.status === "active" ? "suspended" : "active").then(() => load())}
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
