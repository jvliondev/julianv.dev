import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import "./styles.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://julianv.dev"),
  title: { default: "Julian Vasquez — Product Builder", template: "%s · JulianV.dev" },
  description: "Explore Julian Vasquez's product work across AI creator discovery, machine communication, ownership tools, music, and interactive entertainment.",
  alternates: { canonical: "/" },
  openGraph: { title: "Julian Vasquez — Product Builder", description: "A product portfolio inside Facility JV-01.", url: "https://julianv.dev", siteName: "JulianV.dev", type: "website" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Link className="skip-link" href="#main">Skip to main content</Link><SiteHeader/><main id="main">{children}</main><Footer/></body></html>;
}
