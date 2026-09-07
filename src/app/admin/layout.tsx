import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <DashboardShell variant="admin">{children}</DashboardShell>;
}
