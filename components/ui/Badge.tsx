import { cn } from "@/lib/cn";

interface BadgeProps {
  children: React.ReactNode;
  /** "school" = pale outlined pill. "duration" = solid pink pill. */
  tone?: "school" | "duration";
  className?: string;
}

/**
 * Small pill used for a course's school and duration metadata on the
 * expanded course card (and, later, the course detail page).
 */
export default function Badge({
  children,
  tone = "school",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-badge px-3 py-1 text-meta font-semibold uppercase tracking-[0.04em]",
        tone === "school"
          ? "border border-border bg-navy/60 text-pale-blue"
          : "bg-plum text-white",
        className,
      )}
    >
      {children}
    </span>
  );
}
