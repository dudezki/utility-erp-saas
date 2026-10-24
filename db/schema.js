import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const registrations=sqliteTable('registrations',{
 id:text('id').primaryKey(),full_name:text('full_name').notNull(),first_name:text('first_name'),middle_name:text('middle_name'),last_name:text('last_name'),suffix:text('suffix'),email:text('email').notNull(),normalized_email:text('normalized_email').notNull(),company_name:text('company_name').notNull(),
 request_key:text('request_key').notNull(),request_fingerprint:text('request_fingerprint').notNull(),privacy_version:text('privacy_version').notNull(),created_at:text('created_at').notNull(),updated_at:text('updated_at').notNull(),deleted_at:text('deleted_at')
},t=>[uniqueIndex('uq_registrations_request_key').on(t.request_key)]);
export const previewSubscriptions=sqliteTable('preview_subscriptions',{
 id:text('id').primaryKey(),registration_id:text('registration_id').notNull().references(()=>registrations.id),package_code:text('package_code').notNull(),package_version:text('package_version').notNull(),package_name:text('package_name').notNull(),modules_snapshot:text('modules_snapshot').notNull(),voucher_code:text('voucher_code').notNull(),status:text('status').notNull(),created_at:text('created_at').notNull(),updated_at:text('updated_at').notNull(),deleted_at:text('deleted_at')
},t=>[uniqueIndex('uq_preview_subscriptions_registration').on(t.registration_id)]);
export const registrationRateLimits=sqliteTable('registration_rate_limits',{
 bucket_key:text('bucket_key').primaryKey(),request_count:integer('request_count').notNull(),created_at:text('created_at').notNull()
});
