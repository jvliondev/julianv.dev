import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/data/projects";

export function generateStaticParams() { return projects.map(({ id }) => ({ slug: id })); }
export async function generateMetadata({ params }: { params: Promise<{slug: string}> }): Promise<Metadata> {
  const { slug } = await params; const project = getProject(slug);
  return project ? { title: `${project.name} dossier`, description: project.summary, alternates: { canonical: `/work/${project.id}` }, openGraph: { title: `${project.name} — Mission dossier`, description: project.summary, url: `/work/${project.id}`, type: "article" } } : { title: "Dossier unavailable" };
}
export default async function DossierPage({ params }: { params: Promise<{slug: string}> }) {
  const { slug } = await params; const p = getProject(slug); if (!p) notFound();
  const related = projects.filter((project) => project.id !== p.id).slice(0, 2);
  return <article className="dossier" style={{"--accent": p.accent} as React.CSSProperties}>
    <header className="dossier-hero"><div><Link className="back-link" href="/work">← All products</Link><span className="eyebrow">MISSION DOSSIER // {p.category.toUpperCase()}</span><h1>{p.name}</h1><p className="dossier-summary">{p.summary}</p><span className="status status-large">{p.status}</span>{p.external && <a className="primary button" href={p.external.href} target="_blank" rel="noreferrer">{p.external.label} <span aria-hidden>↗</span></a>}</div><div className={`dossier-art art-${p.motif}`} role="img" aria-label={`Illustrative concept visualization for ${p.name}`}><span className="art-label">CONCEPT VISUALIZATION</span><span className="art-core"/><i/><i/><i/><b>{p.shortName}</b></div></header>
    <div className="dossier-columns"><aside><span className="eyebrow">PROJECT RECORD</span><dl><dt>Stage</dt><dd>{p.status}</dd><dt>Category</dt><dd>{p.category}</dd><dt>Role</dt><dd>{p.role}</dd></dl></aside><div className="dossier-body">
      <section><span className="eyebrow">THE PROBLEM</span><h2>Why this exists</h2><p>{p.problem}</p><p><strong>For:</strong> {p.audience}</p></section>
      <section><span className="eyebrow">PRODUCT DIRECTION</span><h2>Key decisions</h2><ul>{p.decisions.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section><span className="eyebrow">WHAT CAN BE VERIFIED</span><h2>Evidence and limits</h2><ul>{p.proof.map((item) => <li key={item}>{item}</li>)}</ul><div className="limits"><strong>Current limits</strong><ul>{p.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div></section>
      <section className="role-detail"><span className="eyebrow">CONTRIBUTION</span><h2>Product leadership, with clear authorship</h2><p>My contribution is described at the product and systems level. Implementation has been AI-assisted where appropriate; I do not claim to have manually authored every line of code.</p><p>{p.role}</p></section>
    </div></div><nav className="related" aria-label="Other dossiers">{related.map((x) => <Link key={x.id} href={`/work/${x.id}`}><span className="eyebrow">NEXT DOSSIER</span><strong>{x.name}</strong><span>{x.category} →</span></Link>)}</nav>
  </article>;
}
