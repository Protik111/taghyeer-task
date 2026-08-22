"use client";

import { usePathname } from "next/navigation";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import VerticalLines from "../ui/VerticalLines";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Shared site header. Rendered once in the root layout so no page
 * duplicates header markup. Hidden on /login and /chat — those are a
 * chrome-less, full-height app experience, not marketing pages.
 */
export default function Header() {
  const pathname = usePathname();
  const { status } = useAuth();

  if (pathname === "/login" || pathname.startsWith("/chat")) return null;

  return (
    <header className="relative z-50 bg-card-alt">
      <VerticalLines>
        <Container className="flex h-20 items-center justify-between gap-6 sm:h-24">
          <Logo />

          <div className="flex items-center gap-22">
            <NavLinks />

            <div className="flex items-center gap-4">
              <Button
                href={status === "authenticated" ? "/chat" : "/login"}
                variant="solid"
                className="hidden sm:inline-flex"
              >
                {status === "authenticated" ? "Open Chat" : "Log In"}
              </Button>
              <MobileMenu alwaysVisible />
            </div>
          </div>
        </Container>
      </VerticalLines>
    </header>
  );
}
