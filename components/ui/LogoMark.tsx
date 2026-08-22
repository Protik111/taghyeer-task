interface LogoMarkProps {
  size?: number;
  className?: string;
}

/**
 * The product mark: two overlapping speech-bubble shapes in the site's
 * accent palette — a small original mark rather than a literal chat
 * bubble icon, built from the same tokens as the rest of the UI.
 */
export default function LogoMark({ size, className }: LogoMarkProps) {
  return (
    <svg
      width={size ?? 36}
      height={size ?? 36}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect width="36" height="36" rx="10" fill="#061665" />
      <path
        d="M8 12.5C8 10.567 9.567 9 11.5 9H20.5C22.433 9 24 10.567 24 12.5V16.5C24 18.433 22.433 20 20.5 20H14L9.5 23V20H11.5C9.567 20 8 18.433 8 16.5V12.5Z"
        fill="#00FFD2"
      />
      <path
        d="M15 18.5C15 16.567 16.567 15 18.5 15H24.5C26.433 15 28 16.567 28 18.5V21.5C28 23.433 26.433 25 24.5 25H24V27.5L20.8 25H18.5C16.567 25 15 23.433 15 21.5V18.5Z"
        fill="#FF379E"
      />
    </svg>
  );
}
