// Version 4.1. Network-first navigation, offline fallback. No analytics.
const CACHE='maartens-brokvagt-v41';
const FILES=['./','./index.html','./manifest.webmanifest','./assets/icon.svg','./push-client.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('maartens-brokvagt-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
if(new URL(req.url).pathname.endsWith('/push-config.js')){event.respondWith(fetch(req,{cache:'no-store'}).catch(()=>new Response("window.BROK_PUSH_ENDPOINT = '';",{headers:{'Content-Type':'application/javascript'}})));return;}
if(req.mode==='navigate'){event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(req);if(response.ok){await cache.put('./index.html',response.clone());return response;}return await cache.match('./index.html')||response;}catch{ return await cache.match('./index.html')||Response.error();}})());return;}
event.respondWith((async()=>{const cache=await caches.open(CACHE);const hit=await cache.match(req);if(hit)return hit;const response=await fetch(req);if(response.ok)await cache.put(req,response.clone());return response;})());});

self.addEventListener('push',event=>{
 event.waitUntil((async()=>{
 let data={};try{data=event.data?.json()||{}}catch{}
 await self.registration.showNotification(typeof data.title==='string'?data.title.slice(0,100):'Kammerat Mårten · Officiel korrespondance',{
  body:typeof data.body==='string'?data.body.slice(0,250):'Et nyt direktiv er modtaget.',
  tag:typeof data.tag==='string'?data.tag.slice(0,100):'direktiv',
  icon:new URL('./assets/icon.svg',self.registration.scope).href,
  data:{url:self.registration.scope}
 });})());
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil((async()=>{
 const scope=self.registration.scope;
 const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
 const existing=windows.find(c=>c.url.startsWith(scope));
 if(existing){await existing.focus();return}
 await self.clients.openWindow(scope);
 })());
});
