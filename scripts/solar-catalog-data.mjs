// Solar EPC / operations preview only. No operational integration or commercial price.
import {previewCatalogData} from './preview-catalog-data.mjs';
export const solarModules=[
 ['solar_commercial','Solar sales, proposals & project contracts'],
 ['solar_site_surveys','Solar site surveys & load assessment'],
 ['solar_engineering','PV / battery engineering & design reviews'],
 ['solar_procurement','Solar BOM, procurement & serial inventory'],
 ['solar_projects','Solar installation, QA & commissioning'],
 ['solar_interconnection','Solar permits & grid-connection workflow'],
 ['solar_monitoring','Read-only solar monitoring & performance'],
 ['solar_service','Solar O&M, warranty & service contracts']
].map(([code,display_name])=>({code,display_name,availability_status:'planned'}));
const shared=['party_directory','customer_accounts','basic_reports','collections','work_orders','assets','customer_portal','operational_reports'];
export const solarCatalogData={
 version_code:'solar-preview-v1',
 modules:[...previewCatalogData.modules.filter(m=>shared.includes(m.code)),...solarModules],
 packages:[{code:'solar-preview',name:'Solar EPC & O&M',badge:'SOLAR COMPANIES · PLANNED',featured:false,
  summary:'For solar installers, system integrators and O&M providers: proposed sales-to-commissioning and lifetime service modules. Preview selection only; operational tools and integrations are not active.',
  module_codes:[...shared,...solarModules.map(m=>m.code)]}]
};
