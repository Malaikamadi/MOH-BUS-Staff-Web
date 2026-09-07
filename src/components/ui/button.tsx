import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "subtle"
  | "danger"
  | "link";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors " +
  "disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-brand-500";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-xs",
  secondary:
    "bg-surface text-ink-800 border border-border-strong hover:bg-ink-50 active:bg-ink-100 shadow-xs",
  ghost: "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
  subtle: "bg-ink-100 text-ink-800 hover:bg-ink-200",
  danger: "bg-danger-500 text-white hover:bg-danger-700 shadow-xs",
  link: "text-brand-700 underline-offset-4 hover:underline",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-[15px]",
  icon: "h-9 w-9",
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

function classes({ variant = "primary", size = "md", fullWidth }: CommonProps, className?: string) {
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
}

export type ButtonProps = CommonProps & ComponentProps<"button">;

export function Button({
  variant,
  size,
  loading,
  fullWidth,
  leadingIcon,
  trailingIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={classes({ variant, size, fullWidth }, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : leadingIcon}
      {children}
      {!loading && trailingIcon}
    </button>
  );
}

export type ButtonLinkProps = CommonProps & ComponentProps<typeof Link>;

/** Anchor styled as a button, for navigation rather than actions. */
export function ButtonLink({
  variant,
  size,
  fullWidth,
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={classes({ variant, size, fullWidth }, className)} {...props}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </Link>
  );
}
