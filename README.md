# Utility ERP landing and preview registration

Public hosted landing for Philippine utility ERP. The public catalog now reads published package versions and module inclusions from D1. The signup flow stores first_name, last_name, optional middle_name/suffix, email, company_name, selected preview package and applied voucher in hosted D1. Test voucher: 123456. No payment method, real ERP login, email delivery or live paid subscription is created.

## Build and test

```bash
npm ci
npm run db:generate
npm run build
npm test
```

Only run db:generate after schema changes. Commit generated SQL and metadata; published migrations are immutable. Apply local migrations with Wrangler (`d1 migrations apply DB --local --persist-to .wrangler/state`) before `npm run dev`. Hosted Sites applies migrations on publication. Local D1 and hosted D1 are separate.

Source: public/ for UI, worker/ for server, db/schema.js for schema, drizzle/ for generated migrations. Build embeds static assets into dist/server/index.js. Preserve .openai/hosting.json's project identity, D1 binding and public audience. Never commit runtime database files, credentials or test submissions.

Preview subscriptions are pre-platform records, not ERP tenants or production subscriptions. Repeated requests with the same request key/payload return the same receipt; separate test registrations can use the same email. No email is considered verified. Private registrations have no public list/read endpoint.

Registration API and database columns use snake_case. First and last names are required for new requests. Migration 0001 preserves previously captured names in full_name without attempting automatic splitting; historic component fields remain null. New full_name values are display snapshots composed from the explicit components.

## Database-backed catalog (P2-M2)

GET /api/public/package-catalog supplies both the landing and signup. Published preview offers are initialized through POST /api/admin/catalog/bootstrap with JSON action seed_preview_catalog_v1, protected by runtime secret CATALOG_ADMIN_KEY. No secret is embedded in source or browser code. The purpose-limited seed is idempotent and does not overwrite published versions. It lives outside schema migrations.

Published versions, module mappings and prices cannot be mutated. Listings can be withdrawn or edited independently; registration revalidates availability inside its atomic save and pins package_version_id, package_listing_id and module snapshots. Existing registrations/subscriptions are preserved with null version references where originally absent. Unknown/unavailable offers require a fresh review. Identical retries return committed receipts even after withdrawal.

No commercial prices are approved, so the published seed has no price records and all module statuses remain planned. The schema/API supports explicit public prices; paid signup stays disabled. This does not grant live ERP entitlements. Local test-only prices are never deployed as seed data.

Real local checks: start npm run dev after applying migrations and set the ignored local .dev.vars fixture CATALOG_ADMIN_KEY to local_catalog_test_fixture_not_a_production_secret. Then run node scripts/check-catalog-integration.mjs. These tests mutate only the local D1 database, with synthetic records and restored listing visibility. Never repoint the script at production.

The legacy /assets/catalog.json URL is an API alias for old browser tabs; the static fixture has been removed. Responses are no-store, so visibility changes appear immediately. New definitions require new version records; a future authenticated administration UI is outside M2.
