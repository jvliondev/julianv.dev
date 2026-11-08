# JulianV.dev Black Site V3 gap audit

## Delivery summary

The home experience now uses an image-driven 2.5D composition. A smoke-free underground environment plate fills one shared 1672 x 941 artboard while preserving the central floor fog. Six supplied project exhibit images sit in the chamber openings with aperture-shaped alpha feathering; extracted shutter leaves and animated roof vapor respond to the existing chamber state machine. Controls, project statuses, and project details remain live HTML.

This replaces the previous procedural Three.js corridor, which had recreated the concept as generic geometry and small image planes. The new composition uses the high-quality chamber art as its main visual content.

## Root cause and correction

The prior implementation treated the reference as a prompt for new scene geometry. That produced a recognizable corridor, but the chamber interiors became simplified props or framed image cards, and the approved visual assets were not doing enough work. The main gap was the rendering approach: recreating the whole environment procedurally sacrificed the supplied artwork's lighting, textures, and visual specificity.

The V3 implementation uses one scene image plate, perspective-aligned chamber crops, DOM captions and controls, and image-derived moving door leaves. All visual layers and click targets share the same cover transform from the 1672 x 941 coordinate space. The 3D canvas and Three.js dependencies have been removed from the home route.

## Corrections and evidence

| Area | V3 implementation | Evidence |
| --- | --- | --- |
| Environment | Generated clean environment plate based on the approved concept, without its browser chrome, header text, or inaccurate status labels | [Final home capture](visual-qa/v3-final/home-1672x941.png), [reference beside final](visual-qa/v3-final/reference-vs-final-scene.png) |
| Chamber imagery and foreground depth | Six source-art crops use alpha feathering shaped to each aperture and screen blending over the environment; alpha-masked frame crops let original metal lips overlap the image edges; pointer hover does not draw a glow or shift the artwork | [Before/after edge comparison](visual-qa/chamber-blend-final/edge-comparison.png), [hovered open chamber](visual-qa/smoke-cleanup-final/xondry-open-hover.png), [all chambers](visual-qa/smoke-cleanup-final/) |
| Mechanical reveal and venting | All six bays begin sealed. Only the selected leaves slide; the smoke-free plate lets the selected roof plume play during opening, dissipate before the chamber settles, and disappear. Switching projects seals the prior bay; only one remains open | [Closed](visual-qa/smoke-cleanup-final/initial-1672x941.png), [static-to-dynamic roof plume](visual-qa/smoke-cleanup-final/roof-smoke-before-after.png), [smoke motion](visual-qa/smoke-cleanup-final/smoke-motion-pair.png), [dissipating](visual-qa/smoke-cleanup-final/xondry-dissipating.png), [settled open](visual-qa/smoke-cleanup-final/xondry-open-dossier.png) |
| Chamber selection and project details | The detail panel moves to the opposite side of the selected bay so it does not cover the project art; desktop and mobile access remain available | [Xondry panel on right](visual-qa/chamber-blend-final/xondry-open-dossier.png), [RAEYL panel on left](visual-qa/chamber-blend-final/chamber-raeyl.png) |
| Responsive controls | Desktop scene hotspots, tablet chamber selector, and mobile scene crop with a touch-friendly selector and selected exhibit | [1024 px](visual-qa/v3-final/initial-1024x768.png), [390 px](visual-qa/v3-final/initial-390x844.png), [360 px](visual-qa/v3-final/initial-360x800.png) |
| Header, action buttons, and footer | Home header overlays the environment, action buttons use chamfered cyan styling, and the compact footer groups identity, Contact, and verified social links; tablet access actions wrap into two columns | [Before and after](visual-qa/header-footer-final/before-after-home-1672x941.png), [desktop](visual-qa/header-footer-final/initial-1672x941.png), [tablet](visual-qa/header-footer-final/initial-1024x768.png), [mobile](visual-qa/header-footer-final/initial-390x844.png) |
| Project artwork | The Work index and project pages use the supplied concept images | [Work index](../public/images/projects/), [Xondry project page](visual-qa/v3-final/dossier-xondry-390x844.png) |
| Project truth | Project statuses and descriptions remain in the live project panel; the former boxed caption over the exhibit image has been removed so it no longer forms a second rectangle | [Xondry project panel](visual-qa/chamber-blend-final/xondry-open-dossier.png), [project data](../src/data/projects.ts), [RealBall project page](visual-qa/chamber-blend-final/realball26-dossier.png) |
| Accessibility and routing | Project routes, shared links, browser history, keyboard focus, Escape close, and automatic reduced-motion behavior are preserved; the homepage always opens on the chamber experience | [Keyboard focus](visual-qa/v3-final/keyboard-focus.png), [reduced motion](visual-qa/v3-final/reduced-motion-realball26.png), [browser tests](../tests/e2e/portfolio.spec.ts) |

