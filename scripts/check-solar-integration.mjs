// Owned in-memory D1 verification; never connects to hosted storage or real providers.
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {Miniflare} from 'miniflare';
const key='synthetic_solar_catalog_test_key_not_a_production_secret';
const base='https://utility-erp-foundation-preview.lj-faderon.chatgpt.site';
const mf=new Miniflare({modules:true,scriptPath:'dist/server/index.js',compatibilityDate:'2026-05-01',d1Databases:{DB:'solar-owned-verification'},bindings:{CATALOG_ADMIN_KEY:key},port:0});
try{
 const db=await mf.getD1Database('DB');
 for(const name of (await readdir('drizzle')).filter(n=>n.endsWith('.sql')&&!n.startsWith('0003')).sort()){
  for(const sql of (await readFile('drizzle/'+name,'utf8')).split('--> statement-breakpoint').filter(s=>s.trim()))await db.prepare(sql).run();
 }
 const seed=action=>mf.dispatchFetch(base+'/api/admin/catalog/bootstrap',{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/json'},body:JSON.stringify({action})});
 const catalog=async()=>{const r=await mf.dispatchFetch(base+'/api/public/package-catalog');assert.equal(r.status,200);return r.json();};
 const signup=(p,request_key)=>({first_name:'Synthetic',last_name:'Solar QA',email:'solar-qa@example.invalid',company_name:'Synthetic Solar Company',package_code:p.id,package_version_id:p.package_version_id,package_listing_id:p.package_listing_id,voucher_code:'123456',consent:true,request_key});
 const post=data=>mf.dispatchFetch(base+'/api/registrations',{method:'POST',headers:{origin:base,'content-type':'application/json'},body:JSON.stringify(data)});
 assert.equal((await seed('seed_preview_catalog_v1')).status,200);
 const original=(await catalog()).packages;assert.deepEqual(original.map(p=>p.modules.length),[4,8,12]);
 const oldData=signup(original[0],crypto.randomUUID().replaceAll('-',''));
 const oldResponse=await post(oldData);assert.equal(oldResponse.status,201);const oldReceipt=await oldResponse.json();
 for(const sql of (await readFile('drizzle/0003_solar_preview_catalog.sql','utf8')).split('--> statement-breakpoint').filter(s=>s.trim()))await db.prepare(sql).run();
 assert.equal((await catalog()).packages.find(p=>p.id==='solar-preview').module_codes.length,16);
 assert.equal((await seed('seed_solar_catalog_v1')).status,200);
 const all=(await catalog()).packages;assert.deepEqual(all.map(p=>p.modules.length),[4,8,12,16]);
 assert.deepEqual(all.slice(0,3).map(p=>p.package_version_id),original.map(p=>p.package_version_id));
 const solar=all.find(p=>p.id==='solar-preview');assert.ok(solar);assert.equal(solar.version_code,'solar-preview-v1');
 assert.equal(solar.price,null);assert.ok(solar.module_details.every(m=>m.availability_status==='planned'));
 assert.equal((await seed('seed_solar_catalog_v1')).status,200);
 assert.equal((await catalog()).packages.find(p=>p.id==='solar-preview').package_version_id,solar.package_version_id);
 const data=signup(solar,crypto.randomUUID().replaceAll('-',''));
 const concurrent=await Promise.all([post(data),post(data)]);assert.ok(concurrent.every(r=>r.ok));const receipts=await Promise.all(concurrent.map(r=>r.json()));
 assert.equal(receipts[0].subscription_id,receipts[1].subscription_id);assert.equal(receipts[0].module_codes.length,16);
 assert.equal(receipts[0].package_version_id,solar.package_version_id);
 assert.equal((await (await post(oldData)).json()).subscription_id,oldReceipt.subscription_id);
 const stored=await db.prepare('SELECT package_version_id,module_codes_snapshot FROM preview_subscriptions WHERE id=?').bind(receipts[0].subscription_id).first();
 assert.equal(stored.package_version_id,solar.package_version_id);assert.equal(JSON.parse(stored.module_codes_snapshot).length,16);
 await assert.rejects(()=>db.prepare('DELETE FROM package_modules WHERE package_version_id=?').bind(solar.package_version_id).run());
 await db.prepare('UPDATE package_listings SET is_public=0 WHERE id=?').bind(solar.package_listing_id).run();
 assert.equal((await post({...data,request_key:crypto.randomUUID().replaceAll('-','')})).status,409);
 assert.equal((await post(data)).status,200);
 await db.prepare('UPDATE package_listings SET is_public=1 WHERE id=?').bind(solar.package_listing_id).run();
 assert.equal((await mf.dispatchFetch(base+'/api/registrations')).status,405);
 console.log('PASS: isolated real D1 migrations, Core/Billing/Operations preservation, Solar16 planned modules, immutable version, pinned voucher signup/concurrent retry and withdrawal protection.');
 if(process.argv.includes('--browser')){
  const modulePath=process.argv[process.argv.indexOf('--playwright-module')+1];
  const {chromium}=await import(modulePath);const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  try{
   const local=(await mf.ready).toString();
   for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
    const page=await browser.newPage({viewport});
    await page.goto(local);await page.waitForFunction(()=>document.querySelectorAll('#package-grid .package-card').length===4);
    const solarCard=page.locator('.package-card').filter({has:page.getByRole('heading',{name:'Solar EPC & O&M',exact:true})});
    assert.equal(await solarCard.locator('li').count(),16);
    await solarCard.getByRole('button',{name:'Choose this package'}).click();
    await page.waitForFunction(()=>document.activeElement?.id==='signup-first-name');
    await page.locator('[name=first_name]').fill('Synthetic');await page.locator('[name=last_name]').fill('Browser QA');
    await page.locator('[name=email]').fill('solar-browser@example.invalid');await page.locator('[name=company_name]').fill('Synthetic Solar Browser');
    await page.locator('[name=consent]').check();await page.locator('#signup-form [type=submit]').click();
    try {assert.equal(await page.locator('[name=package_code]:checked').inputValue({timeout:8000}),'solar-preview');}
    catch(error){console.error('Synthetic browser step failure',viewport,await page.locator('.signup').innerText(),await page.evaluate(()=>[...document.querySelectorAll('input:invalid')].map(i=>({name:i.name,reason:i.validationMessage}))));throw error;}
    await page.locator('[name=voucher_code]').fill('123456');await page.locator('#signup-form [type=submit]').click();
    await page.getByRole('heading',{name:'You’re registered.'}).waitFor();
    assert.ok((await page.locator('.receipt').innerText()).includes('Solar EPC & O&M'));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.close();
   }
  }finally{await browser.close();}
  console.log('PASS: desktop/mobile Solar card, all16 inclusions, selected package and actual local voucher registration.');
 }
}finally{await mf.dispose();console.log('Disposed only the owned in-memory verification runtime.');}
