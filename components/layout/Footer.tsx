import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";
import SocialIcon from "@/components/ui/SocialIcon";
import { footerLinks, footerContact, socialLinks } from "@/data/footer";
import VerticalLines from "../ui/VerticalLines";

const accreditationBadges = [
  {
    src: "/images/badge-advance-he.png",
    alt: "Advance HE Affiliate Member",
    width: 116,
    height: 56,
  },
  {
    src: "/images/badge-accreditation-1.png",
    alt: "QAA Member 2024-25",
    width: 50,
    height: 56,
  },
  {
    src: "/images/badge-accreditation-2.png",
    alt: "Cyber Essentials Certified",
    width: 50,
    height: 56,
  },
];

/**
 * Shared site footer. Rendered once in the root layout so no page
 * duplicates footer markup.
 */
export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-deep">
      <VerticalLines>
        <Container className="py-14 sm:py-16">
          <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
            <div className="flex flex-col gap-8">
              <ul className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text transition-colors hover:border-plum hover:text-plum"
                    >
                      <SocialIcon label={social.label} />
                    </a>
                  </li>
                ))}
              </ul>

              <nav aria-label="Footer">
                <ul className="grid grid-cols-2 gap-x-12 gap-y-4 sm:grid-cols-4">
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

            <div className="flex flex-col gap-6 lg:items-start">
              <div className="lg:text-left">
                <a
                  href={`mailto:${footerContact.email}`}
                  className="text-lg font-semibold text-text transition-colors hover:text-plum sm:text-xl"
                >
                  {footerContact.email}
                </a>
                <a
                  href={`tel:${footerContact.phone.replace(/\s/g, "")}`}
                  className="mt-1 block text-default text-text transition-colors hover:text-plum"
                >
                  {footerContact.phone}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-border/60 pt-6 text-meta text-text sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Victoria College of Arts and Design.
            </p>
            <p>All rights reserved.</p>
          </div>
        </Container>
      </VerticalLines>
    </footer>
  );
}
