import { cn } from "@/lib/cn";

/**
 * Faint concentric-ring background decoration reused behind several
 * section headings across the site.
 */
export default function DecorativeRings({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 400"
      className={cn("pointer-events-none absolute text-border/50", className)}
    >
      <circle cx="200" cy="200" r="199" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="1" strokeDasharray="3 7" fill="none" />
    </svg>
  );
}
