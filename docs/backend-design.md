# Phase 1 — Backend architecture proposal

Design only: no application, migrations or infrastructure have been created by this document. This proposal implements the boundaries in [Top-level ERD v1](phase-1-erd.md). User conventions are recorded in [Database standards](database-standards.md): plural snake_case tables, singular foreign keys, UUIDv7 entity IDs and category-specific shared columns with soft deletion. Entity labels below are logical names; physical migrations must follow those standards.

## Runtime and application shape

The [authentication design](authentication-design.md) refines the identity module: auth_users have multiple auth_identities, configured provider connections and separate contact emails. Apple, Google, Facebook and Microsoft are initially disabled placeholders; live provider integrations are not implemented.

Start with a TypeScript modular monolith backed by PostgreSQL. Next.js serves the staff/customer UI and thin server endpoints. A separate worker process runs imports, billing batches and document generation using the same application modules. Use private object storage for documents and a PostgreSQL job/outbox implementation initially. Confirm Node, database and container support in the ChatGPT workspace before selecting runnable development tooling.

The server owns business rules. UI routes and workers invoke application commands; they do not write arbitrary tables. PostgreSQL owns integrity constraints and tenant isolation. Prefer SQL migrations for composite foreign keys, deferred checks, interval exclusions and row-level security; an ORM or query builder may assist queries but cannot replace these rules. Select its library after validating these capabilities.

## Modules and ownership

| Module | Owns | Published operations |
| --- | --- | --- |
| Platform tenancy and identity | Tenant registry, login identities, memberships, capabilities | Create tenant, select tenant, manage membership |
| Access control | Roles, permissions, grants and typed scopes | Authorize operation, grant/revoke access |
| Catalog and subscriptions | Package versions, prices, subscriptions, add-ons, entitlements, usage | Publish package, change subscription, resolve entitlement |
| Party directory | People, organizations, relationships, identifiers and contacts | Register party, record relationship, audited merge |
| Staffing collaboration | Providers, contracts, approvals, assignments, timesheets | Approve contract, assign worker, revoke assignment |
| Customer and service | Accounts, account parties, premises, service agreements | Open account, connect service, change account contacts |
| Metering | Meters, installations, reading imports and validated readings | Install/replace meter, import/validate reading |
| Tariffs and billing | Versioned tariff rules, billing runs, calculations, issued utility invoices | Calculate draft, review exceptions, approve/issue |
| Utility collections | Utility payments, allocations and adjustments | Record payment, allocate, reverse through explicit correction |
| Platform commercial | SaaS invoices/payments | Issue subscription invoice, reconcile receipt |
| Staffing commercial | Contract service invoices/payments | Issue staffing invoice, record settlement |
| Operations and reporting | Work orders and authorized reporting projections | Assign work, report balances and reconciliation |
| Infrastructure | Audit, jobs/outbox, document metadata, integration adapters | Persist event, enqueue, deliver document |

Modules access another module through a declared service/query interface. Cross-module transactions use explicit orchestration in an application service; do not introduce distributed transactions or microservices initially. Financial ledgers remain separate even when they share decimal and allocation utilities. Core party, account and staffing structures support future water/internet modules; electric calculation rules remain specific to electric distribution.

## Request flow and API contract

1. Validate the session/token against the selected identity provider; use issuer/subject as the authentication identity.
2. Resolve the requested tenant through active membership. A tenant URL/header is a selection request, not authority.
3. Evaluate module entitlement, role permission, typed record scope, grant/assignment validity and separation-of-duty rules.
4. Validate a typed command payload, establish a transaction-local tenant/actor context and execute the application operation.
5. Write domain changes, audit and outbox rows atomically. Return a bounded response or job reference.

Use versioned JSON HTTP APIs with an OpenAPI contract. Illustrative route shapes are `/api/v1/tenants/{tenant}/accounts` and action commands such as `.../billing-runs/{id}/issue`; physical database names follow the confirmed database standards. Use cursor pagination, bounded filters and explicit field allowlists. Represent decimal amounts as strings with currency, instants as ISO UTC timestamps, and billing dates as local date values. Never accept client-supplied balances or calculated totals as authoritative.

