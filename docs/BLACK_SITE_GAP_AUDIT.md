# Black Site V2 gap audit

## Scope and evidence

The requested `CODEX_CORRECTIVE_MASTER_PROMPT_V2.md` filename was not present in the extracted handoff directory. I followed the complete directive supplied in the conversation and the package's `CODEX_MASTER_PROMPT.md`, visual forensics, design system, content truth, motion storyboard, scene and asset plan, responsive/accessibility/QA requirements, tokens, project data, annotated regions, and reference crops.

The approved raster is a generated concept, not a source model. Its first 49 pixels are fictional browser chrome and were excluded from comparison. I captured the current production export with Playwright at the requested widths and states. The direct desktop comparison aligns reference pixels y=49..940 with current viewport pixels y=0..891, both at 1672 x 892.

- [Approved reference](visual-qa/reference/approved_black_site_1672x941.png)
- [Annotated reference regions](visual-qa/reference/annotated_regions.png)
- [Current desktop capture](visual-qa/before/home-1672x941.png)
- [Reference / current side by side](visual-qa/before/reference-vs-current.png)
- [Difference image](visual-qa/before/difference.png)
- [All current baseline states and viewport captures](visual-qa/before/)
- [Baseline browser issue log](visual-qa/before/browser-issues.json)

Baseline and final screenshot capture found no browser console errors, uncaught page errors, failed non-cancelled requests, or HTTP errors. Playwright's deliberately cancelled link prefetches are filtered from the issue log. The current public Xondry site was reachable on November 3, 2026; no live community counters were copied into this portfolio. SquadAMP could not be independently reached during this review, so it remains marked in development.

## Root cause

The current landing stage is a CSS illustration: a few concentric rings, broad radial gradients, and six equal card-like buttons. It has no camera, environment geometry, bay depth, material maps, local light sources, or door mechanics connected to the reducer. As a result, there is no visual structure capable of producing the reference's corridor perspective, large industrial environment, recessed asymmetrical bays, localized vapor, or reflective floor. This is the principal fidelity gap, not a missing CSS polish pass.

The project package supplies no editable mesh, scene, material texture, or actual product/game screenshots. The replacement is an authored Three.js environment with original procedural architecture, chamber props, lighting, vapor sprites, and a generated basalt surface map. Concept-only chamber props remain visibly illustrative; they are not presented as actual app captures.

## Ranked reference comparison

