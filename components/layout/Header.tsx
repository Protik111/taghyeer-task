"use client";

import { usePathname } from "next/navigation";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import VerticalLines from "../ui/VerticalLines";

/**
 * Shared site header. Rendered once in the root layout so no page
 * duplicates header markup. The homepage has no "Apply Now" CTA and
 * always shows the menu button; other pages show it alongside the
 * fuller nav and hide it above the `lg` breakpoint.
 */
export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="relative z-50 bg-[#040D3D]">
      <VerticalLines>
        <Container className="flex h-20 items-center justify-between gap-6 sm:h-24">
          {/* <Logo /> */}

          <div className="flex items-center gap-22">
            <NavLinks />

            <div className="flex items-center gap-4">
              {!isHome && (
                <Button
                  href="/apply"
                  variant="solid"
                  className="hidden sm:inline-flex"
                >
                  Apply Now
                </Button>
              )}
              <MobileMenu alwaysVisible={isHome} />
            </div>
          </div>
        </Container>
      </VerticalLines>
    </header>
  );
}
