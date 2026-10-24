import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {v7 as uuidv7} from 'uuid';
const base='http://127.0.0.1:4173';
const env={...process.env,XDG_CONFIG_HOME:process.cwd()+'/.sites-runtime/config',WRANGLER_LOG_PATH:'/tmp/utility-erp-catalog-test.log',WRANGLER_SEND_METRICS:'false'};
function sql(command,expectFailure=false){const r=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--persist-to','.wrangler/state','--json','--command',command],{encoding:'utf8',env});if(expectFailure){assert.notEqual(r.status,0,'Mutation should have been rejected');return;}if(r.status!==0)throw Error('Local SQL check failed: '+r.stderr);return JSON.parse(r.stdout);}
async function get(){const r=await fetch(base+'/api/public/package-catalog');assert.equal(r.status,200);return r.json();}
async function seed(key){return fetch(base+'/api/admin/catalog/bootstrap',{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/json'},body:JSON.stringify({action:'seed_preview_catalog_v1'})});}
assert.equal((await seed('wrong')).status,401);
assert.equal((await seed('local_catalog_test_fixture_not_a_production_secret')).status,200);
const initial=await get();assert.equal(initial.source,'database');assert.equal(initial.packages.length,3);assert.deepEqual(initial.packages.map(p=>p.modules.length),[4,8,12]);assert.ok(initial.packages.every(p=>p.price===null));
assert.equal((await seed('local_catalog_test_fixture_not_a_production_secret')).status,200);
assert.deepEqual((await get()).packages.map(p=>p.package_version_id),initial.packages.map(p=>p.package_version_id));
assert.equal((await fetch(base+'/api/public/package-catalog?tenant_id=anything')).status,400);
const chosen=initial.packages.find(p=>p.id==='billing-preview');const key=crypto.randomUUID().replaceAll('-','');
const data={first_name:'Synthetic',last_name:'Catalog QA',email:'catalog-qa@example.invalid',company_name:'Synthetic Catalog Utility',package_code:chosen.id,package_version_id:chosen.package_version_id,package_listing_id:chosen.package_listing_id,voucher_code:'123456',consent:true,request_key:key};
const post=d=>fetch(base+'/api/registrations',{method:'POST',headers:{origin:base,'content-type':'application/json'},body:JSON.stringify(d)});
let response=await post({...data,package_version_id:uuidv7()});assert.equal(response.status,409);
const simultaneous=await Promise.all([post(data),post(data)]);assert.ok(simultaneous.every(r=>r.ok));const receipts=await Promise.all(simultaneous.map(r=>r.json()));assert.equal(receipts[0].subscription_id,receipts[1].subscription_id);assert.equal(receipts[0].package_version_id,chosen.package_version_id);assert.equal(receipts[0].module_codes.length,8);
const pinned=sql(`SELECT count(*) AS n FROM preview_subscriptions WHERE id='${receipts[0].subscription_id}' AND package_version_id='${chosen.package_version_id}' AND package_listing_id='${chosen.package_listing_id}' AND module_codes_snapshot IS NOT NULL`);assert.equal(pinned[0].results[0].n,1);
sql(`UPDATE package_versions SET display_name='Unapproved edit' WHERE id='${chosen.package_version_id}'`,true);
sql(`DELETE FROM package_modules WHERE package_version_id='${chosen.package_version_id}'`,true);
// A public listing can change without an application build, but old receipts remain pinned.
try{
 sql(`UPDATE package_listings SET summary='Local catalog mutation proof' WHERE id='${chosen.package_listing_id}'`);
 assert.equal((await get()).packages.find(p=>p.id===chosen.id).summary,'Local catalog mutation proof');
 sql(`UPDATE package_listings SET is_public=0 WHERE id='${chosen.package_listing_id}'`);
 assert.equal((await get()).packages.length,2);
 response=await post({...data,request_key:crypto.randomUUID().replaceAll('-','')});assert.equal(response.status,409);
 response=await post(data);assert.equal(response.status,200);assert.equal((await response.json()).subscription_id,receipts[0].subscription_id);
}finally{sql(`UPDATE package_listings SET is_public=1,summary='${chosen.summary.replaceAll("'","''")}' WHERE id='${chosen.package_listing_id}'`);}
// A published but unlisted price is never a public price. These are local synthetic tests only.
const priceId=uuidv7();const now=new Date().toISOString();
sql(`INSERT INTO package_prices(id,package_version_id,currency,billing_interval,amount_minor,publication_status,valid_from,created_at,updated_at) VALUES ('${priceId}','${chosen.package_version_id}','PHP','monthly',9900,'published','${now}','${now}','${now}')`);
assert.ok((await get()).packages.every(p=>p.price===null));
sql(`UPDATE package_prices SET amount_minor=1 WHERE id='${priceId}'`,true);
// Future and expired listings are excluded; an explicitly listed synthetic price is visible.
try{
 sql(`UPDATE package_listings SET visible_from='2099-01-01T00:00:00.000Z',visible_until=NULL WHERE id='${chosen.package_listing_id}'`);
 assert.equal((await get()).packages.length,2);
 sql(`UPDATE package_listings SET visible_from='1990-01-01T00:00:00.000Z',visible_until='2000-01-01T00:00:00.000Z' WHERE id='${chosen.package_listing_id}'`);
 assert.equal((await get()).packages.length,2);
 sql(`UPDATE package_listings SET visible_from='2000-01-01T00:00:00.000Z',visible_until=NULL,offer_kind='paid',price_id='${priceId}' WHERE id='${chosen.package_listing_id}'`);
 assert.equal((await get()).packages.find(p=>p.id===chosen.id).price.amount_minor,9900);
 assert.equal((await post({...data,request_key:crypto.randomUUID().replaceAll('-','')})).status,409);
}finally{sql(`UPDATE package_listings SET visible_from='2000-01-01T00:00:00.000Z',visible_until=NULL,offer_kind='preview',price_id=NULL WHERE id='${chosen.package_listing_id}'`);}
// Even a public listing cannot reveal a draft version.
const draftPackage=uuidv7(),draftVersion=uuidv7(),draftListing=uuidv7(),draftCode='local-draft-'+uuidv7();
sql(`INSERT INTO packages(id,code,created_at,updated_at) VALUES ('${draftPackage}','${draftCode}','${now}','${now}');
 INSERT INTO package_versions(id,package_id,version_code,display_name,publication_status,created_at,updated_at) VALUES ('${draftVersion}','${draftPackage}','draft-v1','Synthetic Draft','draft','${now}','${now}');
 INSERT INTO package_modules(package_version_id,module_id) SELECT '${draftVersion}',id FROM catalog_modules WHERE code='customer_accounts';
 INSERT INTO package_listings(id,package_version_id,market_code,locale,currency,billing_interval,offer_kind,sales_status,is_public,badge,summary,visible_from,created_at,updated_at) VALUES ('${draftListing}','${draftVersion}','PH','en-PH','PHP','monthly','preview','open',1,'DRAFT','Must remain hidden','2000-01-01T00:00:00.000Z','${now}','${now}');`);
assert.ok(!(await get()).packages.some(p=>p.id===draftCode));
sql(`DELETE FROM package_listings WHERE id='${draftListing}'; DELETE FROM package_modules WHERE package_version_id='${draftVersion}'; DELETE FROM package_versions WHERE id='${draftVersion}'; DELETE FROM packages WHERE id='${draftPackage}';`);
const before=JSON.stringify(receipts[0]);assert.ok(!before.includes('email')&&!before.includes('company_name'));
assert.equal((await fetch(base+'/api/registrations')).status,405);
console.log('PASS: real D1 catalog, repeatable seed, database-driven changes, private-price exclusion, immutable versions/modules/prices, pinned signup, concurrent retries, withdrawal rejection and committed receipt replay.');
