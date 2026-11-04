# Black Site asset inventory

## Scene assets

| Asset | Origin | Use | Rights / representation |
| --- | --- | --- | --- |
| `public/images/black-site/rough-basalt-01.webp` | Generated for this project with OpenAI ImageGen; 338,192 bytes | Repeating rock albedo and bump surface for corridor architecture | Original generated texture; no external image source or attribution is used. It is a material texture, not a scene screenshot. |
| `src/components/FacilityScene.tsx` | Authored Three.js geometry and procedural CanvasTextures | Corridor, bulkheads, pressure door, six bays, props, lighting, floor guides, and translucent vapor | Original procedural scene. Product-bay objects are illustrative concept geometry, not screenshots or literal product footage. |
| `src/components/FacilitySceneFallback.tsx` | Authored inline SVG | No-WebGL fallback | Original vector composition; DOM controls and dossier content remain available outside it. |
| `docs/visual-qa/reference/approved_black_site_1672x941.png` and reference crops | Supplied handoff package | Internal visual QA only | Reference-only. The approved raster is not included as the page background or shipped application asset. |

## Fonts

Fonts are bundled through Fontsource npm packages so the exported site does not request a remote font service:

- Oxanium Variable (`@fontsource-variable/oxanium`)
- Space Grotesk Variable (`@fontsource-variable/space-grotesk`)
- IBM Plex Mono (`@fontsource/ibm-plex-mono`)

The package license files identify these font families as SIL Open Font License 1.1. See each installed package's `LICENSE` file and package metadata for the corresponding license text and notices.

## Project imagery and logos

No licensed product screenshots, game captures, partner marks, stock photography, or third-party 3D models were provided. The chamber motifs are authored, nonliteral representations of each project's category. RealBall26 uses a basketball and court motif, with “Playable prototype · In development” shown in the site. The TOP SECRET chamber contains no invented project details. The primary identity uses an authored “JV” text mark rather than an unauthorized logo copy.
