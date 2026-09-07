import type { ComponentProps } from "react";

import { cn } from "@/utils/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-2xl border border-border-subtle bg-surface shadow-card", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<"h2">) {
  return <h2 className={cn("font-display text-base font-semibold text-ink-900", className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-5", className)} {...props} />;
}
