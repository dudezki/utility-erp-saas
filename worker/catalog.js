import {v7 as uuidv7} from 'uuid';
import {previewCatalogData} from '../scripts/preview-catalog-data.mjs';

export class CatalogSelectionError extends Error {
 constructor(message){super(message);this.status=400;}
}
function json(value,status=200,head=false){return new Response(head?null:JSON.stringify(value),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});}
function selections(options){
 const values={market:options.market??'PH',locale:options.locale??'en-PH',currency:options.currency??'PHP',interval:options.interval??'monthly'};
 if(values.market!=='PH'||values.locale!=='en-PH'||values.currency!=='PHP'||values.interval!=='monthly')throw new CatalogSelectionError('This market, locale, currency or billing interval is not supported.');
 return values;
}

// Only offer catalog tables are queried here. Never join registrations or subscriptions.
export async function getPublicCatalog(env,options={}){
 const scope=selections(options);
 if(!env.DB)throw new Error('Catalog storage unavailable');
 const now=new Date().toISOString();
 const listingResult=await env.DB.prepare(`
  SELECT * FROM (SELECT ROW_NUMBER() OVER (PARTITION BY p.code ORDER BY pv.published_at DESC,pv.id DESC,l.id) AS selection_rank,
    (SELECT count(*) FROM package_modules counts WHERE counts.package_version_id=pv.id) AS module_count,
    p.code,pv.id AS package_version_id,pv.version_code,pv.display_name,pv.published_at,
    l.id AS package_listing_id,l.badge,l.summary,l.is_featured,l.display_order,l.offer_kind,l.sales_status,
    pp.id AS price_id,pp.amount_minor,pp.currency AS price_currency,pp.billing_interval AS price_interval
  FROM package_listings l
  JOIN package_versions pv ON pv.id=l.package_version_id
  JOIN packages p ON p.id=pv.package_id
  LEFT JOIN package_prices pp ON pp.id=l.price_id AND pp.package_version_id=pv.id
  WHERE p.deleted_at IS NULL AND pv.deleted_at IS NULL AND l.deleted_at IS NULL
    AND pv.publication_status='published' AND pv.published_at IS NOT NULL AND pv.published_at<=?
    AND l.is_public=1 AND l.sales_status IN ('open','inquiry_only')
    AND l.market_code=? AND l.locale=? AND l.currency=? AND l.billing_interval=?
    AND l.visible_from<=? AND (l.visible_until IS NULL OR l.visible_until>?)
    AND ((l.offer_kind IN ('preview','inquiry') AND l.price_id IS NULL)
      OR (l.offer_kind='paid' AND pp.publication_status='published' AND pp.deleted_at IS NULL
        AND pp.currency=l.currency AND pp.billing_interval=l.billing_interval
        AND pp.valid_from<=? AND (pp.valid_until IS NULL OR pp.valid_until>?)))
    AND EXISTS(SELECT 1 FROM package_modules pm WHERE pm.package_version_id=pv.id)
    AND NOT EXISTS(SELECT 1 FROM package_modules pm JOIN catalog_modules cm ON cm.id=pm.module_id
      WHERE pm.package_version_id=pv.id AND cm.deleted_at IS NOT NULL)
  ) WHERE selection_rank=1
  ORDER BY display_order,package_listing_id LIMIT 50`).bind(now,scope.market,scope.locale,scope.currency,scope.interval,now,now,now,now).all();
 const unique=new Map();
 for(const row of listingResult.results??[]){
  if(typeof row.code!=='string'||!/^[a-z][a-z0-9_-]{0,63}$/.test(row.code))continue;
  if(!unique.has(row.code))unique.set(row.code,row);
 }
 const rows=[...unique.values()].sort((a,b)=>a.display_order-b.display_order||a.package_listing_id.localeCompare(b.package_listing_id));
 let moduleRows=[];
 if(rows.length){
  const ids=rows.map(row=>row.package_version_id);
  const result=await env.DB.prepare(`SELECT pm.package_version_id,cm.code,cm.display_name,cm.availability_status
   FROM package_modules pm JOIN catalog_modules cm ON cm.id=pm.module_id
   WHERE pm.package_version_id IN (${ids.map(()=>'?').join(',')}) AND cm.deleted_at IS NULL
   ORDER BY pm.package_version_id,pm.display_order,cm.code LIMIT 2000`).bind(...ids).all();
  moduleRows=result.results??[];
 }
 const packages=rows.flatMap(row=>{
  const modules=moduleRows.filter(m=>m.package_version_id===row.package_version_id);
  if(modules.length!==Number(row.module_count))return [];
  return [{
   id:row.code,name:String(row.display_name).slice(0,120),badge:String(row.badge).slice(0,80),featured:row.is_featured===1,
   summary:String(row.summary).slice(0,500),offer_kind:row.offer_kind,sales_status:row.sales_status,
   price:row.offer_kind==='paid'?{id:row.price_id,amount_minor:row.amount_minor,currency:row.price_currency,billing_interval:row.price_interval}:null,
   modules:modules.map(m=>String(m.display_name).slice(0,160)),module_codes:modules.map(m=>m.code),
   module_details:modules.map(m=>({code:m.code,name:String(m.display_name).slice(0,160),availability_status:m.availability_status})),
   package_version_id:row.package_version_id,version_code:row.version_code,package_listing_id:row.package_listing_id
  }];
 });
 return {source:'database',status:'preview_catalog',currency:scope.currency,market:scope.market,locale:scope.locale,interval:scope.interval,packages};
}

