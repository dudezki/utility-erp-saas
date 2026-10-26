import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {serveProgress} from '../worker/progress.js';
const body=await readFile(new URL('../public/progress.json',import.meta.url),'utf8');
test('public progress is independently readable without database/auth bindings',async()=>{
 const r=serveProgress(new Request('https://example.invalid/progress.json'),body);
 assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/application\/json/);
 assert.equal(r.headers.get('cache-control'),'no-store, max-age=0');
 const data=await r.json();assert.equal(data.modules.length,12);assert.equal(data.modules.filter(m=>m.is_current_priority).length,1);
 assert.equal(data.progress_basis.is_production_readiness,false);
 for(const module of data.modules)assert.equal(module.completion_percent,module.completed_checkpoints.length*20);
 assert.ok(data.data_as_of);assert.ok(data.published_snapshot_at);
 assert.equal(data.evidence,undefined);assert.equal(data.registrations,undefined);assert.equal(data.subscriptions,undefined);
 assert.deepEqual(Object.keys(data).sort(),['schema_version','project_name','data_as_of','timezone','current_phase','current_milestone','current_work_state','current_priority','progress_basis','published_snapshot_at','source_url','update_policy','modules'].sort());
});
test('progress permits only GET/HEAD and has no public update operation',async()=>{
 assert.equal((await serveProgress(new Request('https://example.invalid/progress.json',{method:'HEAD'}),body).text()),'');
 for(const method of ['POST','PUT','PATCH','DELETE'])assert.equal(serveProgress(new Request('https://example.invalid/progress.json',{method}),body).status,405);
 assert.equal(serveProgress(new Request('https://example.invalid/progress.json')).status,503);
});
