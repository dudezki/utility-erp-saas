import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {serveProgress} from '../worker/progress.js';
const body=await readFile(new URL('../public/progress.json',import.meta.url),'utf8');
test('public progress is independently readable without database/auth bindings',async()=>{
 const r=serveProgress(new Request('https://example.invalid/progress.json'),body);
 assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/application\/json/);
 assert.equal(r.headers.get('cache-control'),'no-store, max-age=0');
 const data=await r.json();assert.ok(data.modules.length>=12);assert.equal(new Set(data.modules.map(m=>m.module_code)).size,data.modules.length);assert.equal(data.modules.filter(m=>m.is_current_priority).length,1);
 assert.equal(data.progress_basis.is_production_readiness,false);
 for(const module of data.modules)assert.equal(module.completion_percent,module.completed_checkpoints.length*20);
 assert.equal(typeof data.latest_update.summary,'string');assert.ok(Array.isArray(data.latest_update.verification));
 assert.ok(data.data_as_of);assert.ok(data.published_snapshot_at);
 assert.equal(data.evidence,undefined);assert.equal(data.registrations,undefined);assert.equal(data.subscriptions,undefined);
 assert.deepEqual(Object.keys(data).sort(),['schema_version','project_name','data_as_of','timezone','current_phase','current_milestone','current_work_state','current_priority','progress_basis','published_snapshot_at','source_url','update_policy','modules','packages','latest_update'].sort());
});
test('progress permits only GET/HEAD and has no public update operation',async()=>{
 assert.equal((await serveProgress(new Request('https://example.invalid/progress.json',{method:'HEAD'}),body).text()),'');
 for(const method of ['POST','PUT','PATCH','DELETE'])assert.equal(serveProgress(new Request('https://example.invalid/progress.json',{method}),body).status,405);
 assert.equal(serveProgress(new Request('https://example.invalid/progress.json')).status,503);
});

test('package stats match the canonical catalog and scoped module evidence',async()=>{
 const {previewCatalogData}=await import('../scripts/preview-catalog-data.mjs');
 const {solarCatalogData}=await import('../scripts/solar-catalog-data.mjs');
 const data=JSON.parse(body);const modules=new Map(data.modules.map(m=>[m.module_code,m]));
 const expected=[...previewCatalogData.packages,...solarCatalogData.packages];
 assert.equal(data.packages.length,expected.length);
 for(const p of data.packages){
  assert.deepEqual(p.module_codes,expected.find(e=>e.code===p.package_code).module_codes);
  const members=p.module_codes.map(c=>modules.get(c));assert.ok(members.every(Boolean));
  assert.equal(p.module_count,members.length);
  assert.equal(p.scoped_milestones_complete,members.filter(m=>m.completion_percent===100).length);
  assert.equal(p.scoped_milestones_in_progress,members.filter(m=>m.completion_percent>0&&m.completion_percent<100).length);
  assert.equal(p.scoped_milestones_not_started,members.filter(m=>m.completion_percent===0).length);
  assert.equal(p.scoped_milestones_complete+p.scoped_milestones_in_progress+p.scoped_milestones_not_started,p.module_count);
  assert.equal(p.completion_percent,null);assert.equal(p.operational_availability,'planned');
  assert.deepEqual(p.current_priority_modules,members.filter(m=>m.is_current_priority).map(m=>m.module_code));
 }
});


test('current phase and milestone match the selected module and readable page',async()=>{
 const data=JSON.parse(body);const active=data.modules.find(m=>m.is_current_priority);
 const scope=/P([1-9][0-9]*)-M([1-9][0-9]*)/.exec(active.milestone_scope);
 assert.ok(scope);assert.equal(data.current_phase,Number(scope[1]));assert.equal(data.current_milestone,`P${scope[1]}-M${scope[2]}`);
 const html=await readFile(new URL('../public/progress.html',import.meta.url),'utf8');
 assert.ok(html.includes(`Phase ${data.current_phase} / ${data.current_milestone}.`));
});
