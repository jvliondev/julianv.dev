import type { Metadata } from "next";
import { Facility } from "@/components/Facility";

export const metadata: Metadata = { title: "Product builder & founder", description: "Enter Facility JV-01 to explore Julian Vasquez's product work and mission dossiers.", alternates: { canonical: "/" }, openGraph: { url: "/" } };
export default function HomePage() { return <Facility/>; }
