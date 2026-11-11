import catalog from "../../machine/projects.json";
import assetManifest from "../../public/blacksite/manifest.json";

export type Project = {
  id: string; name: string; shortName: string; category: string; status: string;
  accent: string; summary: string; problem: string; audience: string; role: string;
  decisions: string[]; proof: string[]; limitations: string[]; motif: string;
  artwork: string; artworkAspect: number; artworkAlt: string; artworkStatus: string; artworkBadge: string; artworkBadgeY: number;
  snapshot?: { src: string; alt: string; label: string; kind: "public-site" | "dashboard-preview" };
  external?: { label: string; href: string };
};

const projectArt: Record<string, Pick<Project, "artwork" | "artworkAspect" | "artworkAlt" | "artworkStatus" | "artworkBadge" | "artworkBadgeY" | "snapshot">> = {
  xondry: { artwork: "/images/projects/xondry.webp", artworkAspect: .736, artworkAlt: "Concept illustration of a creator discovery portal with profile projections and a glowing network globe.", artworkStatus: "PUBLIC WEBSITE", artworkBadge: "PUBLIC SITE", artworkBadgeY: 35, snapshot: { src: "/images/projects/xondry-live.jpg", alt: "Live Xondry website showing creator profiles and AI project discovery.", label: "PUBLIC WEBSITE SNAPSHOT", kind: "public-site" } },
  squadamp: { artwork: "/images/projects/squadamp.webp", artworkAspect: .757, artworkAlt: "Concept illustration of an athlete, a crowd, and a bright orange performance waveform.", artworkStatus: "IN DEVELOPMENT", artworkBadge: "IN DEVELOPMENT", artworkBadgeY: 42 },
  "atomlang-evolved-sdk": { artwork: "/images/projects/atomlang.webp", artworkAspect: .762, artworkAlt: "Concept illustration of two AI systems exchanging structured messages through a packet link.", artworkStatus: "PROTOCOL RESEARCH", artworkBadge: "RESEARCH", artworkBadgeY: 53 },
  raeyl: { artwork: "/images/projects/raeyl.webp", artworkAspect: .764, artworkAlt: "Concept illustration of a luminous key over a map of connected website services.", artworkStatus: "IN DEVELOPMENT", artworkBadge: "IN DEVELOPMENT", artworkBadgeY: 58, snapshot: { src: "/images/projects/raeyl-live.webp", alt: "RAEYL public site preview showing a sample website wallet dashboard with providers, billing, renewals, and alerts.", label: "PUBLIC SITE // SAMPLE DASHBOARD", kind: "dashboard-preview" } },
  throwful: { artwork: "/images/projects/throwful-dashboard.webp", artworkAspect: 1.11, artworkAlt: "Throwful's sample fundraiser dashboard showing an illustrated Little League event, seller progress, food counts, and pickup updates.", artworkStatus: "PUBLIC PRODUCT SITE", artworkBadge: "SAMPLE DASHBOARD", artworkBadgeY: 35, snapshot: { src: "/images/projects/throwful-dashboard.webp", alt: "Throwful public site sample event dashboard for a Little League BBQ and raffle, with illustrative seller, food-count, and pickup figures.", label: "PUBLIC SITE // SAMPLE EVENT DASHBOARD", kind: "dashboard-preview" } },
  realball26: { artwork: "/images/projects/realball26.webp", artworkAspect: .735, artworkAlt: "Concept illustration of a basketball player driving toward a hoop inside a lit indoor arena.", artworkStatus: "PLAYABLE PROTOTYPE", artworkBadge: "PROTOTYPE", artworkBadgeY: 43 },
  classified: { artwork: "/images/projects/classified.webp", artworkAspect: .618, artworkAlt: "Concept illustration of a sealed steel vault door with a red warning symbol.", artworkStatus: "CLASSIFIED", artworkBadge: "CLASSIFIED", artworkBadgeY: 45 },
};

export const projects = catalog.products.map((product) => ({ ...product, ...projectArt[product.id] })) as Project[];
export const chamberProjects = projects.filter((project) => assetManifest.chambers.some((chamber) => chamber.id === project.id));
export const getProject = (slug: string) => projects.find((project) => project.id === slug);