Mutating externally retried commands accept an idempotency key scoped by tenant, actor/operation and request fingerprint. Reuse with different payload returns a conflict. Use an optimistic concurrency token for mutable drafts; reject stale updates. Specify one common error envelope with stable code, safe message, field errors and correlation ID; never return database internals. Long-running imports/calculation/export requests return a job reference and authorized status endpoint.

Browser sessions use secure HTTP-only cookies, CSRF protection and explicit origin checks. APIs validate token audience/expiry and do not trust unsigned user or tenant headers. Require stronger authentication for privileged actions when supported by the chosen identity provider. Customer portal authorization is a distinct account-linked grant; account_party or party relationships alone do not create access.

## Tenant isolation and collaboration access

Tenant-local parents and children use tenant-scoped composite keys/FKs as defined in the ERD. Set database context with transaction-local settings on every transaction. The application database role is neither table owner nor BYPASSRLS; enable and force row-level security on protected tables. A separate migration role owns schema changes. Pool reuse must never carry a prior tenant's context.

Global catalog reads, platform administration and two-party collaboration use dedicated repository interfaces and database policies. Do not use a global bypass role for normal tenant requests. Shared contracts permit specifically authorized representatives of their recorded client/provider tenants to see permitted contract fields; the relationship never exposes either tenant's private parties, payroll or utility accounts. Platform support requires explicit audited operational access rather than automatic platform-admin visibility.

An external assignment binds the provider worker to the matching authenticated user's client-local membership/person. Its grants must match the client tenant and approved role/scope. Authorization checks the assignment and contract status synchronously. Revocation removes only that assignment's authority; independent active grants are evaluated separately. Use actor auth_user identity to enforce self-approval restrictions across memberships.

Entitlements are derived from authoritative subscriptions and published package/add-on terms. Subscription changes and entitlement generation must be atomic, with a tenant entitlement revision for cache invalidation. Access caches include tenant, user, grant revision and entitlement revision; short expiries are supplementary. Never depend solely on a stale cached allow decision for revocation-sensitive operations.

## Transactions, concurrency and financial integrity

| Workflow | Transaction boundary and safeguards |
| --- | --- |
| Tenant creation | Tenant, operator party/organization and initial membership created atomically with deferred cyclic/subtype validation |
| Contract assignment | Lock contract/assignment state; validate both sides, worker/user match, term and approvals; create client-local references and bounded grants atomically |
| Meter replacement | Close old installation/readings and open new installation in one transaction; interval exclusions prevent overlap |
| Billing draft | Calculate deterministic decimal outputs from versioned inputs; persist calculation/version references, not mutable live tariff assumptions |
| Invoice issue | Lock selected draft/approval state; recheck permission and separation of duties; enforce unique agreement/period/type; snapshot parties/prices, issue and audit atomically |
| Payment allocation | Lock payment and target invoices in stable order; verify tenant, account policy and currency; check available payment and outstanding invoice amounts; commit allocations atomically |
| Subscription change | Validate dependencies/period overlap; update subscription and derived entitlement revision atomically |

Use database constraints for uniqueness and interval integrity, plus row locks for invariants spanning rows. Retry bounded serialization/deadlock failures only for idempotent transactions. Issued documents are append-only from the business perspective; corrections use linked adjustment/reversal records. No delete/update endpoint bypasses the financial correction workflow.

## Jobs, outbox and integrations

Application transactions append outbox events rather than calling external systems before commit. Workers claim due jobs with leases and row locking, record attempts, apply exponential backoff with jitter, and move exhausted work to a reviewable failed state. Recover expired leases. Delivery is at least once; handlers need stable deduplication keys and idempotent writes. Do not promise exactly-once external delivery.

Jobs retain tenant, initiating actor, operation, correlation ID and optional delegation context. Distinguish authorized client-owned automation from delegated human work. Delegated work rechecks membership, assignment, permission and relevant entitlement when it runs; expired authority blocks execution. Human approval is not transferable to a retry under another identity.

