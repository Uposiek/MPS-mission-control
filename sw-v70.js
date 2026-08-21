const CACHE="mps-v70-live-auto-tyres-docs-20260821";
const CORE=[
  "./","./index.html","./style-v70.css","./app-v70.js","./i18n-v70.js","./manifest.json","./mps-badge-v63.png","./icon-192.png","./icon-512.png","./apple-touch-icon.png"
];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));self.skipWaiting()});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",event=>{if(event.request.method!=="GET")return;const url=new URL(event.request.url);const isCore=CORE.some(x=>url.pathname.endsWith(x.replace("./","/")))||url.pathname.endsWith("/");if(isCore){event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(r=>r||caches.match("./index.html"))));return}event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request))) });
