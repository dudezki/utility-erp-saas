-- Immutable authorized catalog data release only; no private records/prices/integrations.
-- Fixed vetted UUIDv7 IDs; existing packages, published mappings and subscriptions untouched.
INSERT INTO catalog_modules(id,code,display_name,availability_status,created_at,updated_at) VALUES('01a175f3-739e-7618-9f91-428b5c38dcb9','party_directory','People & company directory','planned',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(code) DO NOTHING;
--> statement-breakpoint
INSERT INTO catalog_modules(id,code,display_name,availability_status,created_at,updated_at) VALUES('01a175f3-739e-7618-9f91-459b87097d46','customer_accounts','Customer accounts','planned',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(code) DO NOTHING;
--> statement-breakpoint
INSERT INTO catalog_modules(id,code,display_name,availability_status,created_at,updated_at) VALUES('01a175f3-739e-7618-9f91-4918dd2128c8','basic_reports','Basic operational reports','planned',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(code) DO NOTHING;
--> statement-breakpoint
INSERT INTO catalog_modules(id,code,display_name,availability_status,created_at,updated_at) VALUES('01a175f3-739e-7618-9f91-4cb9a4743709','collections','Payments & account balances','planned',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(code) DO NOTHING;
--> statement-breakpoint
INSERT INTO catalog_modules(id,code,display_name,availability_status,created_at,updated_at) VALUES('01a175f3-739e-7618-9f91-5201fab6b05d','work_orders','Field work orders','planned',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(code) DO NOTHING;
--> statement-breakpoint
INSERT INTO catalog_modules(id,code,display_name,availability_status,created_at,updated_at) VALUES('01a175f3-739e-7618-9f91-56e3febd59ee','assets','Asset management','planned',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(code) DO NOTHING;
--> statement-breakpoint
INSERT INTO catalog_modules(id,code,display_name,availability_status,created_at,updated_at) VALUES('01a175f3-739e-7618-9f91-591f23a1db2e','customer_portal','Customer portal','planned',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(code) DO NOTHING;
--> statement-breakpoint
INSERT INTO catalog_modules(id,code,display_name,availability_status,created_at,updated_at) VALUES('01a175f3-739e-7618-9f91-5d2c58e6eff5','operational_reports','Operational reporting','planned',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(code) DO NOTHING;
--> statement-breakpoint
INSERT INTO catalog_modules(id,code,display_name,availability_status,created_at,updated_at) VALUES('01a175f3-739e-7618-9f91-601c62ab9ce1','solar_commercial','Solar sales, proposals & project contracts','planned',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(code) DO NOTHING;
--> statement-breakpoint
INSERT INTO catalog_modules(id,code,display_name,availability_status,created_at,updated_at) VALUES('01a175f3-739e-7618-9f91-64d8412b8a69','solar_site_surveys','Solar site surveys & load assessment','planned',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(code) DO NOTHING;
--> statement-breakpoint
INSERT INTO catalog_modules(id,code,display_name,availability_status,created_at,updated_at) VALUES('01a175f3-739e-7618-9f91-6ad19ef98aa4','solar_engineering','PV / battery engineering & design reviews','planned',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(code) DO NOTHING;
--> statement-breakpoint
INSERT INTO catalog_modules(id,code,display_name,availability_status,created_at,updated_at) VALUES('01a175f3-739e-7618-9f91-6ec17387db23','solar_procurement','Solar BOM, procurement & serial inventory','planned',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(code) DO NOTHING;
--> statement-breakpoint
INSERT INTO catalog_modules(id,code,display_name,availability_status,created_at,updated_at) VALUES('01a175f3-739e-7618-9f91-7119bcd573dd','solar_projects','Solar installation, QA & commissioning','planned',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(code) DO NOTHING;
--> statement-breakpoint
INSERT INTO catalog_modules(id,code,display_name,availability_status,created_at,updated_at) VALUES('01a175f3-739e-7618-9f91-765ec8204984','solar_interconnection','Solar permits & grid-connection workflow','planned',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(code) DO NOTHING;
--> statement-breakpoint
INSERT INTO catalog_modules(id,code,display_name,availability_status,created_at,updated_at) VALUES('01a175f3-739e-7618-9f91-7ad9f295224a','solar_monitoring','Read-only solar monitoring & performance','planned',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(code) DO NOTHING;
--> statement-breakpoint
INSERT INTO catalog_modules(id,code,display_name,availability_status,created_at,updated_at) VALUES('01a175f3-739e-7618-9f91-7d7162c686df','solar_service','Solar O&M, warranty & service contracts','planned',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(code) DO NOTHING;
--> statement-breakpoint
INSERT INTO packages(id,code,created_at,updated_at) VALUES('01a175f3-739e-7618-9f91-817cf7ce6360','solar-preview',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(code) DO NOTHING;
--> statement-breakpoint
INSERT INTO package_versions(id,package_id,version_code,display_name,publication_status,created_at,updated_at) SELECT '01a175f3-739e-7618-9f91-858e946dc8b2',id,'solar-preview-v1','Solar EPC & O&M','draft',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now') FROM packages WHERE code='solar-preview' ON CONFLICT(package_id,version_code) DO NOTHING;
--> statement-breakpoint
INSERT INTO package_modules(package_version_id,module_id,display_order) SELECT pv.id,cm.id,0 FROM package_versions pv JOIN packages p ON p.id=pv.package_id CROSS JOIN catalog_modules cm WHERE p.code='solar-preview' AND pv.version_code='solar-preview-v1' AND pv.publication_status='draft' AND cm.code='party_directory' ON CONFLICT(package_version_id,module_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO package_modules(package_version_id,module_id,display_order) SELECT pv.id,cm.id,1 FROM package_versions pv JOIN packages p ON p.id=pv.package_id CROSS JOIN catalog_modules cm WHERE p.code='solar-preview' AND pv.version_code='solar-preview-v1' AND pv.publication_status='draft' AND cm.code='customer_accounts' ON CONFLICT(package_version_id,module_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO package_modules(package_version_id,module_id,display_order) SELECT pv.id,cm.id,2 FROM package_versions pv JOIN packages p ON p.id=pv.package_id CROSS JOIN catalog_modules cm WHERE p.code='solar-preview' AND pv.version_code='solar-preview-v1' AND pv.publication_status='draft' AND cm.code='basic_reports' ON CONFLICT(package_version_id,module_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO package_modules(package_version_id,module_id,display_order) SELECT pv.id,cm.id,3 FROM package_versions pv JOIN packages p ON p.id=pv.package_id CROSS JOIN catalog_modules cm WHERE p.code='solar-preview' AND pv.version_code='solar-preview-v1' AND pv.publication_status='draft' AND cm.code='collections' ON CONFLICT(package_version_id,module_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO package_modules(package_version_id,module_id,display_order) SELECT pv.id,cm.id,4 FROM package_versions pv JOIN packages p ON p.id=pv.package_id CROSS JOIN catalog_modules cm WHERE p.code='solar-preview' AND pv.version_code='solar-preview-v1' AND pv.publication_status='draft' AND cm.code='work_orders' ON CONFLICT(package_version_id,module_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO package_modules(package_version_id,module_id,display_order) SELECT pv.id,cm.id,5 FROM package_versions pv JOIN packages p ON p.id=pv.package_id CROSS JOIN catalog_modules cm WHERE p.code='solar-preview' AND pv.version_code='solar-preview-v1' AND pv.publication_status='draft' AND cm.code='assets' ON CONFLICT(package_version_id,module_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO package_modules(package_version_id,module_id,display_order) SELECT pv.id,cm.id,6 FROM package_versions pv JOIN packages p ON p.id=pv.package_id CROSS JOIN catalog_modules cm WHERE p.code='solar-preview' AND pv.version_code='solar-preview-v1' AND pv.publication_status='draft' AND cm.code='customer_portal' ON CONFLICT(package_version_id,module_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO package_modules(package_version_id,module_id,display_order) SELECT pv.id,cm.id,7 FROM package_versions pv JOIN packages p ON p.id=pv.package_id CROSS JOIN catalog_modules cm WHERE p.code='solar-preview' AND pv.version_code='solar-preview-v1' AND pv.publication_status='draft' AND cm.code='operational_reports' ON CONFLICT(package_version_id,module_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO package_modules(package_version_id,module_id,display_order) SELECT pv.id,cm.id,8 FROM package_versions pv JOIN packages p ON p.id=pv.package_id CROSS JOIN catalog_modules cm WHERE p.code='solar-preview' AND pv.version_code='solar-preview-v1' AND pv.publication_status='draft' AND cm.code='solar_commercial' ON CONFLICT(package_version_id,module_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO package_modules(package_version_id,module_id,display_order) SELECT pv.id,cm.id,9 FROM package_versions pv JOIN packages p ON p.id=pv.package_id CROSS JOIN catalog_modules cm WHERE p.code='solar-preview' AND pv.version_code='solar-preview-v1' AND pv.publication_status='draft' AND cm.code='solar_site_surveys' ON CONFLICT(package_version_id,module_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO package_modules(package_version_id,module_id,display_order) SELECT pv.id,cm.id,10 FROM package_versions pv JOIN packages p ON p.id=pv.package_id CROSS JOIN catalog_modules cm WHERE p.code='solar-preview' AND pv.version_code='solar-preview-v1' AND pv.publication_status='draft' AND cm.code='solar_engineering' ON CONFLICT(package_version_id,module_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO package_modules(package_version_id,module_id,display_order) SELECT pv.id,cm.id,11 FROM package_versions pv JOIN packages p ON p.id=pv.package_id CROSS JOIN catalog_modules cm WHERE p.code='solar-preview' AND pv.version_code='solar-preview-v1' AND pv.publication_status='draft' AND cm.code='solar_procurement' ON CONFLICT(package_version_id,module_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO package_modules(package_version_id,module_id,display_order) SELECT pv.id,cm.id,12 FROM package_versions pv JOIN packages p ON p.id=pv.package_id CROSS JOIN catalog_modules cm WHERE p.code='solar-preview' AND pv.version_code='solar-preview-v1' AND pv.publication_status='draft' AND cm.code='solar_projects' ON CONFLICT(package_version_id,module_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO package_modules(package_version_id,module_id,display_order) SELECT pv.id,cm.id,13 FROM package_versions pv JOIN packages p ON p.id=pv.package_id CROSS JOIN catalog_modules cm WHERE p.code='solar-preview' AND pv.version_code='solar-preview-v1' AND pv.publication_status='draft' AND cm.code='solar_interconnection' ON CONFLICT(package_version_id,module_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO package_modules(package_version_id,module_id,display_order) SELECT pv.id,cm.id,14 FROM package_versions pv JOIN packages p ON p.id=pv.package_id CROSS JOIN catalog_modules cm WHERE p.code='solar-preview' AND pv.version_code='solar-preview-v1' AND pv.publication_status='draft' AND cm.code='solar_monitoring' ON CONFLICT(package_version_id,module_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO package_modules(package_version_id,module_id,display_order) SELECT pv.id,cm.id,15 FROM package_versions pv JOIN packages p ON p.id=pv.package_id CROSS JOIN catalog_modules cm WHERE p.code='solar-preview' AND pv.version_code='solar-preview-v1' AND pv.publication_status='draft' AND cm.code='solar_service' ON CONFLICT(package_version_id,module_id) DO NOTHING;
--> statement-breakpoint
UPDATE package_versions SET publication_status='published',published_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE package_id=(SELECT id FROM packages WHERE code='solar-preview') AND version_code='solar-preview-v1' AND publication_status='draft';
--> statement-breakpoint
INSERT INTO package_listings(id,package_version_id,market_code,locale,currency,billing_interval,offer_kind,sales_status,is_public,badge,summary,is_featured,display_order,visible_from,created_at,updated_at) SELECT '01a175f3-739e-7618-9f91-8b4511aa1974',pv.id,'PH','en-PH','PHP','monthly','preview','open',1,'SOLAR COMPANIES · PLANNED','For solar installers, system integrators and O&M providers: proposed sales-to-commissioning and lifetime service modules. Preview selection only; operational tools and integrations are not active.',0,3,strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now') FROM package_versions pv JOIN packages p ON p.id=pv.package_id WHERE p.code='solar-preview' AND pv.version_code='solar-preview-v1' AND pv.publication_status='published' ON CONFLICT(package_version_id,market_code,locale,currency,billing_interval) DO NOTHING;
