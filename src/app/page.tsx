import type { Metadata } from "next";
import { Facility } from "@/components/Facility";

export const metadata: Metadata = { title: "Product builder & founder", description: "Explore Julian Vasquez’s work through the interactive Facility JV-01 homepage or the Work index.", alternates: { canonical: "/" }, openGraph: { url: "/" } };
export default function HomePage() { return <Facility/>; }
