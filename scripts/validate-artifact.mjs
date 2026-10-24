import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
const manifest=JSON.parse(await readFile('dist/.openai/hosting.json','utf8'));
assert.equal(manifest.project_id,'appgprj_6adcdf20802c8191833107cc4abf243b');assert.equal(manifest.static,undefined);assert.equal(manifest.d1,'DB');
const source=await readFile('dist/server/index.js','utf8');const module=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));assert.equal(typeof module.default.fetch,'function');
await access('dist/drizzle/0000_tranquil_fixer.sql');
console.log('Valid Worker artifact, exact Site identity and DB migration present.');
