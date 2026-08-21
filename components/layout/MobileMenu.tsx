"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { homeNav, primaryNav } from "@/data/navigation";
import Button from "@/components/ui/Button";

interface MobileMenuProps {
  /** Homepage keeps the menu button visible at every breakpoint. */
  alwaysVisible?: boolean;
}

/**
 * Off-canvas navigation drawer, toggled by the header's menu button.
 * Owns its own open state and closes on route change, Escape, or
 * backdrop click so it never traps keyboard focus.
 */
export default function MobileMenu({ alwaysVisible = false }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const links = isHome ? homeNav : primaryNav;

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Open menu"
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center cursor-pointer rounded-full border border-border text-white transition-colors hover:border-plum",
          !alwaysVisible && "lg:hidden",
        )}
      >
        <svg
          width="18"
          height="14"
          viewBox="0 0 18 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 1h16M1 7h16M1 13h16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-50 flex justify-end"
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-deep/80 backdrop-blur-sm"
          />
          <div className="relative flex h-full w-full max-w-sm flex-col gap-8 overflow-y-auto border-l border-border bg-card px-8 py-8">
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border text-white transition-colors hover:border-plum"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="m2 2 12 12M14 2 2 14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav aria-label="Primary">
              <ul className="flex flex-col gap-6">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="text-2xl font-semibold text-white transition-colors hover:text-plum"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {!isHome && (
              <Button
                href="/apply"
                variant="solid"
                className="mt-auto justify-center"
              >
                Apply Now
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
