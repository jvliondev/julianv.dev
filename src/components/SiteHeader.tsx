"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [["/work", "Work"], ["/lab", "Lab"], ["/about", "About"], ["/contact", "Contact"]];
export function SiteHeader() {
  const pathname = usePathname(); const [open, setOpen] = useState(false);
  const handleHomeClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    if (pathname !== "/" || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.history.replaceState(window.history.state, "", "/");
    window.dispatchEvent(new Event("jv:home-navigation"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return <header className={`site-header ${pathname === "/" ? "site-header-home" : ""}`}>
    <Link className="brand" href="/" aria-label="JulianV.dev home" onClick={handleHomeClick}><span className="brand-mark" aria-hidden="true"><i/><i/></span><span className="brand-copy"><b>julianv.dev</b><small>FACILITY JV-01</small></span></Link>
    <div className="header-profile"><strong>Julian Vasquez</strong><span>Product Builder / Software Engineer / Entrepreneur</span></div>
    <button className="nav-toggle" aria-expanded={open} aria-controls="site-nav" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>Menu</button>
    <nav id="site-nav" aria-label="Primary" data-open={open}>
      {links.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href || (href === "/work" && pathname.startsWith("/work/")) ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
    </nav>
    <span className="system-ready"><i /><span>Facility Online</span></span>
  </header>;
}
