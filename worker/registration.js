import {v7 as uuidv7} from 'uuid';
const ALLOWED_ORIGIN='https://utility-erp-foundation-preview.lj-faderon.chatgpt.site';
export function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});}
export function validate(data,packages){const errors={};if(!data||typeof data!=='object'||Array.isArray(data))return {form:'Invalid registration.'};for(const [key,label,max] of [['first_name','First name',120],['last_name','Last name',120],['company_name','Company',180]])if(typeof data[key]!=='string'||!data[key].trim()||data[key].trim().length>max)errors[key]=`${label} is required (up to ${max} characters).`;for(const [key,max] of [['middle_name',120],['suffix',30]])if(data[key]!==undefined&&(typeof data[key]!=='string'||data[key].trim().length>max))errors[key]=`Use up to ${max} characters.`;if(typeof data.email!=='string'||data.email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))errors.email='Enter a valid email address.';if(!packages.some(p=>p.id===data.package_code))errors.package_code='Choose a valid preview package.';if(data.voucher_code!=='123456')errors.voucher_code='Enter the valid preview voucher.';if(data.consent!==true)errors.consent='Please agree to storing your preview registration.';if(typeof data.request_key!=='string'||!/^[a-f0-9]{32,64}$/.test(data.request_key))errors.form='Please refresh the page and try again.';if(data.website)errors.form='Unable to accept this registration.';return errors;}
async function boundedJson(request){const reader=request.body?.getReader();if(!reader)throw Error('body');let size=0;const chunks=[];for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();throw Error('size');}chunks.push(value);}const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}return JSON.parse(new TextDecoder().decode(bytes));}
async function hash(text){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(b)].map(v=>v.toString(16).padStart(2,'0')).join('');}
export async function register(request,env,packages){
 if(request.method!=='POST')return json({error:'Method not allowed.'},405);
 const origin=request.headers.get('origin'),url=new URL(request.url);const local=['127.0.0.1','localhost'].includes(url.hostname);
 if(origin!==ALLOWED_ORIGIN&&!(local&&origin===url.origin))return json({error:'Registration must be submitted from this website.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON required.'},415);
 let data;try{data=await boundedJson(request);}catch{return json({error:'Invalid or oversized registration.'},400);}
 if(data?.name&&!data?.first_name&&!data?.last_name)return json({error:'The registration form has been updated. Please refresh and enter first and last names separately.'},422);
 const errors=validate(data,packages);if(Object.keys(errors).length)return json({error:'Please check the form.',fields:errors},422);
 if(!env.DB)return json({error:'Registration storage is unavailable. Please try again later.'},503);
 const selected=packages.find(p=>p.id===data.package_code),first_name=data.first_name.trim(),middle_name=(data.middle_name||'').trim(),last_name=data.last_name.trim(),suffix=(data.suffix||'').trim(),email=data.email.trim(),company=data.company_name.trim();
 const full_name=[first_name,middle_name,last_name,suffix].filter(Boolean).join(' ');
 const fingerprint=await hash(JSON.stringify([first_name,middle_name,last_name,suffix,email.toLowerCase(),company,selected.id,data.voucher_code]));
 try{
  const previous=await env.DB.prepare('SELECT r.request_fingerprint,s.id,s.package_name,s.status FROM registrations r JOIN preview_subscriptions s ON s.registration_id=r.id WHERE r.request_key=?').bind(data.request_key).first();
  if(previous){if(previous.request_fingerprint!==fingerprint)return json({error:'This request changed. Please start a new registration.'},409);return json({subscription_id:previous.id,package_name:previous.package_name,status:previous.status,voucher_applied:true});}
  const now=new Date().toISOString(),bucket='registrations:'+Math.floor(Date.now()/600000);
  const rate=await env.DB.prepare('INSERT INTO registration_rate_limits(bucket_key,request_count,created_at) VALUES (?,1,?) ON CONFLICT(bucket_key) DO UPDATE SET request_count=request_count+1 RETURNING request_count').bind(bucket,now).first();
  if(rate.request_count>30)return json({error:'Too many registration attempts. Please try again later.'},429);
  const registrationId=uuidv7(),subscriptionId=uuidv7();
  await env.DB.batch([
   env.DB.prepare('INSERT INTO registrations(id,full_name,first_name,middle_name,last_name,suffix,email,normalized_email,company_name,request_key,request_fingerprint,privacy_version,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(request_key) DO NOTHING').bind(registrationId,full_name,first_name,middle_name||null,last_name,suffix||null,email,email.toLowerCase(),company,data.request_key,fingerprint,'preview-v2',now,now),
   env.DB.prepare('INSERT INTO preview_subscriptions(id,registration_id,package_code,package_version,package_name,modules_snapshot,voucher_code,status,created_at,updated_at) SELECT ?,id,?,?,?,?,?,?,?,? FROM registrations WHERE request_key=? AND request_fingerprint=? ON CONFLICT(registration_id) DO NOTHING').bind(subscriptionId,selected.id,'preview-v1',selected.name,JSON.stringify(selected.modules),'123456','preview_registered',now,now,data.request_key,fingerprint)
  ]);
  const saved=await env.DB.prepare('SELECT s.id,s.package_name,s.status,r.request_fingerprint FROM preview_subscriptions s JOIN registrations r ON r.id=s.registration_id WHERE r.request_key=?').bind(data.request_key).first();
  if(!saved||saved.request_fingerprint!==fingerprint)return json({error:'This request changed. Please start a new registration.'},409);
  return json({subscription_id:saved.id,package_name:saved.package_name,status:saved.status,voucher_applied:true},201);
 }catch{return json({error:'We couldn’t save your registration. Please retry with the same details.'},503);}
}
