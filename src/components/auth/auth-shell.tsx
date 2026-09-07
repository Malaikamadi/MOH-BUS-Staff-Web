import Link from "next/link";

import { Logo } from "@/components/ui/logo";
import { appConfig } from "@/config/app";
import { routes } from "@/config/routes";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas lg:flex-row">
      <aside className="bg-ministry-gradient relative hidden w-[42%] flex-col justify-between p-10 text-white lg:flex">
        <Link href={routes.home}>
          <Logo variant="masthead" tone="inverted" />
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-300">
            {appConfig.ministry} staff service
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight">
            One QR code for every official journey
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-brand-100">
            Sign in to manage your staff wallet, view your permanent QR code and review trip
            history. Administrators use the same portal to operate the network.
          </p>
        </div>
        <p className="text-xs text-brand-200/80">{appConfig.fullName}</p>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="border-b border-border-subtle bg-surface px-4 py-4 lg:hidden">
          <Link href={routes.home}>
            <Logo variant="masthead" />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
          <div className="w-full max-w-md">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-foreground-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
