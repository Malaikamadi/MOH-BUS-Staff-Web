import Image from "next/image";

import { cn } from "@/utils/cn";
import { appConfig } from "@/config/app";

interface LogoProps {
  className?: string;
  /** Hide the wordmark, e.g. in a collapsed sidebar. */
  markOnly?: boolean;
  tone?: "default" | "inverted";
  /** `masthead` shows the ministry above the country, as on the ministry site. */
  variant?: "compact" | "masthead";
}

export function Logo({ className, markOnly, tone = "default", variant = "compact" }: LogoProps) {
  const inverted = tone === "inverted";
  const size = variant === "masthead" ? 44 : 36;

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src="/moh-seal.png"
        alt=""
        width={size}
        height={size}
        priority
        className="shrink-0 rounded-full"
      />

      {!markOnly && (
        <span className="flex flex-col justify-center leading-tight">
          {variant === "masthead" ? (
            <>
              <span
                className={cn(
                  "font-display text-[15px] font-semibold tracking-tight sm:text-base",
                  inverted ? "text-white" : "text-ink-900",
                )}
              >
                {appConfig.ministry}
              </span>
              <span
                className={cn(
                  "mt-0.5 text-[11px] font-medium",
                  inverted ? "text-brand-100/85" : "text-foreground-muted",
                )}
              >
                {appConfig.country}
              </span>
            </>
          ) : (
            <>
              <span
                className={cn(
                  "font-display text-[15px] font-semibold tracking-tight",
                  inverted ? "text-white" : "text-ink-900",
                )}
              >
                {appConfig.name}
              </span>
              <span
                className={cn(
                  "mt-0.5 text-[11px] font-medium",
                  inverted ? "text-brand-100/85" : "text-foreground-muted",
                )}
              >
                {appConfig.ministry}
              </span>
            </>
          )}
        </span>
      )}
    </span>
  );
}
