import type { StatusTone } from "@/types";
import { cn } from "@/utils/cn";
import { humanise } from "@/utils/format";

const tones: Record<StatusTone, string> = {
  success: "bg-success-50 text-success-700",
  warning: "bg-warning-50 text-warning-700",
  danger: "bg-danger-50 text-danger-700",
  info: "bg-info-50 text-info-700",
  brand: "bg-brand-50 text-brand-700",
  neutral: "bg-ink-100 text-ink-600",
};

const dots: Record<StatusTone, string> = {
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  info: "bg-info-500",
  brand: "bg-brand-500",
  neutral: "bg-ink-400",
};

export function toneFor(status: string): StatusTone {
  switch (status) {
    case "active":
    case "successful":
    case "completed":
    case "paid":
      return "success";
    case "pending":
    case "processing":
    case "in_progress":
    case "maintenance":
      return "warning";
    case "suspended":
    case "failed":
    case "cancelled":
    case "disabled":
    case "closed":
      return "danger";
    case "replaced":
    case "inactive":
    case "reversed":
      return "neutral";
    default:
      return "brand";
  }
}

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const tone = toneFor(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
        tones[tone],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dots[tone])} />
      {humanise(status)}
    </span>
  );
}
