# Black Site V2 QA handoff

## Delivery state

The current project is a static Next.js export in `out/`, ready for manual GitHub and Vercel setup. The build was not deployed and no Vercel settings were changed. The preview is available at [http://127.0.0.1:3200](http://127.0.0.1:3200) while the local preview server is running.

The content registry is `machine/projects.json`. The Three.js scene and its no-WebGL SVG fallback live in `src/components/FacilityScene.tsx` and `src/components/FacilitySceneFallback.tsx`. See [the visual audit](BLACK_SITE_GAP_AUDIT.md), [reference comparison](BLACK_SITE_VISUAL_QA.md), and [asset inventory](BLACK_SITE_ASSET_INVENTORY.md).

## Verification run

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass, no warnings |
| `npm test -- --run` | Pass: 3 reducer tests |
| `npm run build` | Pass: all 17 static routes generated, including all six `/work/{slug}` dossiers |
| `npm run test:e2e` | Pass: 15 Playwright tests |
| `npm audit --audit-level=low` | Pass: 0 vulnerabilities |
| Responsive screenshots | Captured at 1672×941, 1440×900, 1024×768, 390×844, and 320×720; mobile Professional and Experience modes both captured |
| Browser capture log | 0 console errors, uncaught page errors, failed non-cancelled requests, or HTTP errors |
| Axe Playwright checks | No serious or critical findings on Work and the interactive facility |
| Chamber resource loop | 20 successive open/close cycles across all six bays; one canvas and stable geometry/texture counts |
| No-JavaScript smoke | Static Home product index, navigation, dossier links, and `/work/xondry` render and work without client JavaScript |
| `npm run measure:qa` | Headless Chromium at 1440×900, unthrottled: LCP 100 ms, CLS 0, maximum scripted Event Timing duration 64 ms; full result in [local-vitals.json](local-vitals.json) |

The Event Timing value is a local scripted proxy, not field INP or a p75 Core Web Vital. No Lighthouse run, manual screen-reader session, deployed field measurement, or real-user Web Vitals are claimed.

## Visual evidence

Screenshots come from the production static export, not the development server. The first desktop screenshot confirms the WebGL scene is active; the no-WebGL test separately forces the authored SVG fallback.

| Evidence | File |
| --- | --- |
| Approved reference and final site side by side | [reference-vs-final.png](visual-qa/final/reference-vs-final.png) |
| Pixel difference map (qualitative only; the reference is generated concept art) | [difference.png](visual-qa/final/difference.png) |
| 50% overlay | [overlay-50.png](visual-qa/final/overlay-50.png) |
| Initial implementation at reference size | [home-1672x941.png](visual-qa/before/home-1672x941.png) |
| Final implementation at reference size | [home-1672x941.png](visual-qa/final/home-1672x941.png) |
| Entry in motion | [entry-entering.png](visual-qa/final/entry-entering.png) |
| Entry fully open | [entry-ready.png](visual-qa/final/entry-ready.png) |
| Server-rendered product index without JavaScript | [no-js-professional.png](visual-qa/final/no-js-professional.png) |
| Xondry, AtomLang, Classified chamber/dossier states | [Xondry](visual-qa/final/chamber-xondry-open.png), [AtomLang](visual-qa/final/chamber-atomlang-open.png), [Classified](visual-qa/final/chamber-classified-open.png) |
| Xondry dossier route | [dossier-xondry.png](visual-qa/final/dossier-xondry.png) |
| Browser issue log | [browser-issues.json](visual-qa/final/browser-issues.json) |

## Product truth and external checks

- RealBall26 is described as a playable basketball prototype in development. It is not called live, released, or a statistics product.
- SquadAMP, AtomLang, and RAEYL retain conservative development/research labels; TOP SECRET details remain undisclosed.
- The current public Xondry site was reachable during review, but this portfolio does not repeat its unverified community counters. SquadAMP was not independently reachable in the review session, so no external destination is published for it.
- The supplied scene motifs are concept visualization, not screenshots of the products or game.
- No public email, booking form, revenue, user count, benchmark, or testimonial was fabricated.

## Remaining differences

The scene now has connected corridor architecture, unequal recessed bays, a split blast door with an open passage, product-specific motifs, a reflective floor path, local lighting, and doorway vapor. Compared with the approved generated image, its authored meshes and materials remain more graphic and less detailed; the image has richer smoke, dramatic volumetric lighting, more realistic surfaces, and actual human/product imagery. No licensed screenshots, editable scene models, or game captures were supplied.

At 320 and 390 px, Professional Mode is the default; Experience Mode remains available. Motion Off removes sustained particles and animation while preserving direct product access. No manual screen-reader or field-performance result is claimed.
