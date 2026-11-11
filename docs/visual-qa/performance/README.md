# Black Site performance pass

## What was causing the lag

The scene kept two full-resolution emissive copies of the facility active, with blur, color filters, screen blending, and opacity animation. The camera also applied a two-part mask to the complete scene throughout its pan. Those operations made even the idle homepage miss frames. Hiding and pausing the smoke videos barely changed sequence cadence, as shown in [no-smoke.json](no-smoke.json).

## Changes

- Baked the static atmosphere and environment bloom into the scene and foreground plates. The localized lamps remain independently animated.
- Removed the redundant full-scene lighting layer, runtime blur, and animated full-image filters.
- Apply one edge feather only when the camera transform actually exposes an artboard edge.
- Removed per-frame terminal `left` and `top` layout writes; the dossier keeps a fixed position and only counter-scales during the camera move.
- Preload the architectural foreground layer during idle time so the first chamber interaction does not start its network request.

## Before and after

Chromium at 1440 x 900, same runner and CPU throttle. Frame rate is derived from `requestAnimationFrame` intervals, so it is a rendering proxy rather than a real-user metric.

| Scene phase | Before | After |
| --- | ---: | ---: |
| Idle | 19 fps | 60 fps |
| Unlocking | 14 fps | 23 fps |
| Depressurizing | 13 fps | 25 fps |
| Doors opening | 19 fps | 27 fps |
| Smoke dissipating | 19 fps | 24 fps |
| Revealed | 15 fps | 24 fps |

Image transfer observed after the interactive reveal fell from 4.65 MB to 1.18 MB (about 75% less). The loaded image count went from 64 to 62. The comparison files are [before-native.json](before-native.json) and [after-optimization.json](after-optimization.json); the reusable runner is [profile-rendering.mjs](profile-rendering.mjs).

This headless Chromium environment uses SwiftShader software compositing, so the camera sequence numbers understate what a GPU-backed browser should deliver. The profile still reports 23–27 fps during the moving sequence here; that part remains the main performance limitation to check on the target device.

## Visual check

The capture runner reported zero browser errors. The camera sequence screenshots are [lights approaching the gate](captures-after/02-following-lights-to-gate.png), [doors opening](captures-after/05-doors-opening.png), and [project overview after pullback](captures-after/07-showcase-after-pullback.png). Full observations are in [sequence-observations.json](captures-after/sequence-observations.json).
