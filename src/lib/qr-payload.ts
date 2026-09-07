import { appConfig } from "@/config/app";

const PREFIX = `${appConfig.qr.prefix}.`;

/**
 * Encode the opaque account token for display in a QR code.
 * The Flutter scanner must send this string (or the raw `qrt_` token) to
 * `POST /api/v1/scan`. Identity numbers and balances are never encoded.
 */
export function encodeQrPayload(secureToken: string) {
  const token = secureToken.trim();
  if (token.startsWith(PREFIX)) return token;
  return `${PREFIX}${token}`;
}

/**
 * Accepts the prefixed payload, a raw `qrt_` token, or extra scanner whitespace.
 * Returns null when the value is not a ministry transport QR.
 */
export function decodeQrPayload(raw: string) {
  const value = raw.trim();
  if (!value) return null;

  if (value.startsWith(PREFIX)) {
    const token = value.slice(PREFIX.length).trim();
    return token.startsWith("qrt_") ? token : null;
  }

  if (value.startsWith("qrt_")) return value;
  return null;
}
