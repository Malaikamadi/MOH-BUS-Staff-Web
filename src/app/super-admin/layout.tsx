import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function SuperAdminLayout({ children }: LayoutProps<"/super-admin">) {
  return <DashboardShell variant="super-admin">{children}</DashboardShell>;
}
