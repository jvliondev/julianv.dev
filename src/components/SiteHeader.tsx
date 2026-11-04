"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [["/work", "Work"], ["/vault", "Vault"], ["/lab", "Lab"], ["/about", "About"], ["/contact", "Contact"]];
export function SiteHeader() {
  const pathname = usePathname(); const [open, setOpen] = useState(false);
  return <header className="site-header">
    <Link className="brand" href="/" aria-label="JulianV.dev home"><span className="brand-mark">JV</span><span>JULIANV.DEV<small>FACILITY JV-01</small></span></Link>
    <div className="header-profile"><strong>Julian Vasquez</strong><span>Product Builder / Software Engineer / Entrepreneur</span></div>
    <button className="nav-toggle" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen(!open)}>Menu</button>
    <nav id="site-nav" aria-label="Primary" data-open={open}>
      {links.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href || (href === "/work" && pathname.startsWith("/work/")) ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
    </nav>
    <span className="system-ready"><i /> FACILITY READY</span>
  </header>;
}
