import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import VerticalLines from "@/components/ui/VerticalLines";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VCAD — Victoria College of Arts and Design",
    template: "%s | VCAD",
  },
  description:
    "Victoria College of Arts and Design (VCAD) is a creative college in London's Design District, offering courses in fashion, graphic design, media, business and marketing.",
  icons: {
    icon: "/images/logo.svg",
    shortcut: "/images/logo.svg",
    apple: "/images/logo.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="relative flex min-h-full flex-col bg-base font-sans text-text"
      >
        {/* <VerticalLines /> */}
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