## Visual comparison method

The approved source is 1672 x 941 and contains decorative browser chrome. The comparison crops the reference from y=100 and the final page from y=76 to align the artwork stage. Both scene crops are normalized to 1672 x 781. The comparison includes a side-by-side image, 50 percent overlay, and difference image. These are review aids only; no pixel similarity score is reported because the environment plate is a reinterpretation and the page uses live DOM text.

- [Approved reference](visual-qa/reference/approved_black_site_1672x941.png)
- [Before: previous 3D implementation](visual-qa/v3-before/home-1672x941.png)
- [After: image-driven implementation](visual-qa/v3-final/home-1672x941.png)
- [Latest header and footer layout comparison](visual-qa/header-footer-final/before-after-home-1672x941.png)
- [Chamber outline and image blend before/after](visual-qa/chamber-blend-final/edge-comparison.png)
- [Reference and final scene crops](visual-qa/v3-final/reference-vs-final-scene.png)
- [Before and after scene crops](visual-qa/v3-final/before-vs-after-scene.png)
- [50 percent overlay](visual-qa/v3-final/reference-final-overlay-50.png)
- [Difference image](visual-qa/v3-final/reference-final-difference.png)
- [Comparison crop metadata](visual-qa/v3-final/comparison-metadata.json)

## Remaining differences

- The environment plate is generated from the reference concept; it is a close visual reinterpretation, not the exact approved pixels.
- Chamber interiors remain perspective-mapped source-art planes rather than independently rendered rooms or live product captures. Foreground frame occlusion and restrained parallax improve the depth cues but do not create full 3D interiors.
- Shutter motion uses image-derived 2D leaves. Vapor is a screen-blended WebM loop rendered from the transparent generated plume art; it is not volumetric simulation or live-action footage.
- The reference has more surface detail, brighter localized lighting, and richer smoke. Chamber inserts still read as projected artwork inside a physical bay rather than a live 3D product room.
- Mobile deliberately crops the environment and moves chamber access into a selector and a larger selected exhibit.

## Follow-up visual correction

The follow-up addressed chamber inserts reading as cards and vapor baked into the environment. Source-art frame crops overlap each insert and aperture alpha feathering softens edges. The roof vapor was cleaned from the background plate and is played as a screen-blended loop above the selected chamber while its doors open; it fades before the open state. The plume is wider and positioned over the roof seam, and right-side bays mirror it toward the center. Reduced-motion mode uses the still image or hides the effect according to the setting; the browser check verifies video playback in Full mode.

- [Final follow-up captures](visual-qa/smoke-loop-final/)
- [Frame and chamber before/after](visual-qa/visual-gap-final/chamber-detail-before-after.png)
- [Chamber vent before/after](visual-qa/smoke-loop-final/vapor-before-after.png)
- [Chamber vent capture](visual-qa/smoke-loop-final/xondry-venting.png)
- [Looping smoke video](../public/blacksite/art/steam-loop.webm)

The next layout pass lowered and reduced the plume so its visible cloud stays close to the selected vent, moved the home header over the scene, updated the shared action-button shape, and rebuilt the footer around the real Contact route. The approved-raster email remains omitted because it is explicitly marked illustrative in the content-truth source. [Latest venting capture](visual-qa/header-footer-final/xondry-venting.png).

The chamber blend pass removed the persistent active outline and boxed in-image caption, applied an aperture-matched alpha feather, and blended the project art against the environment. A follow-up removed global hotspot hover glow and zoom, cleaned static roof smoke from the base plate, and moved the animated vent to the roof seam. Shutters start closed, smoke dissipates before the settled-open state, project switching closes the previous bay, and the details panel stays opposite the selected chamber. [Before/after edge comparison](visual-qa/chamber-blend-final/edge-comparison.png), [roof smoke in motion](visual-qa/smoke-cleanup-final/squadamp-roof-venting.png), [full capture set](visual-qa/smoke-cleanup-final/).

The chamber blend pass removed the persistent active outline and boxed in-image caption, applied an aperture-matched alpha feather, and blended the project art against the environment. Shutters now start closed, smoke stops before the settled-open state, a project switch closes the previous bay, and the details panel stays opposite the selected chamber. [Before/after edge comparison](visual-qa/chamber-blend-final/edge-comparison.png), [full capture set](visual-qa/chamber-blend-final/).

## Verification

Final verification results are recorded in [QA handoff](QA_HANDOFF.md). The latest browser capture log is empty: [browser-issues.json](visual-qa/smoke-cleanup-final/browser-issues.json). The earlier scene-reference comparison remains in [v3-final](visual-qa/v3-final/).
