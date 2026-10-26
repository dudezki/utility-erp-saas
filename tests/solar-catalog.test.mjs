import test from 'node:test';
import assert from 'node:assert/strict';
import {solarCatalogData,solarModules} from '../scripts/solar-catalog-data.mjs';
import {previewCatalogData} from '../scripts/preview-catalog-data.mjs';
import {bootstrapCatalog} from '../worker/catalog.js';
test('Solar is its own pinned preview with shared capabilities and eight planned specializations',()=>{
 const p=solarCatalogData.packages[0];assert.equal(p.code,'solar-preview');assert.equal(solarCatalogData.version_code,'solar-preview-v1');
 assert.equal(solarModules.length,8);assert.equal(p.module_codes.length,16);assert.equal(new Set(p.module_codes).size,16);
 assert.ok(solarCatalogData.modules.every(m=>m.availability_status==='planned'));
 assert.deepEqual(previewCatalogData.packages.map(p=>p.module_codes.length),[4,8,12]);
 assert.ok(!p.module_codes.includes('tariffs'));assert.ok(!p.module_codes.includes('billing'));
});
test('Solar bootstrap is authenticated and accepts only a fixed action with no client catalog payload',async()=>{
 const request=body=>new Request('https://example.invalid/api/admin/catalog/bootstrap',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+ 'x'.repeat(40)},body:JSON.stringify(body)});
 assert.equal((await bootstrapCatalog(request({action:'seed_solar_catalog_v1'}),{})).status,401);
 assert.equal((await bootstrapCatalog(request({action:'seed_solar_catalog_v1',modules:[]}),{CATALOG_ADMIN_KEY:'x'.repeat(40)})).status,422);
 const queries=[];const db={prepare(sql){return {bind(...values){queries.push({sql,values});return this;}}},async batch(){}};
 const r=await bootstrapCatalog(request({action:'seed_solar_catalog_v1'}),{CATALOG_ADMIN_KEY:'x'.repeat(40),DB:db});
 assert.equal(r.status,200);assert.deepEqual(await r.json(),{status:'solar_preview_catalog_ready',packages:1,prices_set:false});
 assert.ok(queries.every(q=>!/(?:registrations|subscriptions|package_prices)/i.test(q.sql)));
 assert.ok(queries.some(q=>q.values.includes('solar-preview-v1')));
 assert.ok(queries.filter(q=>q.sql.includes('INSERT INTO package_modules')).every(q=>q.sql.includes("publication_status='draft'")));
});
