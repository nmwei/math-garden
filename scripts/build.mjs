import './prepare-account.mjs';
import {cp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {basename, join} from 'node:path';
import {digest, inventory} from './deploy-site.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = join(root, 'dist');
await rm(out, {recursive: true, force: true});
await mkdir(out);
for (const path of ['app', 'domain', 'assets', 'index.html', 'manifest.webmanifest', 'sw.js']) {
  await cp(join(root, 'web', path), join(out, path), {recursive: true, filter: file => !basename(file).startsWith('.')});
}
const files = await inventory(out);
const clips = JSON.parse(await readFile(join(out, 'assets/audio/feedback-sources.json'))).clips;
for (const clip of clips) {
  if (files[`assets/${clip.file}`] !== clip.sha256) throw Error(`Feedback audio changed: ${clip.file}`);
}
const worker = await readFile(join(out, 'sw.js'), 'utf8');
const list = worker.match(/const files = \[([\s\S]*?)\]\.map\(/);
if (!list || !/^const VERSION = '[^']+';$/m.test(worker)) throw Error('Missing offline list or version.');
for (const [, path] of list[1].matchAll(/'([^']+)'/g)) {
  if (!files[path]) throw Error(`Missing offline asset: ${path}`);
}
const shellFiles=[...new Set([...list[1].matchAll(/'([^']+)'/g)].map(m=>m[1]).concat(Object.keys(files).filter(p=>p.startsWith('app/')||p.startsWith('domain/'))))];
const completeWorker=worker.replace(/const files = \[([\s\S]*?)\]\.map\(/, 'const files = '+JSON.stringify(shellFiles)+'.map(');
const fingerprint = digest(JSON.stringify(files)).slice(0, 12);
await writeFile(join(out, 'sw.js'), completeWorker.replace(/^const VERSION = '([^']+)';$/m, (_, version) => `const VERSION = '${version}+${fingerprint}';`));
console.log(`Built ${Object.keys(files).length} files. Fingerprint ${fingerprint}`);
