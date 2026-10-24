// Deliberate preview seed, not approved commercial prices or delivered modules.
export const previewCatalogData = {
 version_code: 'preview-v1',
 modules: [
  ['party_directory','People & company directory'],
  ['customer_accounts','Customer accounts'],
  ['service_connections','Premises & service connections'],
  ['basic_reports','Basic operational reports'],
  ['metering','Meter inventory & readings'],
  ['tariffs','Tariff configuration'],
  ['billing','Billing review & approval'],
  ['collections','Payments & account balances'],
  ['work_orders','Field work orders'],
  ['assets','Asset management'],
  ['customer_portal','Customer portal'],
  ['operational_reports','Operational reporting']
 ].map(([code,display_name])=>({code,display_name,availability_status:'planned'})),
 packages: [
  {code:'core-preview',name:'Core',badge:'THE FOUNDATION',featured:false,summary:'A clear starting point for customers and service connections.',module_codes:['party_directory','customer_accounts','service_connections','basic_reports']},
  {code:'billing-preview',name:'Billing',badge:'THE SERVICE CYCLE',featured:true,summary:'Connect metering, bill preparation, and the money coming in.',module_codes:['party_directory','customer_accounts','service_connections','basic_reports','metering','tariffs','billing','collections']},
  {code:'operations-preview',name:'Operations',badge:'THE CONNECTED OPERATION',featured:false,summary:'Coordinate the office, the field, and customer self-service.',module_codes:['party_directory','customer_accounts','service_connections','basic_reports','metering','tariffs','billing','collections','work_orders','assets','customer_portal','operational_reports']}
 ]
};
