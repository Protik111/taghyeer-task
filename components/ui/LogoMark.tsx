interface LogoMarkProps {
  size?: number;
  className?: string;
}

/**
 * The VCAD mark — a navy rounded-square badge with an abstract
 * triangle/blob motif in the accent palette. Paths copied exactly
 * from the supplied `logo.svg` so it always matches the real brand
 * mark instead of an approximation.
 */
export default function LogoMark({ size, className }: LogoMarkProps) {
  return (
    <svg
      width={size ?? 42}
      height={size ?? 38}
      viewBox="0 0 50 50"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path d="M49.3125 0H0V49.3477H49.3125V0Z" fill="#061665" />
      <path
        d="M4.50696 6.23651L14.7575 22.801L25.0052 6.23651H4.50696Z"
        fill="#FF379E"
      />
      <path
        d="M4.5069 42.9053H25.0051L14.7574 26.3409L4.5069 42.9053Z"
        fill="#8EC8EE"
      />
      <path
        d="M36.1138 22.7983H44.353V6.23385H36.1138C25.2821 6.41955 25.2878 22.6126 36.1138 22.7983Z"
        fill="#00FFD2"
      />
      <path
        d="M36.6865 43.111H28.4473V26.5466H36.6865C47.5182 26.7323 47.5125 42.9253 36.6865 43.111Z"
        fill="#E018E0"
      />
    </svg>
  );
}
