'use strict';
const CACHE_NAME = 'entelaqtak-shell-v82';
const APP_FILES = [
  './', './index.html', './workspace.html',
  './ui-polish.css', './ui-polish.css?v=20261121-nav-compact-1',
  './design-system.css', './design-system.css?v=20261125-blue-unified-1',
  './production-studio-pro.css', './production-studio-pro.css?v=20261121-pro-1',
  './button-system.css', './button-system.css?v=20261120-buttons-1',
  './responsive-system.css', './responsive-system.css?v=20261121-responsive-9',
  './sidebar-system.css', './sidebar-system.css?v=20261121-sidebar-v7-1',
  './control-center.css', './control-center.css?v=20261121-control-center-1',
  './workspace-pro.css', './workspace-pro.css?v=20261121-workspace-pro-1',
  './projects-hub.css', './projects-hub.css?v=20261125-project-hub-1',
  './project-assets.css', './project-assets.css?v=20261125-project-assets-1',
  './project-assistant.css', './project-assistant.css?v=20261125-project-assistant-1',
  './theme.js', './language.js', './creator-suite.js', './enhancements.js',
  './project-assistant.js', './project-assistant.js?v=20261125-project-assistant-1',
  './platform-hub.js', './production-studio.js', './production-studio.js?v=20261121-production-robust-2',
  './production-studio-pro.js', './project-assets.js', './project-assets.js?v=20261125-project-assets-1', './projects-hub.js', './projects-hub.js?v=20261125-project-hub-1', './sidebar-organizer.js', './content-pack-pro.js',
  './library-center.js', './visitor-tracker.js', './visitor-tracker.js?v=20261125-heartbeat-1',
  './control-center.js', './control-center.js?v=20261121-control-center-1',
  './workspace-pro.js', './workspace-pro.js?v=20261121-workspace-pro-1',
  './manifest.webmanifest', './app-icon.svg', './favicon.svg', './legal.html', './advertise.html'
];
const APP_BASE = new URL('./', self.location.href);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(APP_FILES.map(async file => {
      try {
        const request = new Request(new URL(file, APP_BASE), { cache: 'reload' });
        const response = await fetch(request);
        if (response && response.ok) await cache.put(request, response);
      } catch (error) {
        console.warn('Optional app-shell cache failed:', file);
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(key => key.startsWith('entelaqtak-shell-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== APP_BASE.origin || !url.pathname.startsWith(APP_BASE.pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request, { cache: 'reload' });
        if (fresh && fresh.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, fresh.clone());
        }
        return fresh;
      } catch (error) {
        return (await caches.match(request)) ||
          (await caches.match(new URL('./workspace.html', APP_BASE).href)) ||
          (await caches.match(new URL('./index.html', APP_BASE).href)) ||
          Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    try {
      const fresh = await fetch(request, { cache: 'reload' });
      if (fresh && fresh.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, fresh.clone());
      }
      return fresh;
    } catch (error) {
      return cached || Response.error();
    }
  })());
});
