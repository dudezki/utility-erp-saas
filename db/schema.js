import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, uniqueIndex, primaryKey, foreignKey, check } from 'drizzle-orm/sqlite-core';
export const registrations=sqliteTable('registrations',{
 id:text('id').primaryKey(),full_name:text('full_name').notNull(),first_name:text('first_name'),middle_name:text('middle_name'),last_name:text('last_name'),suffix:text('suffix'),email:text('email').notNull(),normalized_email:text('normalized_email').notNull(),company_name:text('company_name').notNull(),
 request_key:text('request_key').notNull(),request_fingerprint:text('request_fingerprint').notNull(),privacy_version:text('privacy_version').notNull(),created_at:text('created_at').notNull(),updated_at:text('updated_at').notNull(),deleted_at:text('deleted_at')
},t=>[uniqueIndex('uq_registrations_request_key').on(t.request_key)]);
export const previewSubscriptions=sqliteTable('preview_subscriptions',{
 id:text('id').primaryKey(),registration_id:text('registration_id').notNull().references(()=>registrations.id),package_version_id:text('package_version_id').references(()=>packageVersions.id),package_listing_id:text('package_listing_id').references(()=>packageListings.id),package_code:text('package_code').notNull(),package_version:text('package_version').notNull(),package_name:text('package_name').notNull(),modules_snapshot:text('modules_snapshot').notNull(),module_codes_snapshot:text('module_codes_snapshot'),voucher_code:text('voucher_code').notNull(),status:text('status').notNull(),created_at:text('created_at').notNull(),updated_at:text('updated_at').notNull(),deleted_at:text('deleted_at')
},t=>[uniqueIndex('uq_preview_subscriptions_registration').on(t.registration_id),foreignKey({columns:[t.package_version_id,t.package_listing_id],foreignColumns:[packageListings.package_version_id,packageListings.id]})]);
export const registrationRateLimits=sqliteTable('registration_rate_limits',{
 bucket_key:text('bucket_key').primaryKey(),request_count:integer('request_count').notNull(),created_at:text('created_at').notNull()
});


// Global public-offer catalog. Private registrations/subscriptions are separate.
const catalogLifecycle = () => ({
 created_at: text('created_at').notNull(),
 updated_at: text('updated_at').notNull(),
 deleted_at: text('deleted_at')
});
export const packages = sqliteTable('packages', {
 id: text('id').primaryKey(),
 code: text('code').notNull().unique(),
 ...catalogLifecycle()
});
export const packageVersions = sqliteTable('package_versions', {
 id: text('id').primaryKey(),
 package_id: text('package_id').notNull().references(() => packages.id),
 version_code: text('version_code').notNull(),
 display_name: text('display_name').notNull(),
 publication_status: text('publication_status').notNull().default('draft'),
 published_at: text('published_at'),
 ...catalogLifecycle()
}, t => [
 uniqueIndex('uq_package_versions_code').on(t.package_id, t.version_code),
 check('ck_package_versions_status', sql`${t.publication_status} IN ('draft','published')`),
 check('ck_package_versions_published_at', sql`${t.publication_status} <> 'published' OR ${t.published_at} IS NOT NULL`)
]);
export const catalogModules = sqliteTable('catalog_modules', {
 id: text('id').primaryKey(),
 code: text('code').notNull().unique(),
 display_name: text('display_name').notNull(),
 availability_status: text('availability_status').notNull().default('planned'),
 ...catalogLifecycle()
}, t => [check('ck_catalog_modules_status', sql`${t.availability_status} IN ('planned','preview','available')`)]);
export const packageModules = sqliteTable('package_modules', {
 package_version_id: text('package_version_id').notNull().references(() => packageVersions.id),
 module_id: text('module_id').notNull().references(() => catalogModules.id),
 display_order: integer('display_order').notNull().default(0)
}, t => [primaryKey({columns:[t.package_version_id,t.module_id]})]);
export const packagePrices = sqliteTable('package_prices', {
 id: text('id').primaryKey(),
 package_version_id: text('package_version_id').notNull().references(() => packageVersions.id),
 currency: text('currency').notNull(),
 billing_interval: text('billing_interval').notNull(),
 amount_minor: integer('amount_minor').notNull(),
 publication_status: text('publication_status').notNull().default('draft'),
 valid_from: text('valid_from').notNull(),
 valid_until: text('valid_until'),
 ...catalogLifecycle()
}, t => [
 uniqueIndex('uq_package_prices_version_id').on(t.package_version_id,t.id),
 check('ck_package_prices_amount', sql`${t.amount_minor} >= 0`),
 check('ck_package_prices_status', sql`${t.publication_status} IN ('draft','published')`),
 check('ck_package_prices_interval', sql`${t.valid_until} IS NULL OR ${t.valid_until} > ${t.valid_from}`)
]);
export const packageListings = sqliteTable('package_listings', {
 id: text('id').primaryKey(),
 package_version_id: text('package_version_id').notNull().references(() => packageVersions.id),
 price_id: text('price_id'),
 market_code: text('market_code').notNull(),
 locale: text('locale').notNull(),
 currency: text('currency').notNull(),
 billing_interval: text('billing_interval').notNull(),
 offer_kind: text('offer_kind').notNull(),
 sales_status: text('sales_status').notNull(),
 is_public: integer('is_public',{mode:'boolean'}).notNull().default(false),
 badge: text('badge').notNull(),
 summary: text('summary').notNull(),
 is_featured: integer('is_featured',{mode:'boolean'}).notNull().default(false),
 display_order: integer('display_order').notNull().default(0),
 visible_from: text('visible_from').notNull(),
 visible_until: text('visible_until'),
 ...catalogLifecycle()
}, t => [
 uniqueIndex('uq_package_listings_version_market').on(t.package_version_id,t.market_code,t.locale,t.currency,t.billing_interval),
 uniqueIndex('uq_package_listings_version_id').on(t.package_version_id,t.id),
 foreignKey({columns:[t.package_version_id,t.price_id],foreignColumns:[packagePrices.package_version_id,packagePrices.id]}),
 check('ck_package_listings_kind', sql`${t.offer_kind} IN ('preview','inquiry','paid')`),
 check('ck_package_listings_sales', sql`${t.sales_status} IN ('open','inquiry_only','closed')`),
 check('ck_package_listings_paid_price', sql`${t.offer_kind} <> 'paid' OR ${t.price_id} IS NOT NULL`),
 check('ck_package_listings_interval', sql`${t.visible_until} IS NULL OR ${t.visible_until} > ${t.visible_from}`),
 check('ck_package_listings_public_boolean', sql`${t.is_public} IN (0,1)`),
 check('ck_package_listings_featured_boolean', sql`${t.is_featured} IN (0,1)`)
]);
