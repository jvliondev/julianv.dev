import catalog from "../../machine/projects.json";

export type Project = {
  id: string; name: string; shortName: string; category: string; status: string;
  accent: string; summary: string; problem: string; audience: string; role: string;
  decisions: string[]; proof: string[]; limitations: string[]; motif: string;
  external?: { label: string; href: string };
};

export const projects = catalog.products as Project[];
export const getProject = (slug: string) => projects.find((project) => project.id === slug);
