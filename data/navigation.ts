export interface NavLink {
  label: string;
  href: string;
}

/** The marketing site is currently a single page, so both nav sets point
 * at in-page sections — kept as two exports (rather than folding into
 * one) so Header/NavLinks/MobileMenu don't need reshaping if more
 * marketing routes show up later. */
export const primaryNav: NavLink[] = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
];

export const homeNav: NavLink[] = primaryNav;
