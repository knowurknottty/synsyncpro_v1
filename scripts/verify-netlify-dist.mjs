import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = path.join(root, 'dist');

const requiredFiles = [
  'index.html',
  'main.html',
  'manifest.json',
  'sw.js',
  'PROTOCOL_PLAN_SCHEMA.json',
  'favicon.svg',
  'worklets/binaural-processor.js',
  'worklets/signal-proof-tap-processor.js',
];

const failures = [];

for (const relative of requiredFiles) {
  const absolute = path.join(dist, relative);
  try {
    await access(absolute);
    const info = await stat(absolute);
    if (!info.isFile() || info.size === 0) {
      failures.push(`${relative}: missing or empty`);
    }
  } catch {
    failures.push(`${relative}: missing`);
  }
}

try {
  const manifest = JSON.parse(await readFile(path.join(dist, 'manifest.json'), 'utf8'));
  if (manifest.start_url !== '/demo') {
    failures.push(`manifest.json: expected start_url /demo, got ${String(manifest.start_url)}`);
  }
  if (manifest.scope !== '/') {
    failures.push(`manifest.json: expected scope /, got ${String(manifest.scope)}`);
  }
  if (manifest.display !== 'standalone') {
    failures.push(`manifest.json: expected display standalone, got ${String(manifest.display)}`);
  }
} catch (error) {
  failures.push(`manifest.json: invalid JSON (${error instanceof Error ? error.message : String(error)})`);
}

try {
  JSON.parse(await readFile(path.join(dist, 'PROTOCOL_PLAN_SCHEMA.json'), 'utf8'));
} catch (error) {
  failures.push(`PROTOCOL_PLAN_SCHEMA.json: invalid JSON (${error instanceof Error ? error.message : String(error)})`);
}

try {
  const sw = await readFile(path.join(dist, 'sw.js'), 'utf8');
  for (const worklet of [
    '/worklets/binaural-processor.js',
    '/worklets/signal-proof-tap-processor.js',
  ]) {
    if (!sw.includes(worklet)) {
      failures.push(`sw.js: does not precache ${worklet}`);
    }
  }
} catch (error) {
  failures.push(`sw.js: unreadable (${error instanceof Error ? error.message : String(error)})`);
}

for (const html of ['index.html', 'main.html']) {
  try {
    const source = await readFile(path.join(dist, html), 'utf8');
    if (/\/Users\/[A-Za-z0-9._-]+\//.test(source)) {
      failures.push(`${html}: contains an absolute macOS user path`);
    }
  } catch {
    // Missing files are already reported above.
  }
}

if (failures.length > 0) {
  console.error('Netlify distribution verification FAILED:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Netlify distribution verification PASS (${requiredFiles.length} required files).`);
