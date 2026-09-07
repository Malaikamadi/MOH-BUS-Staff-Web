import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";

import { Providers } from "@/components/providers";
import { appConfig } from "@/config/app";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/** Geometric display face used for headings, matching the ministry's web presence. */
const displaySans = Poppins({
  variable: "--font-display-sans",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${appConfig.name} — ${appConfig.ministry}, ${appConfig.country}`,
    template: `%s · ${appConfig.name}`,
  },
  description:
    "Official staff bus QR ticketing and rechargeable transport wallet of the Ministry of Health, Republic of Sierra Leone. Enrol, recharge your wallet and travel with one secure QR code.",
  applicationName: appConfig.name,
};

export const viewport: Viewport = {
  themeColor: "#0d5391",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-SL"
      className={`${geistSans.variable} ${geistMono.variable} ${displaySans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-canvas text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
