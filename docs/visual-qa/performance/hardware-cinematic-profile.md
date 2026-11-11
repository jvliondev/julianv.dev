# Cinematic frame cadence

## Measurement setup

Profiles use Chrome with hardware acceleration on the Intel Arc A770 at 1440×900. The capture records `requestAnimationFrame` intervals, which are a rendering cadence proxy rather than actual presented-frame telemetry. Chrome reported a 144 Hz callback ceiling; a 60 Hz display has a 16.7 ms frame budget.

The earlier 20–25 fps result came from Playwright Chromium with GPU compositing disabled and SwiftShader software rendering. It did not represent this machine's normal Chrome rendering path.

## Results

| Sequence phase | Before (rAF/s) | After (rAF/s) | After p95 interval | After intervals over 24 ms |
| --- | ---: | ---: | ---: | ---: |
| Idle | 144 | 144 | 7.1 ms | 0 |
| Unlocking | 99 | 127 | 7.1 ms | 2 |
| Camera travel / depressurizing | 142 | 144 | 7.1 ms | 0 |
| Doors opening | 141 | 143 | 7.2 ms | 0 |
| Smoke clearing | 140 | 144 | 7.1 ms | 0 |
| Overview reveal | 131 | 143 | 7.2 ms | 0 |

After the first full run, a second chamber sequence held the 144 Hz capture ceiling in every phase, with no intervals over 24 ms. With Chrome's CPU throttling set to 4×, phase p95 intervals stayed between 7 and 7.1 ms; isolated first-run spikes remained.

The first chamber click still records two long frame intervals (maximum about 146 ms) in this capture. The rest of that sequence, and all phases after the scene is warm, remain within the 60 Hz frame budget. The profiler observed no long main-thread tasks at normal CPU speed.

## Changes

- Removed blur filters from the terminal and overview entrance animations; opacity and translation now animate on compositor-friendly properties.
- Pre-decode the architectural foreground and fetch/decode the selected project's snapshot before the overview appears.
- Keep the transparent foreground, camera, door leaves, and sequence-light layers ready on desktop before the first chamber interaction.
- Preserve the camera path, door timing, light sequence, smoke, and final overview.

Raw profiles: [before](hardware-before.json), [after](hardware-final-prewarmed.json), [4× CPU throttle](hardware-final-prewarmed-cpu4x.json), and [repeat sequence](hardware-final-prewarmed-repeat.json). The runner is [profile-rendering.mjs](profile-rendering.mjs).
