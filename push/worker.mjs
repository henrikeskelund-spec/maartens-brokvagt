import { buildPushPayload } from '@block65/webcrypto-web-push';
import {slotFor,messageFor} from './schedule.mjs';
const MAX_SUBSCRIPTIONS=8;
const tokenPattern=/^[a-f0-9]{64}$/;
const b64=/^[A-Za-z0-9_-]+$/;
const allowedHosts=new Set(['fcm.googleapis.com','updates.push.services.mozilla.com','web.push.apple.com','wns2-par02p.notify.windows.com']);
function validEndpoint(endpoint){
  if(typeof endpoint!=='string'||endpoint.length>2048)return false;
  try{
    const u=new URL(endpoint);
    return u.protocol==='https:'&&!u.port&&!u.username&&!u.password&&!u.hash&&(
      allowedHosts.has(u.hostname)||u.hostname.endsWith('.push.apple.com')||u.hostname.endsWith('.notify.windows.com'));
  }catch{return false;}
}
function validKeys(s){
  return s&&validEndpoint(s.endpoint)&&typeof s.keys?.p256dh==='string'&&s.keys.p256dh.length===87&&b64.test(s.keys.p256dh)&&typeof s.keys?.auth==='string'&&s.keys.auth.length===22&&b64.test(s.keys.auth);
}
async function hashToken(token){
  const raw=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
  return Array.from(new Uint8Array(raw),x=>x.toString(16).padStart(2,'0')).join('');
}
function reply(env,data,status=200){
  return new Response(data===null?null:JSON.stringify(data),{status,headers:{
    'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',
    'Access-Control-Allow-Origin':env.APP_ORIGIN,'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'
  }});
}
async function handle(req,env){
  if(req.headers.get('Origin')!==env.APP_ORIGIN)return new Response('Forbidden',{status:403});
  if(req.method==='OPTIONS')return reply(env,null,204);
  const path=new URL(req.url).pathname;
  if(path==='/key'&&req.method==='GET'){
    if(!env.VAPID_SERVER_PUBLIC_KEY||!env.VAPID_SERVER_PRIVATE_KEY||!env.VAPID_SUBJECT)return reply(env,{error:'not_configured'},503);
    return reply(env,{publicKey:env.VAPID_SERVER_PUBLIC_KEY});
  }
  if(req.method!=='POST'||!['/subscribe','/unsubscribe'].includes(path))return reply(env,{error:'not_found'},404);
  if(!req.headers.get('Content-Type')?.startsWith('application/json'))return reply(env,{error:'invalid_type'},415);
  const raw=await req.text();if(raw.length>8192)return reply(env,{error:'too_large'},413);
  let body;try{body=JSON.parse(raw)}catch{return reply(env,{error:'invalid_json'},400);}
  if(typeof body?.token!=='string'||!tokenPattern.test(body.token))return reply(env,{error:'invalid_token'},400);
  const token=await hashToken(body.token);
  if(path==='/unsubscribe'){
    await env.DB.prepare('DELETE FROM subscription WHERE token_hash=?').bind(token).run();
    return reply(env,{ok:true});
  }
  const sub=body.subscription;
  if(!validKeys(sub))return reply(env,{error:'invalid_subscription'},400);
  const existing=await env.DB.prepare('SELECT endpoint FROM subscription WHERE token_hash=?').bind(token).first();
  if(existing){
    if(existing.endpoint!==sub.endpoint){
      const collision=await env.DB.prepare('SELECT 1 FROM subscription WHERE endpoint=?').bind(sub.endpoint).first();
      if(collision)return reply(env,{error:'endpoint_in_use'},409);
    }
    await env.DB.prepare('UPDATE subscription SET endpoint=?,p256dh=?,auth=? WHERE token_hash=?').bind(sub.endpoint,sub.keys.p256dh,sub.keys.auth,token).run();
    return reply(env,{ok:true});
  }
  if(typeof body.invitation!=='string'||body.invitation.length>128||!env.ENROLLMENT_CODE||await hashToken(body.invitation)!==await hashToken(env.ENROLLMENT_CODE))return reply(env,{error:'invitation_required'},403);
  const result=await env.DB.prepare('INSERT OR IGNORE INTO subscription(endpoint,token_hash,p256dh,auth,created_at) SELECT ?,?,?,?,? WHERE (SELECT COUNT(*) FROM subscription) < ?').bind(sub.endpoint,token,sub.keys.p256dh,sub.keys.auth,Date.now(),MAX_SUBSCRIPTIONS).run();
  if(!result.meta.changes)return reply(env,{error:'subscription_unavailable'},409);
  return reply(env,{ok:true});
}
export async function sendSlot(env,slot){
  if(!env.VAPID_SERVER_PUBLIC_KEY||!env.VAPID_SERVER_PRIVATE_KEY||!env.VAPID_SUBJECT)throw new Error('Missing VAPID configuration');
  const {results}=await env.DB.prepare('SELECT endpoint,token_hash,p256dh,auth FROM subscription WHERE last_slot<>? LIMIT 8').bind(slot.id).all();
  const message=messageFor(slot);
  for(const row of results){
    // Claim before send so a repeated scheduled invocation cannot resend the same directive.
    const claim=await env.DB.prepare('UPDATE subscription SET last_slot=? WHERE token_hash=? AND last_slot<>?').bind(slot.id,row.token_hash,slot.id).run();
    if(!claim.meta.changes)continue;
    if(!validEndpoint(row.endpoint))continue;
    try{
      const payload=await buildPushPayload({data:JSON.stringify(message),options:{ttl:900,urgency:'normal'}},{endpoint:row.endpoint,expirationTime:null,keys:{p256dh:row.p256dh,auth:row.auth}},{publicKey:env.VAPID_SERVER_PUBLIC_KEY,privateKey:env.VAPID_SERVER_PRIVATE_KEY,subject:env.VAPID_SUBJECT});
      const res=await fetch(row.endpoint,{...payload,redirect:'error'});
      if(res.status===404||res.status===410)await env.DB.prepare('DELETE FROM subscription WHERE token_hash=?').bind(row.token_hash).run();
      if(!res.ok&&res.status!==404&&res.status!==410)console.warn('Push delivery status',res.status);
    }catch{console.warn('Push delivery failed');}
  }
}
export default {
 async fetch(req,env){try{return await handle(req,env)}catch{return reply(env,{error:'service_error'},500);}},
 async scheduled(event,env,ctx){const slot=slotFor(event.scheduledTime);if(slot)ctx.waitUntil(sendSlot(env,slot));}
};
