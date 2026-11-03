import type { Metadata } from "next";
import Link from "next/link";
import { Facility } from "@/components/Facility";

export const metadata: Metadata = { title: "Product builder & founder", description: "Enter Facility JV-01 to explore Julian Vasquez's product work and mission dossiers.", alternates: { canonical: "/" }, openGraph: { url: "/" } };
export default function HomePage() { return <><Facility/><section className="home-after"><div><span className="eyebrow">MISSION ACCESS</span><h2>Choose your route.</h2><p>Go directly to the work, or take the corridor.</p></div><div className="access-links"><Link href="/work">Browse all products <span>01</span></Link><Link href="/about">About Julian <span>02</span></Link><Link href="/lab">Research lab <span>03</span></Link><Link href="/contact">Contact <span>04</span></Link></div></section></>; }
