# JulianV.dev Black Site V3 QA handoff

## Delivery state

The project builds as a static Next.js export in out/ and is ready for the user's manual GitHub and Vercel setup. No GitHub repository or Vercel settings were changed. The local preview responds at [http://127.0.0.1:3200](http://127.0.0.1:3200) while its preview server is running.

The home route always presents a single image-driven 2.5D chamber experience; the Work route is the direct project index. There is no Professional Mode or homepage experience switch. The environment plate has been cleaned of static roof vapor while retaining the central fog; aperture-feathered exhibit artwork, source-art frame occluders, steam poster, VP9 smoke loop, and shutter assets are in public/blacksite. The selected vent plays smoke only during door opening, then dissipates; pointer hover no longer draws a glow around chamber art, while keyboard focus remains visible. Only one chamber stays open, and its project details panel moves to the opposite side. Switching chambers replaces the active history entry, so closing the current panel does not restore the prior chamber. The coordinate map is public/blacksite/manifest.json. Live behavior lives in src/components/BlacksiteExperience.tsx and src/components/Facility.tsx. Motion is adjusted automatically for reduced-motion preferences and small screens. The previous Three.js scene and dependencies have been removed.

See [visual QA](BLACK_SITE_VISUAL_QA.md), [gap audit](BLACK_SITE_GAP_AUDIT.md), and [asset inventory](BLACK_SITE_ASSET_INVENTORY.md).

## Verification

| Check | Result |
| --- | --- |
| npm run typecheck | Pass |
| npm run lint | Pass, no lint warnings |
| npm run test | Pass, 9 tests across 2 files |
| npm run build | Pass, 17 static pages generated, including six project detail pages |
| npm run test:e2e | Pass, 17 Playwright tests, including always-on homepage chambers, direct Work navigation, single-open switching, opposite-side project panel placement, smoke dissipation, keyboard/history, reduced motion, accessibility, and responsive overflow |
| npm run measure:qa | Pass, local unthrottled Chromium at 1440 x 900: LCP 152 ms, CLS 0, scripted Event Timing proxy 24 ms; raw result in [local-vitals.json](local-vitals.json) |
| Browser capture | Pass, 0 console errors, uncaught page errors, failed non-cancelled requests, or HTTP errors; latest states in [smoke-cleanup-final](visual-qa/smoke-cleanup-final/) |
| Visual comparison | Pass, close crop before/after evidence in [edge-comparison.png](visual-qa/chamber-blend-final/edge-comparison.png); static-to-dynamic smoke and two animated frames in [smoke-cleanup-final](visual-qa/smoke-cleanup-final/), plus desktop/tablet/mobile and hovered-open captures |
| Screenshot sizes | 1672 x 941, 1440 x 900, 1920 x 1080, 1024 x 768, 390 x 844, and 360 x 800 |
| Responsive and accessibility checks | E2E covers responsive overflow, keyboard focus, browser history, reduced motion, no-JavaScript routes, failed environment art fallback, and automated serious/critical accessibility findings |

Current route captures: [interactive homepage](screenshots/home-1672x941.png), [Work index](screenshots/work-index.png), and [Xondry project page](screenshots/project-xondry.png). Earlier chamber and reference comparisons are in [visual-qa/smoke-cleanup-final](visual-qa/smoke-cleanup-final/) for the roof-smoke and hover pass, [visual-qa/chamber-blend-final](visual-qa/chamber-blend-final/) for the close edge comparison, [visual-qa/header-footer-final](visual-qa/header-footer-final/) for the header/footer layout pass, and [visual-qa/v3-final](visual-qa/v3-final/) for the reference scene comparison. Before screenshots from the 3D implementation are in [visual-qa/v3-before](visual-qa/v3-before/).

The Event Timing value is a local scripted proxy, not field INP or a p75 Core Web Vital. No throttled midrange-device run or manual screen-reader session is claimed. Automated Axe checks and keyboard, focus restoration, Escape, history, and reduced-motion cases are included in the browser suite.

## Remaining differences and limits

The composition uses generated environment art and source image crops; it is not an exact pixel copy of the reference or a full 3D simulation. Shutter doors are extracted 2D leaves, and the vapor effect is a WebM loop rendered from generated art rather than a volumetric fluid simulation. Aperture feathering softens the project artwork edges, though the inserts still read as projected displays inside the physical bays. See the [visual comparison](BLACK_SITE_VISUAL_QA.md) and [gap audit](BLACK_SITE_GAP_AUDIT.md) for the full record.

No deployment was performed. The site is ready for manual repository creation and Vercel setup.
