"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import { footerLinks } from "@/data/footer";
import VerticalLines from "../ui/VerticalLines";

/**
 * Shared site footer. Rendered once in the root layout so no page
 * duplicates footer markup. Hidden on /login and /chat, matching Header.
 */
export default function Footer() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname.startsWith("/chat")) return null;

  return (
    <footer className="border-t border-border/60 bg-deep">
      <VerticalLines>
        <Container className="py-14 sm:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4">
              <Logo />
              <p className="max-w-xs text-default text-pale-blue">
                A take-home project: real-time 1-to-1 and group messaging,
                built to demonstrate a production-shaped chat experience.
              </p>
            </div>

            <nav aria-label="Footer">
              <ul className="grid grid-cols-2 gap-x-12 gap-y-4 sm:flex sm:items-center">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-default font-medium uppercase tracking-[0.04em] text-text transition-colors hover:text-plum"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-border/60 pt-6 text-meta text-text sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Loopin. Built as a take-home assignment.</p>
          </div>
        </Container>
      </VerticalLines>
    </footer>
  );
}
