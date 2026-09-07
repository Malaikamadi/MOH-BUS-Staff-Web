import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function PortalLayout({ children }: LayoutProps<"/portal">) {
  return <DashboardShell variant="portal">{children}</DashboardShell>;
}
