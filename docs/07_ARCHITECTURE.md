# Architecture — Facility JV-01

## Project boundary

This is a new, independently buildable portfolio project. The existing julianv.dev deployment and source repository were inspected read-only and were not modified. The original Black Site handoff stays adjacent to this project and is the visual and content contract.

## Stack and output

- Next.js App Router, React, and strict TypeScript.
- Static HTML export to `out/` for Vercel static hosting.
- Authored HTML/CSS 2.5D scene. There is no WebGL runtime, scene loader, or GPU-only content.
- Semantic DOM is the source of all labels, controls, links, and project details.
- `machine/projects.json` is the canonical product registry; `src/data/projects.ts` only provides a typed view of it.
- `src/lib/chamber-machine.ts` is a pure transition reducer. `Facility` owns timers, history synchronization, focus return, and automatic motion preference handling.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Always-on interactive chamber experience with direct links to Work and Contact |
| `/vault` | Legacy route retained as a small link back to the home experience; not shown in primary navigation |
| `/work` | Selected project index |
| `/work/xondry` | Xondry project details |
| `/work/squadamp` | SquadAMP project details |
| `/work/atomlang-evolved-sdk` | AtomLang Evolved SDK project details |
| `/work/raeyl` | RAEYL project details |
| `/work/throwful` | Throwful project details and sample event dashboard capture |
| `/work/realball26` | RealBall26 project details |
| `/work/classified` | Public-safe project details |
| `/lab` | Experimental research overview |
| `/about` | Product role and working approach |
| `/contact` | Verified public contact channel |

## Content and claims

Public project labels and details are conservative. The product registry distinguishes known public site availability from product maturity. Project pages call authored artwork concept art. There are no imported product logos, fabricated screenshots, testimonials, counts, benchmark results, email addresses, or booking destinations.

Role language describes product direction and systems design, and explicitly identifies AI-assisted implementation where appropriate. Older engineering notes supplied in the handoff are presented as previously reported until a public artifact is available.

## Scene and state

The entrance begins sealed. A user action moves through bolt release, local venting, and door separation. Each bay has a separate visual motif. A chamber uses `sealed → unlocking → depressurizing → opening → revealed`, and returns through `closing → sealed`. State is data-driven and only one project can be selected at a time. Opening the first chamber creates a `#bay=<id>` history entry; switching chambers replaces that entry so closing or pressing Back never reopens the previous chamber. Skip effects reveals immediately, Escape closes and restores focus, and each project page is a normal deep link.

There is no experience mode switch or alternate project-card homepage. The chamber experience is the homepage; Work is the project index. Motion follows the visitor's reduced-motion preference automatically, and smaller displays use a lighter sequence. No project information depends on animation or WebGL.

## Contact and external destinations

The portfolio has no supplied mail service, form backend, resume, or scheduling system. Its Contact route links to the public X profile already listed by the currently deployed portfolio. Xondry, RAEYL, and Throwful have public project links. RAEYL's live provider integrations and customer use remain unverified; Throwful's product page displays an illustrative sample dashboard, and its protected app, payment processing, and production operations were not validated. SquadAMP, AtomLang, RealBall26, and classified do not advertise an external destination until one is verified. Project content may exceed the six architectural chambers; only products with matching chamber artwork and geometry are rendered as interactive home bays.
