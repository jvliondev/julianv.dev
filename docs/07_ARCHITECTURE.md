# Architecture — Facility JV-01

## Project boundary

This is a new, independently buildable portfolio project. The existing julianv.dev deployment and source repository were inspected read-only and were not modified. The original Black Site handoff stays adjacent to this project and is the visual and content contract.

## Stack and output

- Next.js App Router, React, and strict TypeScript.
- Static HTML export to `out/` for Vercel static hosting.
- Authored HTML/CSS 2.5D scene. There is no WebGL runtime, scene loader, or GPU-only content.
- Semantic DOM is the source of all labels, controls, links, and dossier copy.
- `machine/projects.json` is the canonical product registry; `src/data/projects.ts` only provides a typed view of it.
- `src/lib/chamber-machine.ts` is a pure transition reducer. `Facility` owns timers, history synchronization, focus return, mode, and motion settings.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Welcome and facility entrance, with direct professional access |
| `/vault` | Full corridor scene without the entrance sequence |
| `/work` | Professional project index |
| `/work/xondry` | Xondry mission dossier |
| `/work/squadamp` | SquadAMP mission dossier |
| `/work/atomlang-evolved-sdk` | AtomLang Evolved SDK dossier |
| `/work/raeyl` | RAEYL mission dossier |
| `/work/realball26` | RealBall26 mission dossier |
| `/work/classified` | Public-safe classified dossier |
| `/lab` | Experimental research overview |
| `/about` | Product role and working approach |
| `/contact` | Verified public contact channel |

## Content and claims

Public project labels and details are conservative. The product registry distinguishes known public site availability from product maturity. The dossier UI calls all authored product artwork a concept visualization. There are no imported product logos, fabricated screenshots, testimonials, counts, benchmark results, email addresses, or booking destinations.

Role language describes product direction and systems design, and explicitly identifies AI-assisted implementation where appropriate. Older engineering notes supplied in the handoff are presented as previously reported until a public artifact is available.

## Scene and state

The entrance begins sealed. A user action moves through bolt release, local venting, and door separation. Each bay has a separate visual motif. A chamber uses `sealed → unlocking → depressurizing → opening → revealed`, and returns through `closing → sealed`. State is data-driven and only one project can be selected at a time. Each selection updates `#bay=<id>`; browser back/forward restores the selected bay. Skip effects reveals immediately, Escape closes and restores focus, and a dossier is a normal deep link.

Full/reduced/off motion is available in Experience Mode. Reduced motion is detected on first visit; small displays start in Professional Mode. Professional Mode lists the same content as normal links and requires no scene or animation. No project information depends on motion or WebGL.

## Contact and external destinations

The portfolio has no supplied mail service, form backend, resume, or scheduling system. Its Contact route links to the public X profile already listed by the currently deployed portfolio. Xondry's public URL was checked. SquadAMP, AtomLang, RAEYL, RealBall26, and classified do not advertise an external destination until one is verified.
