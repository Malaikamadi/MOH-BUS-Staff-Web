"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, MapPin, Menu, Phone, X } from "lucide-react";

import { Logo } from "@/components/ui/logo";
import { Button, ButtonLink } from "@/components/ui/button";
import { socialIcons, type SocialIconName } from "@/components/ui/social-icons";
import { appConfig } from "@/config/app";
import { routes } from "@/config/routes";
import { cn } from "@/utils/cn";

const sections = [
  { label: "Overview", href: "#overview" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Register", href: "#register" },
  { label: "Recharge", href: "#recharge" },
  { label: "Fares", href: "#fares" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="z-40">
      {/* Utility bar — ministry identity and contact details */}
      <div className="bg-ministry-band text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href={routes.home}
            className="rounded-md"
            aria-label={`${appConfig.ministry}, ${appConfig.country} — home`}
          >
            <Logo variant="masthead" tone="inverted" />
          </Link>

          <div className="hidden flex-wrap items-center gap-x-6 gap-y-2 text-xs text-brand-100 lg:flex">
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-3.5 text-gold-400" />
              {appConfig.support.address}
            </span>
            <a
              href={`mailto:${appConfig.support.email}`}
              className="inline-flex items-center gap-2 transition-colors hover:text-white"
            >
              <Mail className="size-3.5 text-gold-400" />
              {appConfig.support.email}
            </a>
            <a
              href={`tel:${appConfig.support.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 transition-colors hover:text-white"
            >
              <Phone className="size-3.5 text-gold-400" />
              {appConfig.support.phone}
            </a>
          </div>

          <div className="hidden items-center gap-1.5 xl:flex">
            {appConfig.social.map((item) => {
              const Icon = socialIcons[item.icon as SocialIconName];
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={item.label}
                  className="grid size-7 place-items-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/25"
                >
                  <Icon className="size-3.5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Primary navigation */}
      <div className="sticky top-0 z-40 border-b border-border-subtle bg-surface/95 shadow-card backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
          <p className="py-3.5 text-sm font-semibold text-ink-900 md:hidden">{appConfig.name}</p>

          <nav className="hidden items-center md:flex" aria-label="Service sections">
            {sections.map((section) => (
              <a
                key={section.href}
                href={section.href}
                className="relative px-3.5 py-4 text-[13.5px] font-medium text-ink-700 transition-colors after:absolute after:inset-x-3 after:bottom-2 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand-600 after:transition-transform hover:text-brand-700 after:hover:scale-x-100"
              >
                {section.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <ButtonLink href={routes.login} variant="secondary" size="sm" className="h-9">
              Log in
            </ButtonLink>
            <ButtonLink href={routes.register} size="sm" className="h-9">
              Register
            </ButtonLink>
          </div>

          <Button
            variant="secondary"
            size="icon"
            className="my-2 md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="service-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

        {/* Mobile menu */}
        <div
          id="service-nav"
          className={cn("border-t border-border-subtle bg-surface md:hidden", open ? "block" : "hidden")}
        >
          <nav className="flex flex-col p-3" aria-label="Service sections">
            {sections.map((section) => (
              <a
                key={section.href}
                href={section.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-brand-50 hover:text-brand-700"
              >
                {section.label}
              </a>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border-subtle pt-3">
              <ButtonLink href={routes.login} variant="secondary" fullWidth>
                Log in
              </ButtonLink>
              <ButtonLink href={routes.register} fullWidth>
                Register
              </ButtonLink>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
