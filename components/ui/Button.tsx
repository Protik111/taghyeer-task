import Link from "next/link";
import { cn } from "@/lib/cn";

interface BaseButtonProps {
  children: React.ReactNode;
  /** Trailing arrow-in-circle icon, filled solid or outlined. Ignored (always a plain arrow) when variant="solid". */
  arrow?: "filled" | "outline" | "none";
  /** "outline" = pink border, circular arrow (default CTA style). "solid" = filled navy pill with a plain arrow (header "Apply Now" style). */
  variant?: "outline" | "solid";
  className?: string;
}

type ButtonAsLink = BaseButtonProps & {
  href: string;
  onClick?: never;
  type?: never;
};

type ButtonAsButton = BaseButtonProps & {
  href?: undefined;
  onClick?: () => void;
  type?: "button" | "submit";
};

type ButtonProps = ButtonAsLink | ButtonAsButton;

const VARIANT_STYLES = {
  outline:
    "gap-8 border border-[#EBECF3] bg-[#912491] px-6 py-3.5 hover:border-pink",
  solid: "gap-8 border border-[#EBECF3] bg-navy px-6 py-3.5 hover:border-pink",
} as const;

const baseStyles =
  "group inline-flex items-center text-default font-medium text-white transition-colors";

function ArrowIcon({ variant }: { variant: "filled" | "outline" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5",
        variant === "filled"
          ? "bg-gradient-to-br from-magenta to-plum text-white"
          : "border border-plum text-plum",
      )}
    >
      <svg
        width="22"
        height="18"
        viewBox="0 0 22 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12.3611 17.1284C12.3774 17.1436 12.8771 17.2702 13.4716 17.4065C14.0662 17.5429 14.5582 17.6335 14.5669 17.6084C14.617 17.3036 14.6624 16.9981 14.7033 16.692C14.8385 15.7298 15.1647 14.6073 15.5149 13.9047C16.6047 11.7164 18.5585 10.2676 20.9302 9.89018L21.5334 9.79527L21.5334 7.86109L20.9869 7.76946C17.4011 7.16836 15.0633 4.48691 14.6269 0.475636C14.5985 0.213818 14.5647 -3.04613e-07 14.5505 -3.05233e-07C14.4305 -3.10478e-07 12.4265 0.482181 12.3884 0.520363C12.3611 0.548727 12.3818 0.79309 12.4342 1.06582C13.0134 4.08218 14.6738 6.53673 16.8284 7.56436L17.3444 7.81091L6.7189 7.82945L-6.06481e-06 7.84145L-6.15035e-06 9.79855L6.73636 9.81055L17.3367 9.83018L16.6844 10.1607C14.9924 11.0182 13.6516 12.7004 12.8629 14.9575C12.6382 15.6011 12.2989 17.0662 12.3611 17.1284Z"
          fill="#EBECF3"
        />
      </svg>
    </span>
  );
}

function PlainArrow() {
  return (
    <svg
      width="22"
      height="18"
      viewBox="0 0 22 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.3611 17.1284C12.3774 17.1436 12.8771 17.2702 13.4716 17.4065C14.0662 17.5429 14.5582 17.6335 14.5669 17.6084C14.617 17.3036 14.6624 16.9981 14.7033 16.692C14.8385 15.7298 15.1647 14.6073 15.5149 13.9047C16.6047 11.7164 18.5585 10.2676 20.9302 9.89018L21.5334 9.79527L21.5334 7.86109L20.9869 7.76946C17.4011 7.16836 15.0633 4.48691 14.6269 0.475636C14.5985 0.213818 14.5647 -3.04613e-07 14.5505 -3.05233e-07C14.4305 -3.10478e-07 12.4265 0.482181 12.3884 0.520363C12.3611 0.548727 12.3818 0.79309 12.4342 1.06582C13.0134 4.08218 14.6738 6.53673 16.8284 7.56436L17.3444 7.81091L6.7189 7.82945L-6.06481e-06 7.84145L-6.15035e-06 9.79855L6.73636 9.81055L17.3367 9.83018L16.6844 10.1607C14.9924 11.0182 13.6516 12.7004 12.8629 14.9575C12.6382 15.6011 12.2989 17.0662 12.3611 17.1284Z"
        fill="#EBECF3"
      />
    </svg>
  );
}

/**
 * Shared pill CTA button, used for every primary call-to-action across
 * the site (Explore Courses, View Courses, Read Article, Apply Now, ...).
 */
export default function Button({
  children,
  arrow = "outline",
  variant = "outline",
  className,
  href,
  onClick,
  type = "button",
}: ButtonProps) {
  const content = (
    <>
      <span>{children}</span>
      {variant === "solid" ? (
        <PlainArrow />
      ) : (
        arrow !== "none" && <PlainArrow />
      )}
    </>
  );

  const classes = cn(baseStyles, VARIANT_STYLES[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
