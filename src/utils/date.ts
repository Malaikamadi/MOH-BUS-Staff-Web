import { appConfig } from "@/config/app";

/**
 * All formatters pin the timezone to UTC so server-rendered and
 * client-rendered output always match (no hydration drift).
 */
const TZ = "UTC";
const { locale } = appConfig.money;

const dateFormatter = new Intl.DateTimeFormat(locale, {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: TZ,
});

const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TZ,
});

const timeFormatter = new Intl.DateTimeFormat(locale, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TZ,
});

const monthFormatter = new Intl.DateTimeFormat(locale, {
  month: "short",
  year: "numeric",
  timeZone: TZ,
});

const weekdayFormatter = new Intl.DateTimeFormat(locale, {
  weekday: "short",
  day: "2-digit",
  timeZone: TZ,
});

export function formatDate(value: string | Date) {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | Date) {
  return dateTimeFormatter.format(new Date(value)).replace(",", " ·");
}

export function formatTime(value: string | Date) {
  return timeFormatter.format(new Date(value));
}

export function formatMonth(value: string | Date) {
  return monthFormatter.format(new Date(value));
}

export function formatShortDay(value: string | Date) {
  return weekdayFormatter.format(new Date(value));
}

/** `2026-09-03` — the wire format used for date range filters. */
export function toDateInputValue(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function startOfDay(value: Date) {
  const copy = new Date(value);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

export function addDays(value: Date, days: number) {
  const copy = new Date(value);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

export function daysAgo(days: number) {
  return addDays(startOfDay(new Date()), -days);
}

/** Relative label such as `4 min ago`, used only in client components. */
export function formatRelative(value: string | Date) {
  const target = new Date(value).getTime();
  const diffMs = Date.now() - target;
  const minutes = Math.round(diffMs / 60000);

  if (Math.abs(minutes) < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  return formatDate(value);
}

export function isWithinRange(value: string, from?: string, to?: string) {
  const day = value.slice(0, 10);
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

export const dateRangePresets = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "Last 12 months", days: 365 },
] as const;
