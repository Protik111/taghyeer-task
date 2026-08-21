export interface NavLink {
  label: string;
  href: string;
  /** Has a submenu affordance in the design (chevron), even though no
   * submenu content was specified — rendered as a plain link so the
   * chevron never implies an interaction that doesn't exist. */
  hasSubmenu?: boolean;
}

/** Nav shown on every page except the homepage, alongside the "Apply Now" CTA. */
export const primaryNav: NavLink[] = [
  { label: "About VCAD", href: "/about", hasSubmenu: true },
  { label: "Courses", href: "/courses" },
  { label: "Campuses", href: "/campuses" },
  { label: "VCAD Life", href: "/vcad-life", hasSubmenu: true },
];

/** Homepage-only nav — simpler set, no "Apply Now" CTA. */
export const homeNav: NavLink[] = [
  { label: "About VCAD", href: "/about" },
  { label: "Courses", href: "/courses" },
  { label: "Contact Us", href: "/contact" },
];
