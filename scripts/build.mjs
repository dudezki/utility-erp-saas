import { build } from 'esbuild';
import { cp,mkdir,readFile,readdir,rm,writeFile } from 'node:fs/promises';
const assets={};
async function walk(path,prefix=''){for(const entry of await readdir(path,{withFileTypes:true})){const key=prefix+'/'+entry.name;if(entry.isDirectory())await walk(path+'/'+entry.name,key);else assets[key]=await readFile(path+'/'+entry.name,'utf8');}}
await walk('public');
await mkdir('.generated',{recursive:true});
await writeFile('.generated/assets.js','export default '+JSON.stringify(assets)+';\n');
await rm('dist',{recursive:true,force:true});await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});
await build({entryPoints:['worker/index.js'],outfile:'dist/server/index.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:false});
await writeFile('dist/.openai/hosting.json',await readFile('.openai/hosting.json','utf8'));
const config=JSON.parse(await readFile('wrangler.json','utf8'));config.main='index.js';config.d1_databases[0].migrations_dir='../drizzle';await writeFile('dist/server/wrangler.json',JSON.stringify(config,null,2));
await cp('drizzle','dist/drizzle',{recursive:true});
console.log('Built registration Worker with embedded landing assets.');
