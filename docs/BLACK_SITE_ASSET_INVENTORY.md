# JulianV.dev Black Site V3 asset inventory

## Source and generated art

| File or group | Origin and use | Notes |
| --- | --- | --- |
| docs/visual-qa/reference/approved_black_site_1672x941.png | User-approved visual reference; comparison only | SHA-256: 87edcbb1619ec21997a9d8fa40f24ecbc4422573eb2b3acc3b123af1607fc9a9. It is not rendered as a page background. |
| public/blacksite/source/reference_original.png | Exact copy of the approved reference | Hash matches the approved reference. Retained for provenance and QA. |
| public/blacksite/source/environment_plate_master.png | Baseline generated underground environment plate based on the reference | 1671 x 941 source. This version retains the static side-bay roof vapor; the smoke-free derivative below is used by the site. |
| public/blacksite/source/environment_plate_smokefree.png | ImageGen edit of the environment master used to separate roof vapor from the background | Removes only static smoke over the side-bay roof vents; keeps central floor fog and existing architecture so side-bay smoke can animate independently. |
| public/blacksite/source/closed_doors_plate.png | Generated matching plate with closed chamber doors | Used to derive the moving shutter-leaf assets. |
| public/blacksite/source/steam-plume-generated.png | Generated transparent vapor plume | Alpha source texture for the localized chamber release effect. |
| public/blacksite/source/chambers/*_source.png | Supplied project-specific exhibit artwork | Cropped by scripts/prepare-blacksite-assets.mjs to exclude source headers and statuses. |
| public/blacksite/art/environment-plate.webp | Optimized 1672 x 941 smoke-free environment plate | Main scene image; roof vapor is rendered separately during chamber opening. |
| public/blacksite/art/*-exhibit.webp | Six optimized exhibit image crops | Inserted into the six chamber openings and reused for mobile selection and featured project art. |
| public/blacksite/art/*-frame-occluder.webp | Six alpha-masked crops from the matching environment plate | Preserve the aperture's foreground steel lip over each interior image. |
| public/blacksite/art/*-shutter-left.webp and *-shutter-right.webp | Extracted and masked leaves from the closed-doors plate | Positioned and animated over the selected chamber image. |
| public/blacksite/art/steam-plume.webp | Optimized transparent plume image | Poster fallback for the WebM and a still plume for Reduced motion. |
| public/blacksite/art/steam-loop.webm | Five-second VP9 smoke loop rendered from the transparent plume source | Screen-blended over the selected chamber's roof vent while its doors open, then faded out before the open state; right-side bays mirror the flow inward. |
| public/blacksite/manifest.json | Artboard coordinate map | Holds aperture polygons, shutter bounds, exhibit paths, vent anchors, and effect paths for the shared transform. |
| public/images/projects/*.webp | Six supplied/generated project concept illustrations | Used on the public Work index and project pages. These are labeled as concept art and are not represented as product screenshots. |

The original approved reference is 1672 x 941. The environment masters are 1671 x 941; the one-pixel resize is documented above. Generated and supplied art is retained under public/blacksite/source so the optimized derivatives can be rebuilt. The frame occluders and steam image are regenerated with the chamber assets.

To regenerate the scene crops and manifest, run:

    node scripts/prepare-blacksite-assets.mjs

The source reference and source artwork remain available for local asset preparation. Regenerate the loop with `npm run generate:smoke-loop` when the source plume changes; this local step uses Playwright and FFmpeg. No third-party stock images, product screenshots, logos, or 3D models were introduced.

## Fonts

Fonts are bundled through Fontsource npm packages rather than requested from a remote font service:

- Oxanium Variable
- Space Grotesk Variable
- IBM Plex Mono

See the installed package metadata and license files for font licensing.

## Representation and content

Project statuses and descriptions are rendered from live project data in src/data/projects.ts. RealBall26 retains the full PLAYABLE PROTOTYPE status on its project page. SquadAMP and RAEYL remain in development; AtomLang remains protocol research; Xondry is a public website; Classified contains no invented details.
