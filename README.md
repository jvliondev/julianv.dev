# JulianV.dev — Facility JV-01

Production portfolio implementation based on the signed Black Site handoff in the adjacent directory.

## Reconnaissance

- The workspace contained the handoff package and reference art, but no application source, package manifest, deployment configuration, or Git repository.
- The implementation is therefore isolated in this directory; the handoff remains unchanged.
- Framework: Next.js App Router with TypeScript and static generation.
- Canonical product facts live in `src/data/projects.ts`.
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

See `docs/QA_HANDOFF.md` for validation evidence and known limitations.
