import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sampleCatalog} from '../scripts/export-sample-workspaces.mjs';
test('public sample workspaces match versioned package inclusions without private records',async()=>{
 const data=JSON.parse(await readFile(new URL('../public/app-preview/catalog.json',import.meta.url),'utf8'));
 assert.deepEqual(data,sampleCatalog());
 assert.deepEqual(Object.keys(data).sort(),['packages','workspaces']);
 assert.deepEqual(data.packages.map(p=>p.modules.length),[4,8,12,16]);
 for(const p of data.packages){assert.deepEqual(Object.keys(p).sort(),['code','modules','name','version_code']);for(const m of p.modules)assert.deepEqual(Object.keys(m).sort(),['code','name']);}
 for(const w of data.workspaces){assert.deepEqual(Object.keys(w).sort(),['code','name','package_code']);assert.match(w.name,/^Sample /);assert.ok(data.packages.some(p=>p.code===w.package_code));}
});
