import Container from "./Container";

interface VerticalLinesProps {
  /**
   * "absolute" positions lines inside a relative parent component (section-level use).
   * "fixed" fixes lines across the entire viewport.
   * @default "absolute"
   */
  variant?: "absolute" | "fixed";
  /**
   * Additional Tailwind classes for the wrapper container.
   */
  className?: string;
  /**
   * Optional section children content. When provided, VerticalLines acts as a section wrapper.
   */
  children?: React.ReactNode;
}

/**
 * 5 vertical lines positioned across 4 equal columns in the main container frame.
 * Can be used as a standalone component OR as a section wrapper component around children.
 */
export default function VerticalLines({
  variant = "absolute",
  className = "",
  children,
}: VerticalLinesProps) {
  const positionClass = variant === "fixed" ? "fixed" : "absolute";

  // If used as a section wrapper around children:
  if (children) {
    return (
      <div className={`relative ${className}`}>
        <div
          className={`${positionClass} inset-0 pointer-events-none z-0 flex justify-center overflow-hidden`}
        >
          <Container className="relative h-full w-full">
            <div className="grid h-full w-full grid-cols-4 border-x border-white/10">
              <div className="border-r border-white/10" />
              <div className="border-r border-white/10" />
              <div className="border-r border-white/10" />
              <div className="border-r-0" />
            </div>
          </Container>
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  // Standalone component usage inside a relative parent:
  return (
    <div
      className={`${positionClass} inset-0 pointer-events-none z-0 flex justify-center overflow-hidden ${className}`}
    >
      <Container className="relative h-full w-full">
        <div className="grid h-full w-full grid-cols-4 border-x border-white/10">
          <div className="border-r border-white/10" />
          <div className="border-r border-white/10" />
          <div className="border-r border-white/10" />
          <div className="border-r-0" />
        </div>
      </Container>
    </div>
  );
}


