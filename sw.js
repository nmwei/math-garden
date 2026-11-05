const VERSION = '1.0.33+8b851d1f18b8';
const scope = self.registration.scope;
const prefix = `math-garden:app:${encodeURIComponent(scope)}:`;
const cacheName = `${prefix}${VERSION}`;
const homeUrl = new URL('index.html', scope).href;
const files = [
  'index.html', 'manifest.webmanifest',
  'app/styles.css', 'app/shapes.css', 'app/patterns.css', 'app/course.css', 'app/course-workshop.css', 'app/parent.css',
  'app/main.js', 'app/counting.js', 'app/choice-game.js', 'app/shapes.js', 'app/patterns.js',
  'app/number-games.js', 'app/number-games.css',
  'app/feedback-audio.js', 'assets/audio/feedback-correct.wav', 'assets/audio/feedback-retry.wav', 'assets/audio/feedback-sources.json',
  'app/garden-ui.js', 'app/preferences.js', 'app/offline.js', 'app/shell.js', 'app/voice.js', 'app/parent.js',
  'app/course.js', 'app/course-models.js', 'app/course-memory.js', 'app/course-study.js', 'app/course-manipulatives.js',
  'app/course-foundation.js', 'app/course-grade1.js', 'app/course-grade2.js', 'app/course-grade3.js',
  'app/course-bridge.js', 'app/course-extensions.js', 'app/course-variants.js',
  'app/course-enrichment.js', 'app/course-teaching.js', 'app/course-practice.js',
  'app/challenge-paths.js', 'app/course-challenge.js',
  'app/course-story-workshop.js', 'app/course-fraction-workshop.js', 'app/course-workshop.js',
  'assets/icon.svg', 'assets/icon-180.png', 'assets/icon-192.png', 'assets/icon-512.png',
  'assets/garden-hero.svg', 'assets/count-flower.svg',
].map(path => new URL(path, scope).href);
const appUrls = new Set(files);

async function prepareCache() {
  const cache = await caches.open(cacheName);
  // addAll commits the app shell together after every request succeeds.
  await cache.addAll(files.map(url => new Request(url, { cache: 'reload' })));
}

async function getStatus() {
  const cache = await caches.open(cacheName);
  const cached = new Set((await cache.keys()).map(request => request.url));
  return { version: VERSION, ready: files.every(url => cached.has(url)) };
}

async function repairCache() {
  if (self.registration.installing || self.registration.waiting) return;
  const response = await fetch(new URL('sw.js', scope), { cache: 'no-store' });
  const onlineVersion = response.ok && (await response.text()).match(/^const VERSION = '([^']+)';$/m)?.[1];
  if (onlineVersion !== VERSION || self.registration.installing || self.registration.waiting) return;
  await prepareCache();
}

self.addEventListener('install', event => {
  event.waitUntil(prepareCache());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    if (!self.registration.installing && !self.registration.waiting) {
      await Promise.all(names.filter(name => name.startsWith(prefix) && name !== cacheName)
        .map(name => caches.delete(name)));
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  const { type } = event.data ?? {};
  if (type === 'APPLY_UPDATE') {
    event.waitUntil(self.skipWaiting());
    return;
  }
  const port = event.ports[0];
  if (!port || (type !== 'GET_STATUS' && type !== 'PREPARE_OFFLINE')) return;
  event.waitUntil((async () => {
    try {
      if (type === 'PREPARE_OFFLINE') await repairCache();
      port.postMessage(await getStatus());
    } catch {
      port.postMessage({ version: VERSION, ready: false });
    }
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  url.search = '';
  url.hash = '';
  const key = url.href === scope ? homeUrl : url.href;
  if (!appUrls.has(key)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    return (await cache.match(key)) ?? fetch(event.request);
  })());
});
