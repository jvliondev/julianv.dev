# QA handoff

Local validation for the production static export. A local build does not represent a live deployment or field Core Web Vitals.

## Project boundary

- This is an isolated project in `site/` with its own local Git repository on `feat/black-site-production`.
- No GitHub repository, Vercel project, deployment, or domain setting was created or changed.
- `npm run build` exports the deployable static site to `out/`. The owner can create/connect GitHub and configure Vercel manually.
- Product copy and route behavior are documented in `07_ARCHITECTURE.md` and `14_NEXT_GEN_INTERACTIONS.md`.
- The three bundled Fontsource families are licensed under the SIL Open Font License 1.1.

## Checks run

| Check | Result |
| --- | --- |
| `npm install` | Complete; `npm audit --audit-level=low` reports 0 vulnerabilities |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm test` | Pass: 3 reducer tests |
| `npm run build` | Pass: all app routes statically generated into `out/` |
| `npm run test:e2e` | Pass: 11 Playwright checks |
| Automated accessibility | axe reports no serious or critical issues on Home and Work; Lighthouse scores 100 desktop and mobile |
| Browser console / route requests | Lighthouse reports no console or network errors |

Playwright covered the home navigation, all six dossiers, truthful RealBall status, chamber and entrance skip/close behavior, browser history, reduced motion, responsive overflow at 320/390/1024/1440/1672 px, and axe checks on Home and Work.

## Lighthouse lab results

Lighthouse was run against the local production static preview using desktop and emulated mobile configurations. These results are lab measurements, not field data.

| Viewport | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Desktop | 100 | 100 | 100 | 100 | 284 ms | 0.002 | 0 ms |
| Emulated mobile | 100 | 100 | 100 | 100 | 1.05 s | 0.024 | 14 ms |

`npm run measure:qa` also measured the local 1440 x 900 export in unthrottled Chromium: LCP 116 ms and CLS 0. Its scripted interaction duration of 24 ms is an Event Timing proxy, not field INP or a p75 Core Web Vital.

## Visual review

Screenshots were captured from the local production export at the five reference sizes and for an open Xondry chamber and dossier.

| Preview | Screenshot |
| --- | --- |
| 1672 x 941 | [home-1672x941.png](screenshots/home-1672x941.png) |
| 1440 x 900 | [home-1440x900.png](screenshots/home-1440x900.png) |
| 1024 x 768 | [home-1024x768.png](screenshots/home-1024x768.png) |
| 390 x 844 | [home-390x844.png](screenshots/home-390x844.png) |
| 320 x 720 | [home-320x720.png](screenshots/home-320x720.png) |
| Xondry chamber | [chamber-xondry.png](screenshots/chamber-xondry.png) |
| Xondry dossier | [dossier-xondry.png](screenshots/dossier-xondry.png) |

## Limits before launch

- No manual screen-reader session was available; the recorded accessibility evidence is automated axe, Lighthouse, and keyboard interaction coverage in Playwright.
- Real-user Core Web Vitals require a deployed site with traffic.
- The Contact page uses the public X profile already listed by the current portfolio. No email, resume, booking system, or form backend was supplied. SquadAMP availability and checkout remain unverified and are not linked.
- The new build is prepared for Vercel static hosting, but no remote repository or hosting settings were touched. The existing production site and domain remain unchanged.
