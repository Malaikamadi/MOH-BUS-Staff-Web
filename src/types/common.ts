/** Shared primitives used across every domain model. */

export type ID = string;

/** ISO-8601 timestamp string, always produced by the backend. */
export type ISODateString = string;

export type AccountStatus = "active" | "suspended" | "pending" | "closed";

export type EntityStatus = "active" | "inactive";

/** Visual intent used by badges, banners and status dots. */
export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral" | "brand";

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
  description?: string;
}
