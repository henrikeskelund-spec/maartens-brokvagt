self.addEventListener('push',event=>{
  event.waitUntil(self.registration.showNotification('Kammerat Mårten',{
    body:'Der er en ny melding i Kontrolcentralen.',
    icon:new URL('../assets/icon.svg',self.registration.scope).href
  }));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil((async()=>{
    const scope=self.registration.scope;
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    const open=windows.find(client=>client.url===scope);
    if(open)await open.focus();
    else await self.clients.openWindow(scope);
  })());
});
