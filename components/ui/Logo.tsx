import Link from "next/link";
import LogoMark from "./LogoMark";
import Image from "next/image";

/**
 * Header/footer wordmark: the diamond mark plus "Victoria College /
 * of Arts and Design" set in two lines, matching the Figma lockup.
 */
export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 rounded-chip focus-visible:outline-offset-4"
      aria-label="VCAD — Victoria College of Arts and Design, go to homepage"
    >
      <LogoMark />
      <Image
        src="/images/Group.png"
        alt=""
        width={75}
        height={50}
        sizes="(min-width: 1024px) 24vw, 40vw"
        className="object-cover"
      />
      {/* <span className="leading-tight">
        <span className="block text-[13px] font-bold tracking-tight text-white">
          Victoria
          <br />
          College
        </span>
        <span className="block text-[9px] font-medium uppercase tracking-[0.14em] text-sky">
          of Arts and Design
        </span>
      </span> */}
    </Link>
  );
}
