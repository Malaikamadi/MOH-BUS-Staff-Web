import { createHash } from "node:crypto";

/** Keep only digits so spacing or dashes typed at the desk still match. */
export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function maskNin(nin: string) {
  const digits = digitsOnly(nin);
  return `${"•".repeat(8)}${digits.slice(-4) || "0000"}`;
}

/**
 * One-way lookup key. The office desk searches by this hash; the QR code never
 * contains the NIN, and the API never returns the raw number.
 */
export function hashNin(nin: string) {
  const digits = digitsOnly(nin);
  if (digits.length < 8) return null;
  return createHash("sha256").update(`moh-nin:${digits}`).digest("hex");
}

/** Demo NINs derived from the ministry staff number, for local office-desk tests. */
export function demoNinForStaffNumber(staffNumber: string) {
  const staffDigits = digitsOnly(staffNumber).padStart(8, "0").slice(-8);
  return `9${staffDigits}`;
}
