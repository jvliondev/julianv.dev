# JulianV.dev — Facility JV-01

Production portfolio implementation based on the signed Black Site handoff in the adjacent directory.

## Reconnaissance

- The workspace contained the handoff package and reference art, but no local application source. A read-only check of the current deployment confirmed an existing Vercel project and source repository; the implementation here is isolated from them.
- The design handoff and source repository have not been modified. This directory contains a separate project with its own local Git repository and branch.
- Framework: Next.js App Router with TypeScript and static generation.
- Canonical product facts live in `machine/projects.json`; `src/data/projects.ts` provides its typed view.
- The facility is an authored HTML/CSS 2.5D scene. Essential content and controls remain semantic DOM; no WebGL dependency is required.
- Xondry and the current JulianV.dev were publicly reachable on 2026-11-02. SquadAMP commerce/public availability remains unverified and is not linked.
- No verified contact destination or current résumé was provided, so the contact page gives an honest, non-submitting connection path instead of a fake form or address.

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
npm run test:e2e
```

The production build is a static Next export in `out/`. For your later manual Vercel setup, use `npm run build` and output directory `out`. This local Git repository has no remote; no GitHub or Vercel resources have been created or changed. You can create the GitHub repository, connect it to Vercel, and add the domain manually when you are ready.

See `docs/QA_HANDOFF.md` for validation evidence and known limitations.