| Rank | Reference | Baseline defect | Correction | Evidence |
| ---: | --- | --- | --- | --- | --- |
| 1 | Continuous underground corridor with a single vanishing point and large vault integrated into the architecture | CSS rings had no side walls, ceiling, or connecting corridor | Added textured stone shoulders, roof wings, steel ribs, pipes, converging floor rails, and a lit inner passage | [Before/after](visual-qa/final/reference-vs-final.png), [final desktop](visual-qa/final/home-1672x941.png) |
| 2 | Xondry and Classified are large foreground portals; SquadAMP and RealBall26 sit at mid-depth; AtomLang and RAEYL recede toward center | Six similar card rectangles formed a straight row | Six recessed, unequal bays now occupy three depth planes; DOM hotspots follow projected positions | [Annotated regions](visual-qa/reference/annotated_regions.png), [final desktop](visual-qa/final/home-1672x941.png) |
| 3 | Thick radial steel door with segmented plates, bolts, hazard arcs, separated leaves, and a narrow cyan breach | Two thin circles and a central line, with no moving mechanical panels | Added segmented armor, radial fasteners, twin translating leaves, an actual passage behind the opening, portal lighting, and visible state-driven movement | [Blast-door crop](visual-qa/reference/crops/blast_door.png), [entry states](visual-qa/final/entry-entering.png) and [open](visual-qa/final/entry-ready.png) |
| 4 | Rough rock/concrete, steel framing, service pipes, emissive fixtures, localized colored light | Smooth gradients and regular lines lacked material variation | Added generated basalt albedo/bump texture, metal maps, layered geometry, and localized bay lighting | [Reference](visual-qa/reference/approved_black_site_1672x941.png), [final desktop](visual-qa/final/home-1672x941.png) |
| 5 | Wet walkway with converging lights, localized reflections, and door vapor | No travel path, plume, or floor reflections | Added perspective rails, restrained wet-floor highlights, and vent-local vapor; reduced the overly sharp cyan floor reflection seen in the first 3D pass | [Final desktop](visual-qa/final/home-1672x941.png), [entry motion](visual-qa/final/entry-entering.png) |
| 6 | Six distinct product interiors | Motifs were decorative icons in flat cards | Added spatial motifs and per-bay light, door, vapor, and prop behavior while clearly labeling concept visualization | [Chamber captures](visual-qa/final/chamber-xondry-open.png), [AtomLang](visual-qa/final/chamber-atomlang-open.png), [Classified](visual-qa/final/chamber-classified-open.png) |
| 7 | Title aligned to the vault; one bottom access row and one Xondry teaser | CTA hierarchy was detached from the lower scene | Kept a centered hero CTA and added one concise access rail, one dossier teaser, and the existing footer | [Hero crop](visual-qa/reference/crops/hero_title_buttons.png), [access crop](visual-qa/reference/crops/access_paths.png), [final desktop](visual-qa/final/home-1672x941.png) |
| 8 | Header includes Julian's name and role line | Role previously appeared only in the footer | Added the name and role in the first viewport, with responsive header behavior | [Final desktop](visual-qa/final/home-1672x941.png) |
| 9 | Enter and chamber actions move mechanical parts and cue local light/vapor | Interaction state mostly changed CSS decoration | Connected the entry and chamber state machines to physical door leaves, bay light, motifs, and vapor; skip, Escape, history, and focus remain wired | [Entry states](visual-qa/final/entry-entering.png), [dossier state](visual-qa/final/dossier-xondry.png), [E2E suite](../tests/e2e/portfolio.spec.ts) |
| 10 | Responsive scene with accessible direct access | Narrow viewports only had the professional list | Small screens default to Professional Mode and can opt into the scene; both render without horizontal overflow at 320 and 390 px | [320](visual-qa/final/home-320x720.png), [390](visual-qa/final/home-390x844.png), [experience 320](visual-qa/final/home-experience-320x720.png) |
| 11 | Accurate project states | Risk of copying incorrect concept labels and claims | Kept statuses in one data source; RealBall is a playable prototype in development, SquadAMP is in development, and classified research remains undisclosed | [Project registry](../machine/projects.json), [RealBall route coverage](../tests/e2e/portfolio.spec.ts) |
| 12 | Keyboard and low-motion access | Scene refactor could have regressed existing navigation | Kept semantic DOM controls; added keyboard, history, reduced-motion, no-WebGL fallback, and 20-cycle GPU resource checks | [E2E suite](../tests/e2e/portfolio.spec.ts), [final browser issue log](visual-qa/final/browser-issues.json) |

## Initial visual scores

Scores use a five-point review scale (1 = absent/poor, 5 = close to the concept while retaining readable web content). They are qualitative, based on the direct screenshot comparison above, not a claim of pixel similarity.

| Dimension | Before | Evidence summary |
| --- | ---: | --- |
| Spatial layout / hierarchy | 2 | Title is centered, but access/teaser composition is missing and bays form a card row |
| Physical architecture / perspective | 1 | No actual corridor, walls, or bay depth |
| Materials / lighting / atmosphere | 1 | Mostly uniform CSS gradients; no material maps, localized vapor, or floor reflection |
| Chamber recognizability | 2 | Accent motifs exist, but not integrated interiors |
| Typography / legibility | 3 | Main title and project copy read clearly; some telemetry is very small |
| Responsive adaptation | 4 | Professional fallback works at narrow widths; scene is not yet recomposed |

## Remaining differences and limits

- The reference is a highly detailed generated concept image. The shipped Three.js scene has actual depth and mechanical interactions, but its procedural geometry and simple product props remain visibly stylized and are not photoreal.
- No licensed product screenshots, game footage, or editable source 3D models were supplied, so each chamber uses original illustrative geometry and labels it as a concept visualization.
- The final comparison confirms the intended hierarchy and corridor/bay geometry, but the reference still has richer local smoke, more complex environmental lighting, and denser mechanical surface detail.
- No manual screen-reader session or real-user performance data is claimed; those limits are tracked in the QA handoff.
