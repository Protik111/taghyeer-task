import { cn } from "@/lib/cn";
import { getAvatarTone, getInitials } from "@/lib/format";

interface AvatarProps {
  name: string;
  id: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
} as const;

/** There are no profile photos in the API — every avatar is initials on
 * a deterministic color, keyed off the user/group id so it's stable. */
export default function Avatar({ name, id, size = "md", className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        SIZES[size],
        getAvatarTone(id),
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
