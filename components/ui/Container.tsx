import { cn } from "@/lib/cn";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Centers content within the 1440px reference frame with consistent,
 * responsive side padding. Used by every homepage section.
 */
export default function Container({
  children,
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-16 xl:px-24",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
