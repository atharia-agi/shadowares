/**
 * SHADOW STUDIO v5.2 — Service Worker
 * Manages offline mode, sync, and AI tool caching
 * @version 5.2.0
 */

const CACHE_NAME = 'shadow-studio-v5-2-0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const AI_CACHE = `${CACHE_NAME}-ai`;

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/v5-dashboard.html',
  '/shadow-core-v5.js',
  '/manifest.json',
  '/photo_editor.html',
  '/2.5d_playground.html',
  '/mcp-server.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];

// Install: Precache critical assets
self.addEventListener('install', (e) => {
  console.log('[SW] Installing Shadow Studio v5.1...');
  e.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches
self.addEventListener('activate', (e) => {
  console.log('[SW] Activating...');
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== AI_CACHE)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Serve from cache, fall back to network
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Priority 1: Precached assets (always serve from cache first)
  if (PRECACHE_ASSETS.includes(url.pathname)) {
    e.respondWith(caches.match(request).then(res => res || fetch(request)));
    return;
  }

  // Priority 2: HTML files - cache first, network fallback
  if (request.destination === 'document') {
    e.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(networkResponse => {
          if (networkResponse.ok) {
            caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, networkResponse.clone()));
          }
          return networkResponse;
        }).catch(() => new Response('<h1>Offline</h1><p>Shadow Studio is offline. Please check your connection.</p>', { headers: { 'Content-Type': 'text/html' } }));
      })
    );
    return;
  }

  // Priority 3: AI requests (cache with special strategy)
  if (url.pathname.startsWith('/ai/') || url.pathname.includes('api')) {
    e.respondWith(aiFetchStrategy(request));
    return;
  }

  // Priority 4: JS/CSS assets - cache first
  if (request.destination === 'script' || request.destination === 'style') {
    e.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        if (response.ok) {
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, response.clone()));
        }
        return response;
      }))
    );
    return;
  }

  // Default: Network first, then cache
  e.respondWith(networkFirst(request));
});

// AI Fetch Strategy: Cache with expiration
async function aiFetchStrategy(request) {
  const cached = await caches.match(request);
  if (cached) {
    const age = Date.now() - (cached.headers.get('date') ? new Date(cached.headers.get('date')).getTime() : 0);
    if (age < 3600000) return cached; // 1 hour cache for AI responses
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(AI_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.error('[SW] AI fetch failed:', err);
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: 'AI Service Unavailable' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
}

// Network First Strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

// Background Sync: Queue actions when offline
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-tools') {
    e.waitUntil(syncTools());
  }
  if (e.tag === 'sync-projects') {
    e.waitUntil(syncProjects());
  }
});

async function syncTools() {
  console.log('[SW] Syncing tools...');
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.addAll([
      '/icon_mapper.html',
      '/cursor_generator.html',
      '/mesh_gradient_generator.html',
      '/css_effect_generator.html',
      '/color_palette_generator.html',
      '/shadow_audio_synth.html',
      '/shadow_prompt_audio.html',
      '/icon_exporter_animated.html',
      '/icon_designer.html',
      '/visual_editor.html',
      '/photo_editor.html',
      '/2.5d_playground.html',
    ]);
    console.log('[SW] Tools synced');
  } catch (err) {
    console.error('[SW] Tool sync failed:', err);
  }
}

async function syncProjects() {
  console.log('[SW] Syncing projects...');
  // Implement IndexedDB project sync logic here
  return Promise.resolve();
}

// Push: Handle notifications from AI
self.addEventListener('push', (e) => {
  const data = e.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: data.url
  });
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data || '/'));
});

// Periodic sync for offline readiness
self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'sync-offline') {
    e.waitUntil(syncTools());
  }
});