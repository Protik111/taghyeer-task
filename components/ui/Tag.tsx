import { cn } from "@/lib/cn";

const TONES = {
  pink: "bg-[#FF379E] text-white",
  magenta: "bg-magenta text-white",
  navyCyan: "bg-navy text-cyan",
  navyWhite: "bg-navy text-white",
  outline: "bg-deep/40 text-cyan",
  sky: "bg-sky text-white",
  plum: "bg-[#061665] text-[#E018E0]",
  plumWhite: "bg-[#00FFD2] text-[#061665]",
} as const;

interface TagProps {
  children: React.ReactNode;
  tone: keyof typeof TONES;
  rotate?: number;
  className?: string;
}

/**
 * Small rotated discipline chip layered over the hero photo collage
 * ("FASHION", "PHOTOGRAPHY", "GRAPHIC DESIGN", ...). Every tone shares
 * the same pink border for a consistent accent across the collage.
 */
export default function Tag({
  children,
  tone,
  rotate = 0,
  className,
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap px-6 py-4 text-micro font-extrabold uppercase text-2xl tracking-[0.08em] shadow-lg",
        TONES[tone],
        className,
      )}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      {children}
    </span>
  );
}
