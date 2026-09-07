import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Check,
  CreditCard,
  HeartPulse,
  Info,
  QrCode,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  UserPlus,
  Wallet,
} from "lucide-react";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { ButtonLink } from "@/components/ui/button";
import { appConfig } from "@/config/app";
import { routes } from "@/config/routes";
import { formatCurrency } from "@/utils/format";

const networkStats = [
  { value: "486,200+", label: "Trips processed" },
  { value: "42", label: "Health facilities served" },
  { value: "180", label: "Buses on the network" },
  { value: "24", label: "Approved routes" },
  { value: "15K+", label: "Enrolled staff" },
  { value: "< 2s", label: "Average scan time" },
];

const howItWorks = [
  {
    icon: UserPlus,
    title: "Enrol once",
    body: "Enrol with your ministry staff number and duty facility. A transport wallet and a permanent QR account are issued to you.",
  },
  {
    icon: Wallet,
    title: "Recharge your wallet",
    body: "Top up by mobile money, bank transfer, card or at your facility transport office. Recharging never changes your QR code.",
  },
  {
    icon: ScanLine,
    title: "Board and present your QR",
    body: "The conductor scans your code with the official ministry app. Your staff rate and the approved fare for that route are retrieved automatically.",
  },
  {
    icon: BadgeCheck,
    title: "Fare deducted and receipted",
    body: "Your wallet is debited at the staff rate, and the trip is recorded against your account for facility reporting.",
  },
];

const registrationSteps = [
  {
    step: "1",
    title: "Complete the enrolment form",
    body: "Provide your full name, ministry staff number, duty facility, phone number and National Identification Number.",
  },
  {
    step: "2",
    title: "Facility verification",
    body: "Your facility administrator confirms your posting, and the ministry activates your transport account.",
  },
  {
    step: "3",
    title: "Collect your QR code",
    body: "View your code in the staff portal on any phone, or collect a printed transport card from your facility transport office.",
  },
];

const rechargeChannels = [
  {
    icon: Smartphone,
    label: "Orange Money & Afrimoney",
    detail: "Credited instantly, no smartphone required",
  },
  { icon: Banknote, label: "Bank transfer", detail: "Credited once the bank confirms payment" },
  {
    icon: CreditCard,
    label: "Debit or credit card",
    detail: "Available at any time, credited instantly",
  },
  {
    icon: Stethoscope,
    label: "Facility transport office",
    detail: "Cash top-up at your duty station",
  },
];

const presetAmounts = [20, 50, 100, 200, 500];

