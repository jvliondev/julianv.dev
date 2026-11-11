# Cinematic frame cadence

## Measurement setup

Profiles use Chrome with hardware acceleration on the Intel Arc A770 at 1440×900. The capture records `requestAnimationFrame` intervals, which are a rendering cadence proxy rather than actual presented-frame telemetry. Chrome reported a 144 Hz callback ceiling; a 60 Hz display has a 16.7 ms frame budget.

The earlier 20–25 fps result came from Playwright Chromium with GPU compositing disabled and SwiftShader software rendering. It did not represent this machine's normal Chrome rendering path.

## Results

The camera now leaves the walkway, focuses on the selected chamber, opens the doors, pulls back, and reveals the overview at about 2.7 seconds. A Chrome capture showed the overview at 2.95 seconds from the click.

| Sequence phase | rAF cadence | p95 interval | Intervals over 24 ms |
| --- | ---: | ---: | ---: |
| Idle | 144 Hz | 7.1 ms | 0 |
| Unlocking / initial click | 72 Hz | 41.7 ms | 2 |
| Camera travel / depressurizing | 144 Hz | 7.1 ms | 0 |
| Doors opening | 141 Hz | 7.1 ms | 0 |
| Smoke clearing | 144 Hz | 7.1 ms | 0 |
| Overview reveal | 143 Hz | 7.1 ms | 0 |

On a repeat run after the scene was warm, every phase held 143–144 Hz with no intervals over 24 ms. The first click still shows two isolated long intervals (maximum about 118 ms), with no long main-thread tasks. The remaining sequence stays within the 60 Hz frame budget.

## Changes

- Removed blur filters from the terminal and overview entrance animations; opacity and translation now animate on compositor-friendly properties.
- Pre-decode the architectural foreground and fetch/decode the selected project's snapshot before the overview appears.
- Keep the transparent foreground, camera, door leaves, and sequence-light layers ready on desktop before the first chamber interaction.
- Preserve the camera path, door timing, light sequence, smoke, and final overview.

Raw profiles: [before](hardware-before.json), [three-second sequence](hardware-fast-three-second.json), and [repeat sequence](hardware-fast-three-second-repeat.json). Visual captures: [doors opening](hardware-fast-opening.png) and [overview](hardware-fast-overview.png). The runner is [profile-rendering.mjs](profile-rendering.mjs).
