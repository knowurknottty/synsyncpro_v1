# SynSync Professional

SynSync Professional is the **canonical browser/PWA implementation of SynSync**, built with React, TypeScript, Vite, Web Audio, and installable progressive-web-app plumbing.

> **Repository scope:** Web/PWA only. Native macOS, Windows, Linux, Android, and other OS-specific variants are intentionally maintained as separate projects/repositories.

## Repository authority

This repository (`knowurknottty/synsyncpro_v1`) is the current source of truth for the Web/PWA application and production distribution checks.

`knowurknottty/synsyncpro-release-candidate` is a separate public release-candidate/provenance and engineering-proof surface. Do **not** treat that repository as the canonical production Web/PWA source or point production deployment at it.

The current `main` lineage was seeded from a verified clean PWA snapshot and is guarded by the `Web/Core Validation` workflow.

## Run locally

Requirements: Node 22 (see `.nvmrc`).

```sh
npm ci
npm run dev
```

## Verify

```sh
npm run type-check
npm test -- --run
npm run validate:protocols
npm run build
npm run verify:netlify-dist
```

The production build is emitted to `dist/` and includes the application shell, PWA manifest/service worker, protocol-plan schema, icon assets, and AudioWorklets required by the browser runtime.

`verify:netlify-dist` is a distribution-content gate; it does not replace type checking, unit tests, or protocol validation.

## Production deployment

The canonical web deployment is configured in `netlify.toml`. See [`docs/NETLIFY_DEPLOYMENT.md`](docs/NETLIFY_DEPLOYMENT.md) for build settings, required URLs, service-worker/PWA acceptance, stale-cache checks, and release-sensitive files.

Production should build from this repository's `main` branch, not from `synsyncpro-release-candidate` or an older feature branch.

## Repository layout

- `src/` — React application and browser-side modules
- `public/` — static browser assets and AudioWorklets
- `services/` — protocol/application services shared by the web code
- `scripts/` — PWA validation and deployment checks
- `__tests__/` — application tests
- `docs/` — maintained public/deployment documentation

## PWA boundary

The root PWA control files (`manifest.json`, `sw.js`, `PROTOCOL_PLAN_SCHEMA.json`) are copied into the production `dist/` by the build script. Required AudioWorklets remain explicit release assets.

Service-worker cache semantics are versioned. When stable assets or cache behavior change, the cache epoch must move and the distribution verifier must stay synchronized.

## Scope and safety

SynSync is software for audio experimentation, research, and user-directed wellness workflows. It is not a medical device and does not diagnose, treat, cure, or prevent disease. Audio and entrainment features should be used conservatively and never in situations where reduced attention or altered arousal could create a hazard.

## Status

**Canonical Web/PWA source.** Native platform implementations are intentionally excluded from this tree. Release/build claims apply only to the source and evidence that produced them; a successful Netlify deployment is not a substitute for repository validation gates.
