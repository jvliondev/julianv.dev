import Link from "next/link";
export default function NotFound() { return <div className="content-page not-found"><span className="eyebrow">FACILITY JV-01 // ROUTE NOT FOUND</span><h1>This project isn’t on the map.</h1><p>The address may have changed, but the public work is still accessible.</p><Link className="primary button" href="/work">Browse Work</Link></div>; }