export async function handleCatalog(request,env){
 if(!['GET','HEAD'].includes(request.method))return json({error:'Method not allowed.'},405);
 try{
  const query=new URL(request.url).searchParams;
  for(const name of query.keys())if(!['market','locale','currency','interval'].includes(name))throw new CatalogSelectionError('Unsupported catalog filter.');
  const options=Object.fromEntries(query);
  return json(await getPublicCatalog(env,options),200,request.method==='HEAD');
 }catch(error){return json({error:error instanceof CatalogSelectionError?error.message:'The package catalog is temporarily unavailable.'},error instanceof CatalogSelectionError?400:503,request.method==='HEAD');}
}

async function authorized(request,key){
 if(typeof key!=='string'||key.length<32)return false;
 const expected=new TextEncoder().encode('Bearer '+key),actual=new TextEncoder().encode(request.headers.get('authorization')??'');
 // Fixed expected length comparison avoids accidental empty-secret authorization.
 if(expected.length!==actual.length)return false;
 let difference=0;for(let i=0;i<expected.length;i++)difference|=expected[i]^actual[i];
 return difference===0;
}
async function boundedBody(request){
 const reader=request.body?.getReader();if(!reader)throw Error('body');let bytes=0;const chunks=[];
 for(;;){const {value,done}=await reader.read();if(done)break;bytes+=value.length;if(bytes>256){await reader.cancel();throw Error('size');}chunks.push(value);}
 const all=new Uint8Array(bytes);let position=0;for(const chunk of chunks){all.set(chunk,position);position+=chunk.length;}
 return JSON.parse(new TextDecoder().decode(all));
}

