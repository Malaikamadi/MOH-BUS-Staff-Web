"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BusFront,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  QrCode,
  Route,
  Settings,
  Ticket,
  Users,
  UserRound,
  Wallet,
  X,
  BarChart3,
} from "lucide-react";

import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/utils/cn";
import { initials } from "@/utils/format";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const adminNav: NavItem[] = [
  { label: "Dashboard", href: routes.admin.dashboard, icon: LayoutDashboard },
  { label: "Staff", href: routes.admin.passengers, icon: Users },
  { label: "QR accounts", href: routes.admin.qrAccounts, icon: QrCode },
  { label: "Conductors", href: routes.admin.conductors, icon: UserRound },
  { label: "Buses", href: routes.admin.buses, icon: BusFront },
  { label: "Routes", href: routes.admin.routes, icon: Route },
  { label: "Fares", href: routes.admin.fares, icon: Ticket },
  { label: "Trips", href: routes.admin.trips, icon: MapPinned },
  { label: "Transactions", href: routes.admin.transactions, icon: CreditCard },
  { label: "Reports", href: routes.admin.reports, icon: BarChart3 },
  { label: "Settings", href: routes.admin.settings, icon: Settings },
];

const portalNav: NavItem[] = [
  { label: "Dashboard", href: routes.portal.dashboard, icon: LayoutDashboard },
  { label: "My QR", href: routes.portal.qr, icon: QrCode },
  { label: "Recharge", href: routes.portal.recharge, icon: Wallet },
  { label: "Transactions", href: routes.portal.transactions, icon: CreditCard },
  { label: "Trips", href: routes.portal.trips, icon: ClipboardList },
  { label: "Profile", href: routes.portal.profile, icon: UserRound },
];

export function DashboardShell({
  variant,
  children,
}: {
  variant: "admin" | "portal";
  children: React.ReactNode;
}) {
  const { session, signOut } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = variant === "admin" ? adminNav : portalNav;

  const isActive = (href: string) => {
    if (href === routes.admin.dashboard || href === routes.portal.dashboard) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4" aria-label="Primary">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-brand-50 text-brand-800"
                : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
              collapsed && "justify-center px-0",
            )}
          >
            <item.icon className={cn("size-5 shrink-0", active ? "text-brand-700" : "text-ink-400")} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border-subtle bg-surface transition-[width] duration-200 md:flex",
          collapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-border-subtle px-3">
          <Link href={variant === "admin" ? routes.admin.dashboard : routes.portal.dashboard}>
            <Logo markOnly={collapsed} />
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="grid size-8 place-items-center rounded-md text-ink-500 hover:bg-ink-100"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="size-4" />
          </button>
        </div>
        {nav}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink-950/40"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col bg-surface shadow-overlay">
            <div className="flex h-16 items-center justify-between border-b border-border-subtle px-4">
              <Logo />
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="size-5 text-ink-500" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border-subtle bg-surface/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-4" />
            </Button>
            <p className="text-sm font-semibold text-ink-900">
              {variant === "admin" ? "Administration" : "Staff portal"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-ink-900">{session?.user.name}</p>
              <p className="text-xs text-foreground-muted">{session?.user.email}</p>
            </div>
            <span className="grid size-9 place-items-center rounded-full bg-brand-700 text-xs font-semibold text-white">
              {initials(session?.user.name ?? "MOH")}
            </span>
            <Button variant="ghost" size="icon" onClick={() => void signOut()} aria-label="Sign out">
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
