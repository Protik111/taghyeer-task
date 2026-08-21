import { cn } from "@/lib/cn";
import SectionLabel from "./SectionLabel";

interface SectionHeadingProps {
  label: string;
  title: string;
  /** Optional paragraph or CTA rendered alongside the heading. */
  aside?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

/**
 * The recurring "label + heading (+ trailing paragraph/CTA)" header
 * pattern shared by every homepage content section.
 */
export default function SectionHeading({
  label,
  title,
  aside,
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-6 lg:flex-row lg:items-end",
        className,
      )}
    >
      <div>
        <SectionLabel>{label}</SectionLabel>
        <h2
          className={cn(
            "mt-3 text-3xl font-bold text-white sm:text-4xl lg:text-section",
            titleClassName,
          )}
        >
          {title}
        </h2>
      </div>
      {aside && <div className="lg:max-w-sm">{aside}</div>}
    </div>
  );
}
