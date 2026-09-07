import { appConfig } from "@/config/app";

const { locale, symbol } = appConfig.money;

/**
 * The Leone symbol is prefixed manually rather than via `style: "currency"`.
 * `Intl` renders the ISO code (`SLE 5.00`) for Leones in most runtimes, but
 * official ministry publications use `Le 5.00`.
 */
const decimalFormatter = new Intl.NumberFormat(locale, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const wholeFormatter = new Intl.NumberFormat(locale, {
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat(locale);

/**
 * Format a wallet amount in Leones, e.g. `Le 4,850.00`.
 * Pass `whole` for dense tiles and chart labels, `signed` to force a +/- prefix.
 */
export function formatCurrency(amount: number, options?: { whole?: boolean; signed?: boolean }) {
  const formatter = options?.whole ? wholeFormatter : decimalFormatter;
  const formatted = `${symbol} ${formatter.format(Math.abs(amount))}`;
  if (options?.signed) return `${amount < 0 ? "−" : "+"}${formatted}`;
  return amount < 0 ? `−${formatted}` : formatted;
}

/** Compact currency for chart axes and dense stat tiles, e.g. `Le 1.2M`. */
export function formatCompactCurrency(amount: number) {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "−" : "";
  if (abs >= 1_000_000_000) return `${sign}${symbol} ${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}${symbol} ${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${symbol} ${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}K`;
  return `${sign}${symbol} ${wholeFormatter.format(abs)}`;
}

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export function formatPercent(value: number, fractionDigits = 1) {
  return `${value > 0 ? "+" : ""}${value.toFixed(fractionDigits)}%`;
}

/** Turn `fare_deduction` or `bank_transfer` into `Fare deduction`. */
export function humanise(value: string) {
  const spaced = value.replace(/[_-]+/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Mask a phone number for display in shared/admin contexts. */
export function maskPhone(phone: string) {
  if (phone.length <= 4) return phone;
  return `${phone.slice(0, 4)}${"•".repeat(Math.max(phone.length - 7, 3))}${phone.slice(-3)}`;
}

/**
 * Never render a full identity number. The backend returns a masked value;
 * this is a defensive second layer for anything that slips through.
 */
export function maskIdentityNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "•••••••••••";
  return `${"•".repeat(Math.max(digits.length - 4, 4))}${digits.slice(-4)}`;
}

/** Shorten an opaque QR token so it can be shown without full disclosure. */
export function truncateToken(token: string, visible = 8) {
  if (token.length <= visible * 2) return token;
  return `${token.slice(0, visible)}…${token.slice(-4)}`;
}
