# Cinematic frame cadence

## Measurement setup

Profiles use Chrome with hardware acceleration on the Intel Arc A770 at 1440×900. The capture records `requestAnimationFrame` intervals, which are a rendering cadence proxy rather than actual presented-frame telemetry. Chrome reported a 144 Hz callback ceiling; a 60 Hz display has a 16.7 ms frame budget.

The earlier 20–25 fps result came from Playwright Chromium with GPU compositing disabled and SwiftShader software rendering. It did not represent this machine's normal Chrome rendering path.

## Results

All cinematic timings are now 1.2× the previous pass. The camera leaves the walkway, focuses on the selected chamber, opens the doors, pulls back, and reveals the overview at about 3.24 seconds on the sequence clock. A Chrome capture showed the overview 3.59 seconds after the click, about 20% longer than the previous 2.95 second capture.

| Sequence phase | rAF cadence | p95 interval | Intervals over 24 ms |
| --- | ---: | ---: | ---: |
| Idle | 144 Hz | 7.1 ms | 0 |
| Unlocking | 139 Hz | 8.9 ms | 0 |
| Depressurizing / camera travel | 137 Hz | 12.3 ms | 0 |
| Doors opening | 144 Hz | 7.1 ms | 0 |
| Smoke clearing | 144 Hz | 7.1 ms | 0 |
| Overview reveal | 144 Hz | 7.2 ms | 0 |

The hardware profile includes a first-use startup outlier, but the repeat sequence had no intervals over 24 ms and no long main-thread tasks. The repeated movement stays within the 60 Hz frame budget.

## Changes

- Removed blur filters from the terminal and overview entrance animations; opacity and translation now animate on compositor-friendly properties.
- Pre-decode the architectural foreground and fetch/decode the selected project's snapshot before the overview appears.
- Keep the transparent foreground, camera, door leaves, and sequence-light layers ready on desktop before the first chamber interaction.
- Preserve the camera path, door timing, light sequence, smoke, and final overview.

Raw profiles: [before](hardware-before.json), [three-second sequence](hardware-fast-three-second.json), [repeat sequence](hardware-fast-three-second-repeat.json), and [20% slower sequence](hardware-20-percent-slower.json) with its [repeat](hardware-20-percent-slower-repeat.json). Visual captures: [doors opening](hardware-20-percent-opening.png) and [overview](hardware-20-percent-overview.png). The runner is [profile-rendering.mjs](profile-rendering.mjs).
