"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { appConfig } from "@/config/app";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    supportEmail: appConfig.support.email,
    supportPhone: appConfig.support.phone,
    lowBalance: String(appConfig.lowBalanceThreshold),
  });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    window.localStorage.setItem("transitpay.settings", JSON.stringify(form));
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Organisation details and wallet policy. Changes are stored locally until the backend is connected." />
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid max-w-xl gap-4">
            <Input label="Support email" value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} />
            <Input label="Support phone" value={form.supportPhone} onChange={(e) => setForm({ ...form, supportPhone: e.target.value })} />
            <Input
              label="Low-balance threshold (Le)"
              type="number"
              value={form.lowBalance}
              onChange={(e) => setForm({ ...form, lowBalance: e.target.value })}
            />
            {saved && <p className="text-sm text-success-700">Settings saved on this device.</p>}
            <Button type="submit" className="w-fit">
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
