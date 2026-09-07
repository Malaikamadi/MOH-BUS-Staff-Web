/**
 * Central application configuration.
 *
 * Every value that differs between environments is read from a
 * `NEXT_PUBLIC_*` environment variable so that no backend detail is baked
 * into the UI. Never place secrets here — this file is bundled to the client.
 */

const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "/api/v1",
  apiTimeoutMs: Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 15000),
  useMockApi: process.env.NEXT_PUBLIC_USE_MOCK_API,
  showDemoAccounts: process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS,
  currency: process.env.NEXT_PUBLIC_CURRENCY ?? "SLE",
  currencySymbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? "Le",
  locale: process.env.NEXT_PUBLIC_LOCALE ?? "en-SL",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@health.gov.sl",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "+232 76 000 000",
};

/**
 * Mock mode is opt-in. With a local Postgres database the web app and the
 * conductor app share `/api/v1` by default.
 */
const useMockApi = env.useMockApi === "true";

export const appConfig = {
  name: "Transit Wallet",
  shortName: "Transit Wallet",
  /** Owning institution — appears in the masthead and official notices. */
  ministry: "Ministry of Health",
  government: "Government of Sierra Leone",
  country: "Sierra Leone",
  fullName: "Ministry of Health, Republic of Sierra Leone",
  tagline: "Staff bus QR ticketing and rechargeable transport wallet",
  api: {
    baseUrl: env.apiUrl.replace(/\/$/, ""),
    timeoutMs: env.apiTimeoutMs,
    useMock: useMockApi,
    showDemoAccounts: env.showDemoAccounts !== "false",
  },
  money: {
    currency: env.currency,
    symbol: env.currencySymbol,
    locale: env.locale,
  },
  support: {
    email: env.supportEmail,
    phone: env.supportPhone,
    address: "4th & 5th Floor, Youyi Building, Freetown",
  },
  social: [
    { label: "Facebook", href: "https://facebook.com", icon: "facebook" },
    { label: "X", href: "https://x.com", icon: "x" },
    { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
    { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
    { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
  ],
  /** Wallet balance (in Leones) at or below which an account is flagged as low. */
  lowBalanceThreshold: 20,
  /**
   * QR payload contract shared with the Flutter conductor app.
   * The code encodes `{prefix}.{secureToken}` — never identity or balance.
   */
  qr: {
    prefix: "MOHSL1",
  },
  table: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
  session: {
    storageKey: "transitpay.session",
    /** Readable by `proxy.ts` for optimistic route protection. */
    cookieName: "transitpay_session",
    /** Inactivity window before the client treats a session as expired. */
    idleTimeoutMs: 30 * 60 * 1000,
  },
} as const;

export type AppConfig = typeof appConfig;
