import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Facility moved to the home page",
  description: "Facility JV-01 now lives on the JulianV.dev home page.",
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
  openGraph: { url: "/" },
};

export default function VaultPage() {
  return <div className="content-page text-page vault-page">
    <span className="eyebrow">FACILITY JV-01 // HOME EXPERIENCE</span>
    <h1>The facility is on the home page.</h1>
    <p>The interactive corridor and project chambers now live together on the main page. For a direct project index, browse Work.</p>
    <div className="hero-actions">
      <Link className="primary button" href="/">Enter the facility</Link>
      <Link className="button" href="/work">Browse projects</Link>
    </div>
  </div>;
}
