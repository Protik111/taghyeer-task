import Link from "next/link";
import LogoMark from "./LogoMark";

/**
 * Header/footer wordmark: the mark plus the "Loopin" name. (The original
 * scaffold's version pointed at a `/images/Group.png` that doesn't exist
 * in this project — replaced with a plain text wordmark instead of
 * carrying the broken asset forward.)
 */
export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 rounded-chip focus-visible:outline-offset-4"
      aria-label="Loopin, go to homepage"
    >
      <LogoMark />
      <span className="text-xl font-bold tracking-tight text-white">Loopin</span>
    </Link>
  );
}
