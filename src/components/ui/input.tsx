import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/utils/cn";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn("mb-1.5 block text-[13px] font-medium text-ink-700", className)}
      {...props}
    />
  );
}

interface FieldProps extends ComponentProps<"input"> {
  label?: string;
  hint?: string;
  error?: string;
  leading?: ReactNode;
}

export function Input({ label, hint, error, leading, className, id, ...props }: FieldProps) {
  const inputId = id ?? props.name;
  return (
    <div className="w-full">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <div className="relative">
        {leading && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-400">
            {leading}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            "h-11 w-full rounded-lg border bg-surface px-3.5 text-sm text-ink-900 shadow-xs outline-none transition-colors",
            "placeholder:text-ink-400 focus:border-brand-500",
            leading && "pl-10",
            error ? "border-danger-500" : "border-border-strong",
            className,
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-danger-500">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-foreground-muted">{hint}</p>
      ) : null}
    </div>
  );
}

interface SelectProps extends ComponentProps<"select"> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className, id, children, ...props }: SelectProps) {
  const selectId = id ?? props.name;
  return (
    <div className="w-full">
      {label && <Label htmlFor={selectId}>{label}</Label>}
      <select
        id={selectId}
        className={cn(
          "h-11 w-full rounded-lg border bg-surface px-3.5 text-sm text-ink-900 shadow-xs outline-none",
          "focus:border-brand-500",
          error ? "border-danger-500" : "border-border-strong",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-xs text-danger-500">{error}</p>}
    </div>
  );
}
