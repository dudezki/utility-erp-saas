// Owned in-memory D1 verification; never connects to hosted storage or real providers.
import assert from 'node:assert/strict';
import {readFile,readdir,mkdir} from 'node:fs/promises';
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
 for(const path of ['/app-preview','/app-preview/','/app-preview/index.html']){
  const response=await mf.dispatchFetch(base+path);assert.equal(response.status,200);assert.match(response.headers.get('content-security-policy'),/script-src 'self'/);assert.match(await response.text(),/Sandbox · Synthetic data/);
  const head=await mf.dispatchFetch(base+path,{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
  assert.equal((await mf.dispatchFetch(base+path,{method:'POST'})).status,405);
 }
 assert.equal((await mf.dispatchFetch(base+'/app-preview/unknown')).status,404);
 console.log('PASS: isolated real D1 migrations, Core/Billing/Operations preservation, Solar16 planned modules, immutable version, pinned voucher signup/concurrent retry and withdrawal protection.');
 if(process.argv.includes('--browser')){
  const modulePath=process.argv[process.argv.indexOf('--playwright-module')+1];
  const {chromium}=await import(modulePath);const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  try{
   const local=(await mf.ready).toString();
   for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
    const page=await browser.newPage({viewport});page.setDefaultTimeout(12000);
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
    const sampleLink=page.getByRole('link',{name:'Explore sample workspace'});
    assert.equal(await sampleLink.getAttribute('href'),'/app-preview?package=solar-preview');
    const requested=[];const errors=[];page.on('request',r=>requested.push(new URL(r.url()).pathname));page.on('pageerror',e=>errors.push(e.message));
    await sampleLink.click();await page.waitForFunction(()=>document.querySelector('#new-record')||document.querySelector('main .error-state'));assert.equal(await page.locator('#new-record').count(),1,await page.locator('main').innerText());await page.locator('#new-record').waitFor();
    const search=()=>page.getByRole('searchbox',{name:'Search sample records'});
    const filter=()=>page.getByRole('combobox',{name:'Filter sample stage'});
    const sort=()=>page.getByRole('combobox',{name:'Sort sample records'});
    const editor=()=>page.locator('.record-form');
    const create=async(name,solar=true)=>{await page.locator('#new-record').click();await editor().locator('[name=name]').fill(name);if(solar)await editor().locator('[name=capacity]').fill('12.4');await editor().locator('[name=next]').fill('Synthetic QA next step');await editor().locator('[type=submit]').click();await page.locator('#record-dialog').waitFor({state:'hidden'});};
    const reset=async()=>{await page.locator('#reset-workspace').click();await page.locator('#confirm-reset').click();await page.locator('#reset-dialog').waitFor({state:'hidden'});};
    assert.equal(await page.locator('#workspace-select').inputValue(),'sample-solar');
    assert.equal(await page.locator('#module-nav button.nav-button').count(),17);
    assert.ok((await page.locator('.preview-banner').innerText()).includes('Synthetic data'));
    assert.ok((await page.locator('.workspace-footer').innerText()).includes('planned'));
    await search().fill('Acacia');assert.equal(await page.locator('tbody tr').count(),1);
    await page.getByRole('button',{name:'View Sample Acacia Residence',exact:true}).click();
    await page.locator('#record-dialog').waitFor({state:'visible'});
    assert.ok((await page.locator('#record-content').innerText()).includes('separate from registration'));
    assert.equal(await editor().locator('[name=name]').evaluate(e=>e===document.activeElement),true);
    await page.keyboard.press('Escape');await page.locator('#record-dialog').waitFor({state:'hidden'});
    await search().fill('no matching sample');await page.getByRole('heading',{name:'No sample records match'}).waitFor();
    await search().fill('');await filter().selectOption('Commissioning');assert.equal(await page.locator('tbody tr').count(),1);await filter().selectOption('all');
    const created='Sample QA project '+viewport.width,edited=created+' edited';
    await create(created);assert.equal(await page.locator('tbody tr').count(),5);
    await page.getByRole('button',{name:'Edit '+created,exact:true}).click();
    await editor().locator('[name=name]').fill(edited);await editor().locator('[name=stage]').selectOption('Complete');
    await editor().locator('[type=submit]').click();await page.locator('#record-dialog').waitFor({state:'hidden'});
    assert.equal(await page.getByRole('combobox',{name:'Status for '+edited,exact:true}).inputValue(),'Complete');
    await page.reload();await page.locator('#new-record').waitFor();
    assert.equal(await page.getByRole('combobox',{name:'Status for '+edited,exact:true}).inputValue(),'Complete');
    await page.getByRole('combobox',{name:'Status for '+edited,exact:true}).selectOption('Installation');
    await page.reload();await page.locator('#new-record').waitFor();assert.equal(await page.getByRole('combobox',{name:'Status for '+edited,exact:true}).inputValue(),'Installation');
    await sort().selectOption('name');const names=await page.locator('tbody .record-button').allTextContents();assert.deepEqual(names,[...names].sort((a,b)=>a.localeCompare(b)));
    await sort().selectOption('recent');assert.equal(await page.locator('tbody .record-button').first().innerText(),edited);
    await search().fill(edited);assert.equal(await page.locator('tbody tr').count(),1);await search().fill('');
    await page.locator('#workspace-select').selectOption('sample-core');assert.equal(await page.locator('tbody tr').count(),4);
    assert.equal(await page.getByRole('button',{name:'View '+edited,exact:true}).count(),0);
    const coreName='Sample QA account '+viewport.width;await create(coreName,false);
    await page.locator('#workspace-select').selectOption('sample-solar');assert.equal(await page.getByRole('button',{name:'View '+edited,exact:true}).count(),1);
    await reset();assert.equal(await page.locator('tbody tr').count(),4);assert.equal(await page.getByRole('button',{name:'View '+edited,exact:true}).count(),0);
    await page.locator('#workspace-select').selectOption('sample-core');assert.equal(await page.getByRole('button',{name:'View '+coreName,exact:true}).count(),1);await reset();
    await page.locator('#workspace-select').selectOption('sample-solar');
    const hostile='Sample <img src=x onerror=window.__sandboxXss=1>';
    await page.evaluate(name=>{const key='utility-erp-synthetic-sandbox-v1:sample-solar',data=JSON.parse(localStorage.getItem(key));data.rows[0].name=name;data.rows[0].unexpected_private_field='not retained';localStorage.setItem(key,JSON.stringify(data));},hostile);
    await page.reload();await page.locator('#new-record').waitFor();
    assert.equal(await page.getByRole('button',{name:'View '+hostile,exact:true}).count(),1);assert.equal(await page.locator('main img').count(),0);assert.equal(await page.evaluate(()=>window.__sandboxXss),undefined);
    await page.getByRole('combobox',{name:'Status for '+hostile,exact:true}).selectOption('Complete');
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('utility-erp-synthetic-sandbox-v1:sample-solar')).rows.some(r=>'unexpected_private_field'in r)),false);
    await page.evaluate(()=>localStorage.setItem('utility-erp-synthetic-sandbox-v1:sample-solar',JSON.stringify({version:1,rows:[{name:'invalid'}]})));
    await page.reload();await page.locator('#new-record').waitFor();assert.equal(await page.locator('tbody tr').count(),4);assert.match(await page.locator('#storage-status').innerText(),/unavailable|invalid/i);await reset();
    if(viewport.width<800){
     assert.equal(await page.locator('#sidebar').evaluate(e=>e.inert),true);await page.locator('#menu-toggle').click();assert.equal(await page.locator('#sidebar').evaluate(e=>e.inert),false);
     assert.ok(await page.locator('#sidebar').evaluate(e=>e.contains(document.activeElement)));await page.keyboard.press('Escape');assert.equal(await page.locator('#sidebar').evaluate(e=>e.inert),true);assert.equal(await page.evaluate(()=>document.activeElement.id),'menu-toggle');
    }
    const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert.ok(layout.scroll<=layout.width,JSON.stringify(layout));
    if(process.argv.includes('--screenshots')){const directory=process.argv[process.argv.indexOf('--screenshots')+1];await mkdir(directory,{recursive:true});await page.screenshot({path:directory+'/app-preview-'+viewport.width+'.png',fullPage:true});}
    for(const [code,count] of [['sample-core',5],['sample-billing',9],['sample-operations',13],['sample-solar',17]]){
     await page.locator('#workspace-select').selectOption(code);assert.equal(await page.locator('#module-nav button.nav-button').count(),count);
     if(code==='sample-core'){assert.ok(!(await page.locator('main').innerText()).includes('Reading review'));assert.ok(!(await page.locator('#module-nav').innerText()).includes('Meters & readings'));}
     if(viewport.width<800)await page.locator('#menu-toggle').click();await page.locator('#module-nav button.nav-button').nth(1).click();assert.ok((await page.locator('h1').innerText()).length>0);
    }
    assert.ok(requested.every(path=>!path.startsWith('/api/')),'sample app never requests operational or registration APIs');assert.deepEqual(errors,[]);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.goto(local+'app-preview?package=%3Cscript%3E');await page.locator('#new-record').waitFor();assert.equal(await page.locator('#workspace-select').inputValue(),'sample-solar');
    await page.route('**/app-preview/catalog.json',route=>route.fulfill({status:503,body:'Unavailable'}));await page.reload();await page.getByRole('heading',{name:'Sample workspace unavailable'}).waitFor();
    await page.unroute('**/app-preview/catalog.json');await page.getByRole('button',{name:'Try again'}).click();await page.locator('#new-record').waitFor();assert.ok(requested.every(path=>!path.startsWith('/api/')));assert.deepEqual(errors,[]);
    await page.close();
    const blocked=await browser.newPage({viewport});const blockedRequests=[];blocked.on('request',r=>blockedRequests.push(new URL(r.url()).pathname));
    await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Synthetic storage disabled','SecurityError');}}));
    await blocked.goto(local+'app-preview?package=solar-preview');await blocked.locator('#new-record').waitFor();assert.match(await blocked.locator('#storage-status').innerText(),/unavailable/i);
    await blocked.locator('#new-record').click();await blocked.locator('.record-form [name=name]').fill('Sample in-memory project');await blocked.locator('.record-form [type=submit]').click();await blocked.locator('#record-dialog').waitFor({state:'hidden'});
    assert.equal(await blocked.getByRole('button',{name:'View Sample in-memory project',exact:true}).count(),1);assert.match(await blocked.locator('#storage-status').innerText(),/could not save|this tab/i);
    await blocked.locator('#workspace-select').selectOption('sample-core');await blocked.locator('#workspace-select').selectOption('sample-solar');assert.equal(await blocked.getByRole('button',{name:'View Sample in-memory project',exact:true}).count(),1);
    await blocked.reload();await blocked.locator('#new-record').waitFor();assert.equal(await blocked.getByRole('button',{name:'View Sample in-memory project',exact:true}).count(),0);assert.ok(blockedRequests.every(path=>!path.startsWith('/api/')));await blocked.close();
   }
  }finally{await browser.close();}
  console.log('PASS: desktop/mobile actual local registration→sandbox, create/edit/status/sort/search, browser persistence, workspace isolation/reset, hostile/invalid storage safety, blocked-storage fallback, mobile focus/no overflow and no operational API requests.');
 }
}finally{await mf.dispose();console.log('Disposed only the owned in-memory verification runtime.');}
