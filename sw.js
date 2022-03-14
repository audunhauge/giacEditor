const cacheName = 'mCasEditor';
const version = 3.4;
const filesToCache = [
  '/',
  '/index.html',
  '/aside.html',
  '/pylab.py',
  '/examples.json',
  '/giacwasm.js',
  '/giacwasm.wasm',

  '/css/maed.css',
  '/css/index.css',
  '/css/aside.css',

  '/media/maed-128.png',
  '/media/maed-144.png',
  '/media/mzy-icon.png',
  '/media/ex1P.md',
  '/media/ex2P.md',
  '/media/ex1T.md',
  '/media/exR1.md',
  '/media/exR2.md',
  '/media/exS1.md',
  '/media/exS2.md',

  `/v${version}/aside.js`,
  `/v${version}/autotags.js`,
  `/v${version}/brython_stdlib.js`,
  `/v${version}/brython.min.js`,
  `/v${version}/d3.min.js`,
  `/v${version}/editor.js`,
  `/v${version}/filehandling.js`,
  `/v${version}/function-plot.js`,
  `/v${version}/giacsimple.js`,
  `/v${version}/katex/fonts/KaTeX_AMS-Regular.woff2`,
  `/v${version}/katex/katex.min.css`,
  `/v${version}/katex/katex.min.js`,
  `/v${version}/mathlex.min.js`,
  `/v${version}/Minos.js`,
  `/v${version}/probability.js`,
  `/v${version}/remarkable.min.js`,
  `/v${version}/render.js`,
  `/v${version}/replay.js`,
  `/v${version}/tables.js`,
  `/v${version}/translate.js`,
  `/v${version}/trig.js`,
  `/v${version}/util.js`,
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
  self.skipWaiting();
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});