/** Illustrative published fares. Live values are served from fare management. */
const publishedFares = [
  {
    code: "FT-01",
    route: "Lumley — Congo Cross — Connaught Hospital",
    distance: "12 km",
    fare: 4,
  },
  {
    code: "FT-04",
    route: "Kissy — Fourah Bay — Ola During Children's Hospital",
    distance: "9 km",
    fare: 3.5,
  },
  {
    code: "FT-07",
    route: "Aberdeen — Lumley — PCMH Freetown",
    distance: "14 km",
    fare: 4.5,
  },
  {
    code: "WT-02",
    route: "Waterloo — Hastings — Connaught Hospital",
    distance: "31 km",
    fare: 7.5,
  },
  {
    code: "IC-11",
    route: "Freetown — Moyamba — Bo Government Hospital",
    distance: "246 km",
    fare: 65,
  },
];

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-[2rem]">
        {title}
      </h2>
      <span className="mt-4 block h-1 w-14 rounded-full bg-gold-500" />
      {children && <p className="mt-5 text-base leading-7 text-ink-600">{children}</p>}
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section id="overview" className="bg-ministry-gradient scroll-mt-20">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:py-20">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-gold-300 ring-1 ring-white/15">
                <HeartPulse className="size-3.5" />
                Official {appConfig.ministry} staff service
              </span>

              <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
                Reliable transport for ministry health workers
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-brand-100">
                Ministry of Health staff travel on official buses using one secure QR code.
                Enrol once for a rechargeable Leone wallet, top up when it suits you, then
                present your code to board — your staff fare is deducted automatically and
                every trip is receipted.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ButtonLink
                  href={routes.register}
                  size="lg"
                  className="h-12 rounded-xl bg-gold-500 px-6 text-base font-semibold text-brand-950 shadow-raised hover:bg-gold-400 active:bg-gold-600"
                  trailingIcon={<ArrowRight className="size-4" />}
                >
                  Start now
                </ButtonLink>
                <ButtonLink
                  href={routes.login}
                  size="lg"
                  className="h-12 rounded-xl border border-white/25 bg-white/5 px-6 text-base text-white hover:bg-white/15"
                >
                  Log in to my account
                </ButtonLink>
              </div>

              <p className="mt-7 flex items-start gap-2 text-xs leading-5 text-brand-200/85">
                <ShieldCheck className="mt-px size-4 shrink-0 text-gold-400" />
                The QR code carries a random token only — no identity number, facility or staff
                record is written into the code.
              </p>
            </div>

            {/* Illustrative staff account */}
            <div className="overflow-hidden rounded-2xl bg-surface shadow-overlay">
              <div className="flex items-center justify-between gap-3 border-b border-border-subtle bg-surface-muted px-5 py-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                  Staff transport account
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-[11px] font-semibold text-success-700">
                  <span className="size-1.5 rounded-full bg-success-500" />
                  Active
                </span>
              </div>

              <div className="flex items-center gap-5 px-5 py-5">
                <div className="grid size-28 shrink-0 place-items-center rounded-xl border border-border-subtle bg-white">
                  <QrCode className="size-20 text-ink-900" strokeWidth={1.1} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900">Aminata Sesay</p>
                  <p className="mt-0.5 text-xs text-foreground-muted">
                    Community Health Officer · Connaught Hospital
                  </p>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                    Wallet balance
                  </p>
                  <p
                    className="font-display text-3xl font-semibold tracking-tight text-brand-800"
                    data-numeric
                  >
                    {formatCurrency(48.5)}
                  </p>
                </div>
              </div>

              <div className="border-t border-border-subtle bg-surface-muted px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                  What a conductor scan resolves
                </p>
                <dl className="mt-2.5 space-y-2">
                  {[
                    { label: "Secure QR token", value: "No personal data" },
                    { label: "Account status", value: "Active staff" },
                    { label: "Route FT-01 · Lumley — Connaught", value: formatCurrency(4) },
                    { label: "Balance after trip", value: formatCurrency(44.5) },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3.5 py-2.5"
                    >
                      <dt className="truncate text-sm text-ink-600">{row.label}</dt>
                      <dd className="shrink-0 text-sm font-semibold text-ink-900" data-numeric>
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* Network statistics band */}
        <section className="border-y border-white/10 bg-brand-950">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <dl className="grid grid-cols-2 divide-white/10 sm:grid-cols-3 sm:divide-x lg:grid-cols-6">
              {networkStats.map((stat) => (
                <div key={stat.label} className="px-4 py-7 text-center">
                  <dt
                    className="font-display text-2xl font-semibold tracking-tight text-gold-400 sm:text-[1.75rem]"
                    data-numeric
                  >
                    {stat.value}
                  </dt>
                  <dd className="mt-1.5 text-[11px] font-medium uppercase leading-4 tracking-[0.1em] text-brand-200">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Official notice */}
        <section className="border-b border-border-subtle bg-gold-50">
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
            <p className="flex items-start gap-3 border-l-4 border-gold-500 pl-4 text-sm leading-6 text-ink-700">
              <Info className="mt-0.5 size-4 shrink-0 text-gold-600" />
              <span>
                <strong className="font-semibold text-ink-900">Notice.</strong> This service is
                available to {appConfig.ministry} staff only. All fares are approved and
                published by the ministry, and conductors cannot alter the amount charged for a
                journey.
              </span>
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-24 py-16 lg:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <SectionHeading eyebrow="The service" title="How the QR transport system works">
              Your QR code is an identifier, not a ticket. Each scan asks ministry systems to
              resolve the token, confirm your staff account is active, check your balance, and
              deduct the approved fare for that route.
            </SectionHeading>

            <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((item, index) => (
                <li
                  key={item.title}
                  className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-raised"
                >
                  <span className="absolute inset-x-0 top-0 h-1 bg-brand-600 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <item.icon className="size-5" />
                    </span>
                    <span
                      className="font-display text-2xl font-semibold text-ink-200"
                      data-numeric
                      aria-hidden
                    >
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-ink-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-600">{item.body}</p>
                </li>
              ))}
            </ol>

            <div
              id="conductor"
              className="mt-6 flex items-start gap-4 rounded-2xl border border-brand-100 bg-brand-50 p-6"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-700 text-white">
                <Smartphone className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ink-900">
                  Conductors use the official ministry mobile application
                </h3>
                <p className="mt-1.5 max-w-3xl text-sm leading-6 text-ink-600">
                  Scanning, validation and fare deduction are handled by the same systems that
                  power this portal, so your balance and trip history stay accurate at all
                  times.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Register */}
        <section
          id="register"
          className="scroll-mt-24 border-y border-border-subtle bg-surface py-16 lg:py-20"
        >
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-start">
            <div>
              <SectionHeading eyebrow="Getting started" title="How to register">
                Enrolment takes a few minutes. You can enrol online with your staff number, or
                through the transport office at your duty facility.
              </SectionHeading>

              <div className="mt-8 rounded-2xl border border-border-subtle bg-surface-muted p-6">
                <h3 className="text-sm font-semibold text-ink-900">What you will need</h3>
                <ul className="mt-4 space-y-3 text-sm text-ink-600">
                  {[
                    "Your ministry staff number",
                    "Your National Identification Number",
                    "Your duty facility and posting details",
                    "A phone number registered in your name",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <ButtonLink
                href={routes.register}
                size="lg"
                className="mt-8 h-12 rounded-xl px-6 text-base shadow-raised"
                trailingIcon={<ArrowRight className="size-4" />}
              >
                Start enrolment
              </ButtonLink>
            </div>

            <ol className="space-y-4">
              {registrationSteps.map((item) => (
                <li
                  key={item.step}
                  className="flex gap-5 rounded-2xl border border-border-subtle bg-surface p-6 shadow-card"
                >
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-700 font-display text-base font-semibold text-white"
                    data-numeric
                    aria-hidden
                  >
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-ink-900">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-ink-600">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Recharge */}
        <section id="recharge" className="scroll-mt-24 py-16 lg:py-20">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-start">
            <div>
              <SectionHeading eyebrow="Topping up" title="How to recharge">
                Top up your wallet from the staff portal in three steps: choose an amount,
                select a payment channel, then confirm. Your new balance is available for your
                next trip straight away.
              </SectionHeading>

              <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                Preset amounts
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {presetAmounts.map((amount) => (
                  <span
                    key={amount}
                    className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm font-semibold text-ink-800"
                    data-numeric
                  >
                    {formatCurrency(amount, { whole: true })}
                  </span>
                ))}
                <span className="rounded-xl border border-dashed border-border-strong px-4 py-2.5 text-sm font-medium text-ink-600">
                  Custom amount
                </span>
              </div>

              <p className="mt-7 flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm leading-6 text-brand-900">
                <QrCode className="mt-0.5 size-4 shrink-0" />
                Recharging never changes your QR code. The same code keeps working for the life
                of your account.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {rechargeChannels.map((channel) => (
                <div
                  key={channel.label}
                  className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-raised"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <channel.icon className="size-5" />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-ink-900">{channel.label}</p>
                  <p className="mt-1 text-xs leading-5 text-foreground-muted">{channel.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Published fares */}
        <section
          id="fares"
          className="scroll-mt-24 border-y border-border-subtle bg-surface py-16 lg:py-20"
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <SectionHeading eyebrow="Fare schedule" title="Approved staff fares">
              A selection of published fares on the network. Rates are maintained centrally and
              applied automatically when your code is scanned.
            </SectionHeading>

            <div className="mt-10 overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[38rem] text-sm">
                  <caption className="sr-only">Approved staff fares by route, in Leones</caption>
                  <thead>
                    <tr className="bg-brand-900 text-left text-white">
                      <th
                        scope="col"
                        className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em]"
                      >
                        Route code
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em]"
                      >
                        Route
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em]"
                      >
                        Distance
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.12em]"
                      >
                        Staff fare
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {publishedFares.map((row) => (
                      <tr key={row.code} className="transition-colors hover:bg-brand-50/60">
                        <td className="px-5 py-4 font-mono text-[13px] text-ink-500">
                          {row.code}
                        </td>
                        <td className="px-5 py-4 font-medium text-ink-900">{row.route}</td>
                        <td className="px-5 py-4 text-ink-600">{row.distance}</td>
                        <td className="px-5 py-4 text-right font-semibold text-ink-900">
                          {formatCurrency(row.fare)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-4 text-xs text-foreground-muted">
              Fares shown are illustrative pending publication of the current schedule.
            </p>
          </div>
        </section>

        {/* Call to action */}
        <section className="bg-ministry-gradient">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">
                  Ready to travel cashless?
                </h2>
                <span className="mt-4 block h-1 w-14 rounded-full bg-gold-500" />
                <p className="mt-5 text-base leading-7 text-brand-100">
                  Enrol for a staff transport account today, or sign in to check your balance,
                  view your QR code and review your trip history.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink
                  href={routes.register}
                  size="lg"
                  className="h-12 rounded-xl bg-gold-500 px-6 text-base font-semibold text-brand-950 hover:bg-gold-400 active:bg-gold-600"
                  trailingIcon={<ArrowRight className="size-4" />}
                >
                  Register
                </ButtonLink>
                <ButtonLink
                  href={routes.login}
                  size="lg"
                  className="h-12 rounded-xl border border-white/25 bg-white/5 px-6 text-base text-white hover:bg-white/15"
                >
                  Login
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
