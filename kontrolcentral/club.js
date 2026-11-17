(() => {
'use strict';
const byId=id=>document.getElementById(id);
const tokenKey='brokkommission-club-subscription-token';
const reportKey='brokkommission-club-unsent-report';
const actions=[...document.querySelectorAll('button')];
const codePattern=/^[a-f0-9]{64}$/;
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),byte=>byte.toString(16).padStart(2,'0')).join('');
const getCode=id=>byId(id).value.trim();
const showMode=()=>{
  const writing=location.hash==='#melding';
  byId('author').hidden=!writing;
  byId('member').hidden=writing;
};
window.addEventListener('hashchange',showMode);
showMode();

async function api(path,body){
  const response=await fetch(new URL(path,window.BROK_PUSH_ENDPOINT),{
    method:body?'POST':'GET',
    headers:body?{'Content-Type':'application/json'}:{},
    body:body?JSON.stringify(body):undefined,
    cache:'no-store',
    credentials:'omit',
    signal:AbortSignal.timeout(12000)
  });
  if(!response.ok)throw new Error(response.status===403?'Adgangskoden blev afvist.':'Forbindelsen til Kontrolcentralen mislykkedes. Prøv igen.');
  return response.json();
}

const supported='serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
async function registration(){
  const reg=await navigator.serviceWorker.register('./sw.js');
  if(reg.active)return reg;
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise((_,reject)=>setTimeout(()=>reject(new Error('Genindlæs siden og prøv igen.')),10000))
  ]);
}
function decode(value){
  const base64=value.replace(/-/g,'+').replace(/_/g,'/');
  return Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length/4)*4,'=')),c=>c.charCodeAt(0));
}
function action(button,codeField,statusField,run){
  byId(button).addEventListener('click',async()=>{
    const status=byId(statusField);
    const code=getCode(codeField);
    if(!codePattern.test(code)){status.textContent='Indtast din adgangskode.';return}
    actions.forEach(item=>{item.disabled=true});
    try{status.textContent=await run(code)}
    catch(error){status.textContent=error.message||'Handlingen mislykkedes. Prøv igen.'}
    finally{actions.forEach(item=>{item.disabled=false})}
  });
}
action('read','memberCode','memberStatus',async code=>{
  const list=byId('reports');
  list.replaceChildren();
  const {reports}=await api('/club/reports',{code});
  const dateFormat=new Intl.DateTimeFormat('da-DK',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Copenhagen'});
  for(const report of reports){
    const item=document.createElement('li');
    item.textContent='Melding modtaget '+dateFormat.format(report.created_at);
    list.append(item);
  }
  return reports.length?'Meldinger fra Kammerat Mårten':'Der er endnu ingen meldinger.';
});
byId('memberCode').addEventListener('input',()=>{byId('reports').replaceChildren();byId('memberStatus').textContent='';});
action('on','memberCode','memberStatus',async code=>{
  if(!supported)return 'Åbn Kontrolcentralen i en understøttet browser. På iPhone skal du føje siden til hjemmeskærmen først.';
  if(await Notification.requestPermission()!=='granted')return 'Notifikationer er slået fra i browseren.';
  const reg=await registration();
  const {publicKey}=await api('/key');
  const token=localStorage.getItem(tokenKey)||random();
  localStorage.setItem(tokenKey,token);
  const existing=await reg.pushManager.getSubscription();
  const sub=existing||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:decode(publicKey)});
  try{await api('/club/subscribe',{code,token,subscription:sub.toJSON()});}
  catch(error){if(!existing)await sub.unsubscribe().catch(()=>{});throw error}
  return 'Notifikationer er slået til på denne enhed.';
});
action('off','memberCode','memberStatus',async code=>{
  const token=localStorage.getItem(tokenKey);
  const reg=supported?await navigator.serviceWorker.getRegistration('./sw.js'):null;
  const sub=reg&&await reg.pushManager.getSubscription();
  if(sub)await sub.unsubscribe();
  if(token)await api('/club/unsubscribe',{code,token});
  localStorage.removeItem(tokenKey);
  return 'Notifikationer er slået fra på denne enhed.';
});
action('send','authorCode','authorStatus',async code=>{
  const id=sessionStorage.getItem(reportKey)||random();
  sessionStorage.setItem(reportKey,id);
  await api('/club/report',{code,id});
  sessionStorage.removeItem(reportKey);
  byId('authorCode').value='';
  return 'Din melding er sendt til madklubben.';
});
})();
