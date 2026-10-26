// Public design fixtures only. Never reads registrations or ERP tenant data.
import {writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {previewCatalogData} from './preview-catalog-data.mjs';
import {solarCatalogData} from './solar-catalog-data.mjs';
export function sampleCatalog(){
 const packages=[previewCatalogData,solarCatalogData].flatMap(group=>group.packages.map(p=>({code:p.code,name:p.name,version_code:group.version_code,modules:p.module_codes.map(code=>({code,name:group.modules.find(m=>m.code===code).display_name}))})));
 return {packages,workspaces:[
  {code:'sample-core',name:'Sample Harbor Utility',package_code:'core-preview'},
  {code:'sample-billing',name:'Sample River Electric',package_code:'billing-preview'},
  {code:'sample-operations',name:'Sample Coast Operations',package_code:'operations-preview'},
  {code:'sample-solar',name:'Sample Sunfield Solar',package_code:'solar-preview'}]};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 await writeFile(new URL('../public/app-preview/catalog.json',import.meta.url),JSON.stringify(sampleCatalog(),null,2)+'\n');
 console.log('Exported public synthetic workspace layout from catalog fixtures.');
}
