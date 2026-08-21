import { cn } from "@/lib/cn";

/**
 * Small pink uppercase eyebrow used above every homepage section
 * heading ("OUR COURSES", "OUR CAMPUSES", "STORIES", ...).
 */
export default function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-bold uppercase tracking-[0.16em] text-magenta-light text-[22px] sm:text-[24px]",
        className,
      )}
    >
      {children}
    </p>
  );
}
