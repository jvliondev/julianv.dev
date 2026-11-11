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
| public/blacksite/art/environment-plate.webp | Optimized 1672 x 941 smoke-free environment plate with static atmosphere and environment highlights precomposited | Keeps the visual base intact while avoiding full-scene CSS filters and animated blend layers. Localized lamps, doors, and chamber smoke remain independently animated. Roof vapor remains separate and animates during chamber opening. |
| public/blacksite/art/environment-plate-blur.webp | 512 x 288 preblurred, darkened derivative of the finished environment plate | Used behind the scene during camera moves so the browser does not blur the full resolution plate on demand. |
| public/blacksite/art/*-exhibit.webp | Six optimized exhibit image crops | Inserted into the six chamber openings and reused for mobile selection. |
| public/blacksite/art/environment-foreground-occluder.webp | Lossy WebP at quality 90 with full quality alpha | Restores the lamp, trim, wall edges, and chamber frames above the animation. Irregular doorway cutouts expose only the recessed opening; the same baked atmosphere and lighting is retained. |
| public/blacksite/art/*-shutter-left.webp and *-shutter-right.webp | Extracted and masked leaves from the closed-doors plate | Positioned and animated over the selected chamber image. |
| public/blacksite/art/steam-plume.webp | Optimized transparent plume image | Poster fallback for the WebM and a still plume for Reduced motion. |
| public/blacksite/art/steam-loop.webm | Four-second alpha VP9 smoke loop rendered from the transparent plume source | A muted inline video is preloaded when a chamber is selected, then screen-blended over its roof vent while its doors open and faded out before the open state. The loop is about 255 KB; right-side bays mirror the flow inward. |
| public/blacksite/manifest.json | Artboard coordinate map | Holds aperture polygons, shutter bounds, exhibit paths, vent anchors, and effect paths for the shared transform. |
| public/images/projects/*.webp | Six supplied/generated project concept illustrations, plus optimized RAEYL and Throwful site captures | Concept art remains inside the chambers and is used as the fallback for projects without public product imagery. |
| public/images/projects/xondry-live.jpg | Captured public Xondry website | Used in the featured project tile and Xondry overview; it is a website capture, not a claim about independently audited community metrics. |
| public/images/projects/raeyl-live.webp | Brightness-normalized capture of RAEYL's public site dashboard preview | Used in the RAEYL Work card, project page, and chamber overview. Sample dashboard data is labeled as a preview. |
| public/images/projects/throwful-dashboard.webp | Capture of the sample event dashboard on Throwful's public product site | Used on the Work card and project page. Example names and counts are explicitly identified as sample content. |

The original approved reference is 1672 x 941. The environment masters are 1671 x 941; the one-pixel resize is documented above. Generated and supplied art is retained under public/blacksite/source so the optimized derivatives can be rebuilt. The foreground occluder, blurred camera backing, and exhibit assets are regenerated with the chamber assets; the smoke loop is generated separately.

To regenerate the scene crops and manifest, run:

    node scripts/prepare-blacksite-assets.mjs

The source reference and source artwork remain available for local asset preparation. Regenerate the loop with `npm run generate:smoke-loop` when the source plume changes; this local step uses Playwright and FFmpeg. No third-party stock imagery or stock logos were introduced. Public website captures are stored locally and are labeled separately from concept art.

## Fonts

Fonts are bundled through Fontsource npm packages rather than requested from a remote font service:

- Oxanium Variable
- Space Grotesk Variable
- IBM Plex Mono

See the installed package metadata and license files for font licensing.

## Representation and content

Project statuses and descriptions are rendered from the canonical registry in machine/projects.json. RealBall26 retains the full PLAYABLE PROTOTYPE status on its project page. SquadAMP and RAEYL remain in development; AtomLang remains protocol research; Xondry is a public website; Throwful is represented by its public product site and sample dashboard; Classified contains no invented details. Only projects with a matching physical bay in public/blacksite/manifest.json are interactive chambers on the homepage.
