"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { createOperator, listOperators, setOperatorStatus } from "@/services/super-admin.service";
import type { OperatorDraft, User } from "@/types";
import { roleLabel } from "@/lib/roles";

const empty: OperatorDraft = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "officer",
};

export default function OperatorsPage() {
  const [operators, setOperators] = useState<User[]>([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setOperators(await listOperators());
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createOperator(form);
      setForm(empty);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create this operator.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operators"
        description="Create head-office recharge clerks and operations administrators. They use the same database as staff and conductors."
      />

      <Card>
        <CardHeader>
          <CardTitle>Add operator</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(event) => void onCreate(event)} className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full name"
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <Input
              label="Work email"
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            <Input
              label="Phone"
              required
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            />
            <Input
              label="Temporary password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
            <Select
              label="Role"
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({ ...current, role: event.target.value as OperatorDraft["role"] }))
              }
            >
              <option value="officer">Head office recharge clerk</option>
              <option value="admin">Operations administrator</option>
            </Select>
            {error && <p className="text-sm text-danger-500 sm:col-span-2">{error}</p>}
            <div className="sm:col-span-2">
              <Button type="submit" loading={loading}>
                Create operator
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {operators.map((row) => (
            <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface-muted px-3 py-3">
              <div>
                <p className="text-sm font-medium text-ink-900">{row.name}</p>
                <p className="text-xs text-foreground-muted">
                  {roleLabel(row.role)} · {row.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={row.status} />
                {row.role !== "super_admin" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      void setOperatorStatus(row.id, row.status === "active" ? "suspended" : "active").then(load)
                    }
                  >
                    {row.status === "active" ? "Suspend" : "Activate"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
