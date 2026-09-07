import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { Logo } from "@/components/ui/logo";
import { socialIcons, type SocialIconName } from "@/components/ui/social-icons";
import { appConfig } from "@/config/app";
import { routes } from "@/config/routes";

const columns = [
  {
    title: "For staff",
    links: [
      { label: "Register for an account", href: routes.register },
      { label: "Log in to the portal", href: routes.login },
      { label: "Recharge your wallet", href: "#recharge" },
      { label: "Approved fares", href: "#fares" },
      { label: "Report a lost QR card", href: routes.login },
    ],
  },
  {
    title: "Operations",
    links: [
      { label: "Administrator portal", href: routes.login },
      { label: "Conductor mobile app", href: "#conductor" },
      { label: "How the system works", href: "#how-it-works" },
      { label: "Facility transport offices", href: "#register" },
      { label: "Service routes", href: "#fares" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Ministry of Health", href: "#overview" },
      { label: "Privacy and data protection", href: "#" },
      { label: "Accessibility statement", href: "#" },
      { label: "Terms of service", href: "#" },
      { label: "Contact us", href: `mailto:${appConfig.support.email}` },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-brand-950 text-brand-100">
      {/* Gold rule echoing the ministry's accent */}
      <div className="h-1 bg-gold-500" />

      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Logo variant="masthead" tone="inverted" />
            <p className="mt-5 max-w-xs text-sm leading-6 text-brand-200/90">
              The official cashless transport service for {appConfig.ministry} staff. One QR
              account per staff member, a rechargeable Leone wallet, and a full record of every
              trip.
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold-400" />
                <span className="text-brand-200/90">{appConfig.support.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-gold-400" />
                <a
                  href={`mailto:${appConfig.support.email}`}
                  className="text-brand-200/90 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  {appConfig.support.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-gold-400" />
                <a
                  href={`tel:${appConfig.support.phone.replace(/\s/g, "")}`}
                  className="text-brand-200/90 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  {appConfig.support.phone}
                </a>
              </li>
            </ul>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-display text-sm font-semibold text-white">{column.title}</h3>
              <span className="mt-2.5 block h-0.5 w-9 rounded-full bg-gold-500" />
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-brand-200/90 underline-offset-4 transition-colors hover:text-white hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {appConfig.social.map((item) => {
              const Icon = socialIcons[item.icon as SocialIconName];
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={item.label}
                  className="grid size-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-gold-500 hover:text-brand-950"
                >
                  <Icon className="size-4" />
                </a>
              );
            })}
          </div>

          <p className="text-xs text-brand-200/75">
            © {new Date().getFullYear()} {appConfig.fullName}
          </p>
        </div>

        <p className="mt-6 rounded-xl bg-white/5 px-4 py-3 text-xs leading-5 text-brand-200/80">
          Your identity number and staff record are never stored in your QR code. Each scan
          resolves a secure token held by the ministry.
        </p>
      </div>
    </footer>
  );
}
