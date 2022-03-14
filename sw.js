const cacheName = 'mCasEditor';
const version = 3.5;
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

  `/js/aside.js`,
  `/js/autotags.js`,
  `/js/brython_stdlib.js`,
  `/js/brython.min.js`,
  `/js/d3.min.js`,
  `/js/editor.js`,
  `/js/filehandling.js`,
  `/js/function-plot.js`,
  `/js/giacsimple.js`,
  `/js/katex/fonts/KaTeX_AMS-Regular.woff2`,
  `/js/katex/katex.min.css`,
  `/js/katex/katex.min.js`,
  `/js/mathlex.min.js`,
  `/js/Minos.js`,
  `/js/probability.js`,
  `/js/remarkable.min.js`,
  `/js/render.js`,
  `/js/replay.js`,
  `/js/tables.js`,
  `/js/translate.js`,
  `/js/trig.js`,
  `/js/util.js`,
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