Imports retain file hash/source rows and row-level errors. Process in bounded chunks; make progress resumable. Invoice batches isolate each account transaction so one invalid reading does not half-commit another account's invoice. Exports and documents remain private; authorize download issuance and use short-lived links. Payment/meter integrations use tenant-scoped credentials in a secret store, signed webhook verification, replay protection and deduplication.

## Proposed repository structure

```text
apps/
  web/                 # Next.js UI and thin HTTP handlers
  worker/              # Job/outbox runner
packages/
  backend/
    modules/           # Domain/application interfaces by ownership above
    authorization/     # Central policy evaluator and scoped context
    infrastructure/    # Database, object storage, jobs and adapters
  contracts/           # API schemas, safe DTOs and generated API description
  billing-core/        # Pure decimal calculation primitives
database/
  migrations/          # Reviewed SQL including RLS and constraints
  seeds/               # Synthetic tenants, parties, packages and tariffs
docs/
```

Directory and code naming remains a backend implementation choice; database naming follows the confirmed standards. Keep database credentials and server-only modules out of browser bundles. Inject database/adapter dependencies so billing rules can be tested without HTTP or a live payment provider.

## Confirmed database conventions

Follow [Database standards](database-standards.md). Use plural snake_case tables (people), singular role-aware foreign keys (person_id), UUIDv7 for new entity IDs, and reusable column sets for timestamps, actor attribution, tenant ownership, optional concurrency and soft deletion.

Apply soft deletion to eligible mutable records. Issued financial records use corrections/reversals; audit events remain append-only. Pure junctions and subtype tables retain appropriate composite/shared keys. Collaboration rows use explicit client/provider boundaries; global catalogs do not acquire a fictitious tenant_id. Audit events preserve authorization and assignment context beyond the shared actor columns.

## Migration and delivery strategy

Phase 1 completes this backend design, the confirmed naming/shared-column standards and the logical ERD. Phase 2 validates runtime/tooling and implements foundation migrations, API skeleton, authentication adapter, tenant isolation, entitlement checks and assignment-aware policy primitives. Detailed billing/staffing behavior remains staged per the roadmap.

Migrate in dependency order from the ERD: global registry/identity/catalog, tenant parties/memberships, subscriptions, collaboration/access, utility operations, then domain integrations. Add audit/outbox and RLS with each owning table rather than deferring isolation to the end. Resolve tenant/operator cyclic references with a transactional bootstrap and deferred constraints. Use explicit versioned SQL migrations; verify clean install and upgrade paths against PostgreSQL. Published migrations are immutable; corrections use new migrations. Use expand/backfill/validate/contract for later incompatible production changes, with backup and restoration procedures before destructive operations.

Synthetic seed scenarios include two utility tenants, one provider tenant, one person with employee/customer roles, a company with multiple accounts, two provider workers assigned to different clients, and deterministic demo tariffs. No real identifiers or customer data enter seeds.

## Verification required for implementation

- PostgreSQL integration tests under the actual non-owner application role: cross-tenant reads/writes/FKs, pooled context reset, subtype checks and two-party collaboration visibility.
- Authorization matrix: direct/assigned access, module disabled, scope mismatch, expired assignment, overlapping grants and same-user self-approval attempts across tenants.
- Race tests: duplicate invoice issuance, concurrent payment allocation, assignment revocation during execution and overlapping installations/subscriptions.
- Decimal fixture and tariff boundary tests: reading replacement, tariff version changes, rounding, missing readings and deterministic recalculation; use approved Philippine tariff fixtures before live billing.
- Retry tests: duplicate imports/webhooks, worker crash after external response, stale lease recovery and failed-job replay without duplicate financial effects.
- Migration tests: empty database setup, representative upgrade and constraints/RLS retained; recovery validation before pilot.
- End-to-end synthetic utility operated entirely by external staff, with separate approver, reconciled account statements and preserved audit attribution after revocation.

Current verification is document/design review only. No runtime, security or financial tests have been executed, and no compliance claim is made.
