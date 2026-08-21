"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { homeNav, primaryNav } from "@/data/navigation";

/**
 * Desktop primary nav. A client component only so the current route
 * can be highlighted — the rest of the header stays server-rendered.
 * The homepage uses a simpler nav set than the rest of the site.
 */
export default function NavLinks() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const links = isHome ? homeNav : primaryNav;

  return (
    <nav aria-label="Primary" className="hidden lg:block">
      <ul className="flex items-center gap-9">
        {links.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1 text-default font-medium uppercase tracking-[0.06em] transition-colors hover:text-plum",
                  isActive ? "text-white" : "text-text",
                )}
              >
                {!isHome && (
                  <span aria-hidden="true" className="text-plum">
                    /
                  </span>
                )}
                {link.label}
                {link.hasSubmenu && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="m2.5 3.5 2.5 3 2.5-3"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
