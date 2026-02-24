const CACHE_NAME = 'bd-pms-v1'
const STATIC_ASSETS = [
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
]

// Install — cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    )
    self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) =>
            Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
        )
    )
    self.clients.claim()
})

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET and API requests
    if (event.request.method !== 'GET' || event.request.url.includes('/api/')) return

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful responses
                if (response.ok) {
                    const clone = response.clone()
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
                }
                return response
            })
            .catch(() => caches.match(event.request))
    )
})

// Push notifications
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {}
    const options = {
        body: data.message || 'Yeni bildirim',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: data.type || 'default',
        data: { url: data.link || '/tr/admin/tasks' },
    }
    event.waitUntil(self.registration.showNotification(data.title || 'Blue Dreams PMS', options))
})

// Notification click — open app
self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clients) => {
            const client = clients.find((c) => c.url.includes('/admin'))
            if (client) {
                client.focus()
                client.navigate(event.notification.data?.url || '/tr/admin/tasks')
            } else {
                self.clients.openWindow(event.notification.data?.url || '/tr/admin/tasks')
            }
        })
    )
})
