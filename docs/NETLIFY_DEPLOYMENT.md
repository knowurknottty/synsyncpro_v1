# SynSync Pro — Netlify PWA Deployment

This repository is intentionally scoped to the SynSync Web/PWA. Native macOS, Windows, Linux, Android, and other OS-specific variants belong in separate repositories.

## Source of truth

- Repository: `knowurknottty/synsyncpro_v1`
- Production branch: `main`
- Build system: Vite
- Node runtime: `.nvmrc` (Node 22)
- Netlify configuration: `netlify.toml`
- Build output: `dist/`

Do not point production at `synsyncpro-release-candidate`, the older `synsyncpro` repository name, or an old feature branch. `synsyncpro_v1` is the canonical Web/PWA source named by this runbook.

## Build and verification

```sh
npm ci
npm run type-check
npm test -- --run
npm run validate:protocols
npm run build
npm run verify:netlify-dist
```

`npm run build` produces the browser application and copies the stable PWA entry/control files into `dist/`. `verify:netlify-dist` fails if required application, manifest, service-worker, protocol-schema, icon, or AudioWorklet files are absent or malformed.

## Netlify configuration

`netlify.toml` provides:

- `/` → `main.html` landing page;
- `/demo` and `/free-demo` → React application;
- SPA fallback to `index.html`;
- immutable caching for content-hashed Vite assets;
- no-cache/no-store policy for application entry points and `sw.js`;
- manifest revalidation;
- AudioWorklet revalidation;
- root service-worker scope.

Expected project settings:

```text
Production branch: main
Base directory:    repository root
Build command:     npm run build && npm run verify:netlify-dist
Publish directory: dist
Node:              22
```

## Environment variables

The current core PWA build does not require private runtime API keys. Never commit secrets or expose them through `VITE_*`; client-side values are public by definition.

If a future server-side integration requires a secret, keep it in Netlify environment configuration and consume it only from server-side code.

## Required production URLs

```text
/                  landing page (`main.html`)
/demo              canonical SynSync app
/free-demo         canonical SynSync app
/manifest.json     PWA manifest
/sw.js             service worker
/PROTOCOL_PLAN_SCHEMA.json
/favicon.svg
/worklets/binaural-processor.js
/worklets/signal-proof-tap-processor.js
```

## PWA acceptance check

Against the production HTTPS origin:

1. Open `/demo` and confirm the app renders without console exceptions.
2. Confirm audio remains gated behind the required user gesture and then starts normally.
3. Confirm the manifest and service worker register successfully.
4. Install the PWA where the browser supports installation.
5. Launch the installed PWA and confirm it opens `/demo`.
6. Start a protocol and exercise playback/controls.
7. Reload online once to populate the current cache epoch.
8. Disable network access and confirm the application shell and required AudioWorklets still load.
9. Restore network access and confirm normal recovery.

## Update / stale-cache verification

SynSync uses an explicit service-worker cache epoch. Whenever cache semantics or stable assets change, increment the cache name in `sw.js`, deploy, confirm the new worker activates, and verify stale cache entries are removed.

Do not rename or remove a worklet without also updating `sw.js` and `scripts/verify-netlify-dist.mjs`.

## Release gate

The `Web/Core Validation` workflow is the source-level gate for this repository. A successful Netlify build is not a substitute for type checking, tests, protocol validation, and distribution verification.

## Release-sensitive files

```text
.nvmrc
netlify.toml
package.json
package-lock.json
vite.config.ts
manifest.json
sw.js
PROTOCOL_PLAN_SCHEMA.json
public/worklets/*
scripts/verify-netlify-dist.mjs
.github/workflows/web-core-validation.yml
```
