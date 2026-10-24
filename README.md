# Utility ERP landing and preview registration

Public hosted landing for Philippine utility ERP. The signup flow stores name, email, company, selected preview package and applied voucher in hosted D1. Test voucher: 123456. No payment method, real ERP login, email delivery or live paid subscription is created.

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
