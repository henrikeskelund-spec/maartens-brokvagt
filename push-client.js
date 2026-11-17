(() => {
'use strict';
const $=id=>document.getElementById(id);
const storeKey='brokkommission-push-v1';
const configured=()=>typeof window.BROK_PUSH_ENDPOINT==='string'&&/^https:\/\//.test(window.BROK_PUSH_ENDPOINT);
const supported=()=>isSecureContext&&'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
function read(){try{return JSON.parse(localStorage.getItem(storeKey)||'{}')}catch{return {}}}
function write(value){localStorage.setItem(storeKey,JSON.stringify(value));}
function token(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('')}
function keyBytes(s){const p=s.replace(/-/g,'+').replace(/_/g,'/');return Uint8Array.from(atob(p+'='.repeat((4-p.length%4)%4)),c=>c.charCodeAt(0))}
const closed=()=>window.isBrokPlanRegistered?.()===true;
let busy=false;
function report(message){$('pushStatus').textContent=message}
function paint(){
 const state=read();
 $('pushEnable').disabled=busy||!supported()||!configured()||closed()||state.active===true||state.pending===true;
 $('pushDisable').disabled=busy||(!state.active&&!state.pending&&!state.token);
 if(!configured())report('Korrespondancekontoret afventer idriftsættelse.');
 else if(!supported())report('Anvend en understøttet, installeret webapp. På iPhone: Føj til hjemmeskærm.');
 else if(state.pending)report('Afmelding afventer forbindelse. Der forsøges igen, når appen er online.');
 else if(closed())report('Korrespondancen er indstillet i medfør af den registrerede plan.');
 else if(state.active&&Notification.permission==='granted')report('OFFICIEL KORRESPONDANCE AKTIV · 09.00 / 13.00 / 18.00');
 else if(Notification.permission==='denied')report('Notifikationer er slået fra i telefonens indstillinger.');
 else report('KORRESPONDANCE IKKE AKTIVERET');
}
async function request(path,data){
 if(!configured())throw new Error('not configured');
 const url=new URL(path,window.BROK_PUSH_ENDPOINT);
 const c=new AbortController();const timer=setTimeout(()=>c.abort(),10000);
 try{const response=await fetch(url,{method:data?'POST':'GET',...(data?{headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}:{}),signal:c.signal,cache:'no-store',credentials:'omit'});
 if(!response.ok)throw new Error('service unavailable');return await response.json();}finally{clearTimeout(timer)}
}
async function registration(){return Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(new Error('service worker not ready')),10000))]);}
async function unregister(){
 const old=read();const pending={token:old.token,active:false,pending:true};write(pending);
 const remote=old.token?request('/unsubscribe',{token:old.token}):Promise.resolve();
 const local=(async()=>{if(!supported())return;const reg=await registration();const sub=await reg.pushManager.getSubscription();if(sub&&!(await sub.unsubscribe()))throw new Error('browser unsubscribe failed');})();
 const [a,b]=await Promise.allSettled([remote,local]);
 // Remote deletion or browser unsubscribe prevents further new delivery. Prefer both.
 if(a.status==='fulfilled'&&b.status==='fulfilled')write({active:false,pending:false});
 else write({...pending,pending:true});
}
async function stop(){
 if(busy)return;
 busy=true;paint();
 try{await unregister()}catch{report('Afmeldingen kunne ikke gemmes. Prøv igen.');}finally{busy=false;paint()}
}
async function start(){
 if(busy||closed()||!supported()||!configured()||read().pending)return;
 busy=true;paint();
 let succeeded=false;
 try{
  // Request permission directly from the user gesture; never activate automatically.
  const permission=await Notification.requestPermission();
  if(permission!=='granted'){return}
  if(closed())return;
  const reg=await registration();
  const {publicKey}=await request('/key');
  const previous=read();
  const t=previous.token||token();write({token:t,active:false,pending:true});
  let sub=await reg.pushManager.getSubscription();
  const desired=keyBytes(publicKey);
  if(sub&&sub.options?.applicationServerKey){
   const actual=new Uint8Array(sub.options.applicationServerKey);
   if(actual.length!==desired.length||actual.some((x,i)=>x!==desired[i])){await sub.unsubscribe();sub=null}
  }
  sub=sub||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:desired});
  if(closed()){await unregister();return}
  await request('/subscribe',{token:t,subscription:sub.toJSON()});
  if(closed()){await unregister();return}
  write({token:t,active:true,pending:false});succeeded=true;
 }catch(err){
  if(read().pending)try{await unregister()}catch{}
 }finally{busy=false;paint();if(!succeeded&&!closed()&&Notification.permission==='granted'&&!read().pending)report('Tilmelding kunne ikke bekræftes. Prøv igen.');}
}
function reconcile(){
 if(busy){paint();return}
 const state=read();
 if(state.pending||(state.active&&(closed()||(supported()&&Notification.permission!=='granted'))))void stop();
 else paint();
}
$('pushEnable').addEventListener('click',start);
$('pushDisable').addEventListener('click',stop);
window.reconcileCorrespondence=reconcile;
window.addEventListener('online',reconcile);
window.addEventListener('storage',e=>{if(e.key===storeKey||e.key==='maartens-brokvagt-pages-v1')reconcile()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)reconcile()});
reconcile();
})();
