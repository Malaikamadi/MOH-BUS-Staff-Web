import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function OfficeLayout({ children }: LayoutProps<"/office">) {
  return <DashboardShell variant="office">{children}</DashboardShell>;
}
