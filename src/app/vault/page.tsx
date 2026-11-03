import type { Metadata } from "next";
import { Facility } from "@/components/Facility";
export const metadata: Metadata = { title: "The facility", description: "Explore the interactive Facility JV-01 corridor and open project dossiers.", alternates: { canonical: "/vault" }, openGraph: { url: "/vault" } };
export default function VaultPage() { return <div className="vault-page"><div className="page-intro"><span className="eyebrow">FACILITY JV-01 // INTERACTIVE MAP</span><h1>Research corridor</h1><p>Choose a bay to reveal its mission dossier. Professional Mode keeps the same work in a fast, motion-free index.</p></div><Facility compact/></div>; }
