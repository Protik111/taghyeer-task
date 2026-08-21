export interface FooterLink {
  label: string;
  href: string;
}

export const footerLinks: FooterLink[] = [
  { label: "About VCAD", href: "/about" },
  { label: "Our Story", href: "/about/our-story" },
  { label: "Campuses", href: "/campuses" },
  { label: "Policies", href: "/policies" },
  { label: "Career", href: "/careers" },
  { label: "Our Partners", href: "/partners" },
  { label: "Cookies Policy", href: "/policies/cookies" },
  { label: "FAQs", href: "/faqs" },
];

export const footerContact = {
  email: "enquiry_office@vcad.co.uk",
  phone: "020 3278 9857",
};

export interface SocialLink {
  label: string;
  href: string;
}

export const socialLinks: SocialLink[] = [
  { label: "Facebook", href: "https://facebook.com" },
  { label: "X (Twitter)", href: "https://x.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "Instagram", href: "https://instagram.com" },
  { label: "YouTube", href: "https://youtube.com" },
  { label: "TikTok", href: "https://tiktok.com" },
];
