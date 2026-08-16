# SynSync Professional

SynSync Professional is the browser/PWA implementation of SynSync, built with React, TypeScript, Vite, Web Audio, and installable progressive-web-app plumbing.

> **Repository scope:** Web/PWA only. Native macOS, Windows, Linux, Android, and other OS-specific variants are intentionally maintained as separate projects/repositories.

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

## Production deployment

The canonical web deployment is configured in `netlify.toml`. See [`docs/NETLIFY_DEPLOYMENT.md`](docs/NETLIFY_DEPLOYMENT.md) for the release and PWA acceptance checks.

## Repository layout

- `src/` — React application and browser-side modules
- `public/` — static browser assets and AudioWorklets
- `services/` — protocol/application services shared by the web code
- `scripts/` — PWA validation and deployment checks
- `__tests__/` — application tests
- `docs/` — maintained public/deployment documentation

## Scope and safety

SynSync is software for audio experimentation, research, and user-directed wellness workflows. It is not a medical device and does not diagnose, treat, cure, or prevent disease. Audio and entrainment features should be used conservatively and never in situations where reduced attention or altered arousal could create a hazard.

## Status

This repository is the canonical SynSync Web/PWA codebase. Native platform implementations are intentionally excluded from this tree.