// Purpose-limited initial preview seed. No arbitrary SQL, catalog overwrite or PII access.
export async function bootstrapCatalog(request,env){
 if(request.method!=='POST')return json({error:'Method not allowed.'},405);
 if(!await authorized(request,env.CATALOG_ADMIN_KEY))return json({error:'Not authorized.'},401);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON required.'},415);
 let body;try{body=await boundedBody(request);}catch{return json({error:'Invalid setup request.'},400);}
 if(!body||body.action!=='seed_preview_catalog_v1'||Object.keys(body).some(k=>k!=='action'))return json({error:'Unsupported setup action.'},422);
 if(!env.DB)return json({error:'Catalog storage unavailable.'},503);
 try{
  const now=new Date().toISOString(),statements=[];
  for(const module of previewCatalogData.modules){
   statements.push(env.DB.prepare(`INSERT INTO catalog_modules(id,code,display_name,availability_status,created_at,updated_at)
    VALUES (?,?,?,?,?,?) ON CONFLICT(code) DO NOTHING`).bind(uuidv7(),module.code,module.display_name,module.availability_status,now,now));
  }
  for(const [position,pkg] of previewCatalogData.packages.entries()){
   statements.push(env.DB.prepare('INSERT INTO packages(id,code,created_at,updated_at) VALUES (?,?,?,?) ON CONFLICT(code) DO NOTHING').bind(uuidv7(),pkg.code,now,now));
   statements.push(env.DB.prepare(`INSERT INTO package_versions(id,package_id,version_code,display_name,publication_status,created_at,updated_at)
    SELECT ?,id,?,?,'draft',?,? FROM packages WHERE code=?
    ON CONFLICT(package_id,version_code) DO NOTHING`).bind(uuidv7(),previewCatalogData.version_code,pkg.name,now,now,pkg.code));
   for(const [modulePosition,code] of pkg.module_codes.entries()){
    statements.push(env.DB.prepare(`INSERT INTO package_modules(package_version_id,module_id,display_order)
     SELECT pv.id,cm.id,? FROM package_versions pv JOIN packages p ON p.id=pv.package_id CROSS JOIN catalog_modules cm
     WHERE p.code=? AND pv.version_code=? AND pv.publication_status='draft' AND cm.code=?
     ON CONFLICT(package_version_id,module_id) DO NOTHING`).bind(modulePosition,pkg.code,previewCatalogData.version_code,code));
   }
   statements.push(env.DB.prepare(`UPDATE package_versions SET publication_status='published',published_at=?,updated_at=?
    WHERE package_id=(SELECT id FROM packages WHERE code=?) AND version_code=? AND publication_status='draft'`).bind(now,now,pkg.code,previewCatalogData.version_code));
   statements.push(env.DB.prepare(`INSERT INTO package_listings(id,package_version_id,market_code,locale,currency,billing_interval,offer_kind,sales_status,is_public,badge,summary,is_featured,display_order,visible_from,created_at,updated_at)
    SELECT ?,pv.id,'PH','en-PH','PHP','monthly','preview','open',1,?,?,?,?,?,?,? FROM package_versions pv JOIN packages p ON p.id=pv.package_id
    WHERE p.code=? AND pv.version_code=? AND pv.publication_status='published'
    ON CONFLICT(package_version_id,market_code,locale,currency,billing_interval) DO NOTHING`).bind(uuidv7(),pkg.badge,pkg.summary,pkg.featured?1:0,position,now,now,now,pkg.code,previewCatalogData.version_code));
  }
  await env.DB.batch(statements);
  return json({status:'preview_catalog_ready',packages:previewCatalogData.packages.length,prices_set:false});
 }catch{return json({error:'Catalog setup failed.'},503);}
}


// For the registration INSERT ... SELECT gate inside the same D1 batch.
// Bind order: listing ID, version ID, package code, now, now, now.
export const previewListingEligibilitySql = `SELECT 1 FROM package_listings l
 JOIN package_versions pv ON pv.id=l.package_version_id JOIN packages p ON p.id=pv.package_id
 WHERE l.id=? AND pv.id=? AND p.code=?
 AND p.deleted_at IS NULL AND pv.deleted_at IS NULL AND l.deleted_at IS NULL
 AND pv.publication_status='published' AND pv.published_at IS NOT NULL AND pv.published_at<=?
 AND l.is_public=1 AND l.sales_status='open' AND l.offer_kind='preview' AND l.price_id IS NULL
 AND l.market_code='PH' AND l.locale='en-PH' AND l.currency='PHP' AND l.billing_interval='monthly'
 AND l.visible_from<=? AND (l.visible_until IS NULL OR l.visible_until>?)
 AND EXISTS(SELECT 1 FROM package_modules pm WHERE pm.package_version_id=pv.id)
 AND NOT EXISTS(SELECT 1 FROM package_modules pm JOIN catalog_modules cm ON cm.id=pm.module_id
 WHERE pm.package_version_id=pv.id AND cm.deleted_at IS NOT NULL)`;
