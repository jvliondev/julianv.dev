import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Selected work",
  description: "Explore Julian Vasquez’s selected projects and research, with clear project status and details.",
  alternates: { canonical: "/work" },
  openGraph: { url: "/work" },
};

export default function WorkPage() {
  return <div className="content-page">
    <header className="page-intro">
      <span className="eyebrow">PORTFOLIO // PUBLIC INDEX</span>
      <h1>Selected work</h1>
      <p>Product ideas and systems at different stages, with clear notes on what is public, in development, or still research.</p>
    </header>
    <section className="work-grid" aria-label="Selected projects">
      {projects.map((project, index) => <article key={project.id} style={{ "--accent": project.accent } as React.CSSProperties}>
        <figure className="project-art" style={{ "--accent": project.accent, "--artwork-badge-y": `${project.artworkBadgeY}%` } as React.CSSProperties}>
          <Image src={project.artwork} alt={project.artworkAlt} fill sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw" loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"} unoptimized />
          <span className="art-claim-patch">{project.artworkBadge}</span>
          <figcaption><span>CONCEPT ART</span><strong>{project.artworkStatus}</strong></figcaption>
        </figure>
        <div className="project-copy">
          <span className="status">{project.status}</span><h2>{project.name}</h2>
          <p className="category">{project.category}</p><p>{project.summary}</p>
          <Link href={`/work/${project.id}`}>View project <span aria-hidden>→</span></Link>
        </div>
      </article>)}
    </section>
    <p className="role-note">My role varies by project and includes product vision, experience and system design, implementation direction, testing, and AI-assisted iteration where appropriate.</p>
  </div>;
}
