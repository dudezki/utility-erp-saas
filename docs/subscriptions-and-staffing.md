# Phase 1 — Subscription packages and managed staffing

Status: proposed logical design based on the requested business model; no implementation yet.

The [top-level ERD](phase-1-erd.md) refines this conceptual list: a client-local person supplies external identity, and assignment-derived access_grant supplies assignment access, without duplicate identity/access tables. Prices identify immutable package versions; entitlements are derived projections.

## Business model

A utility tenant subscribes to a package containing modules. Separately, it may obtain people and operational services from a staffing-provider tenant, including a provider operated by the SaaS company. A utility can therefore operate with no internal staff while remaining the owner of its operational records and accountable for its utility operations.

The platform operator manages the catalog, subscriptions and staffing marketplace or managed-service arrangements. The platform operator is an administrative authority, not a shared tenant containing every customer's operational data. If it also supplies staff, its staffing business uses an explicit provider tenant.

## Packages and entitlements

| Table | Responsibility |
| --- | --- |
| module | Stable capability codes, such as customer management, metering or billing |
| package / package_version | Commercial offering and immutable published versions |
| package_module | Modules and limits included in a version |
| price | Currency, billing interval, amount and effective dates |
| subscription | Tenant, package version, price, term and lifecycle status |
| subscription_addon | Optional modules or additional capacity with effective dates |
| entitlement | Resolved module access and limits for a tenant and period |
| usage_record | Idempotent metering of explicitly defined billable quantities |
| platform_invoice / platform_payment | SaaS charges and receipts, separate from utility customer bills |

Example packages for planning, with prices to be decided:

| Package | Proposed modules |
| --- | --- |
| Core | Party/account management, service connections, basic reports |
| Billing | Core plus meters, readings, tariffs, billing and collections |
| Operations | Billing plus work orders, assets and customer portal |

Managed staffing is a separate service contract that can be bundled commercially with a package. Hiring a worker does not automatically activate a paid module. Module dependencies must be validated when publishing packages and selecting add-ons.

Published package versions are immutable so catalog changes do not silently change existing subscriptions. Define upgrade/downgrade effective dates, proration, renewal, grace periods and suspension policies before charging. Preserve historical data on downgrade; define read/export access explicitly. Never automatically disconnect electricity because a utility's SaaS subscription is overdue.

Effective access requires all applicable conditions: tenant entitlement, valid user membership or external assignment, role permission, record scope, and approval policy. Enforce these server-side, in workers and integrations as well as UI navigation. Package limits are commercial controls, not substitutes for tenant isolation.

## External staffing model

| Table | Responsibility |
| --- | --- |
| provider_profile | Staffing-provider tenant and approved service offerings |
| worker_profile | Provider-scoped person, qualifications and availability |
| service_contract | Explicit client/provider tenant pair, service scope, term and commercial terms |
| staffing_request | Client's requested role, capacity, location and dates |
| worker_assignment | Contract, provider worker reference, client role, scope and effective dates |
| client_external_identity | Client-local identity for an external worker, with minimal necessary profile |
| assignment_access | Assignment-linked client membership, permissions and scope |
| timesheet / service_delivery | Submitted work and client acceptance where applicable |
| service_invoice | Staffing charges, separate from utility customer and SaaS billing |

Avoid generic foreign keys that let one tenant link arbitrarily to another tenant's private party records. Keep the tenant-scoped identity model. Introduce a dedicated collaboration boundary with explicit client_tenant_id and provider_tenant_id, constrained provider/worker references, contract checks and narrowly authorized APIs. Client records reference the client-local external identity. Do not deduplicate private parties globally.

The provider manages its own employment and worker records. The client receives only the worker details needed for the engagement. Operational work happens in the client's tenant, with tenant selection visible to the worker. A provider administrator cannot inspect client customers or invoices merely because their company supplies staff.

## Assignment lifecycle

1. Client requests a service, or signs a managed-operation agreement with a provider.
2. Client and provider approve the scope and terms through authorized representatives.
3. Provider proposes qualified workers; the client or explicitly delegated client administrator approves assignments.
4. Create a time-bounded client membership linked to the assignment, with least-privilege roles and branch/account/work-order scope.
5. Record actions in the client audit trail with authenticated user, client identity, provider and assignment context.
6. Expiry or revocation removes assignment-derived access, invalidates relevant sessions and stops delegated jobs; completed records remain attributable.

Do not create accounts from a contract alone or permit workers to approve their own assignment. Independent assignments and direct memberships must be evaluated separately on revocation. Client-owned automation uses explicit service identities rather than a departed worker's login.

## Utility without internal employees

The client designates an accountable owner or authorized representative, who need not be its employee. It can delegate administration and operations through documented contracts. Provider staff can perform customer service, meter reading, billing and collections within their assigned permissions. Separation of duties still applies: the same worker must not prepare and approve the same bill merely by switching roles or provider affiliations.

The platform can coordinate operations, but software membership does not establish employment, professional qualification, regulatory authority or permission to perform electrical work. Confirm Philippine labor, contracting, privacy and utility requirements before a live staffing offering. Collect only the qualification evidence required for each service.

## Acceptance criteria

- A tenant's package activates exactly its included modules and approved add-ons; direct API calls cannot bypass entitlements.
- Existing subscribers retain their published package version when new packages are released.
- A provider worker can work in an assigned client tenant without seeing another client's records.
- An expired assignment blocks new operations, including queued delegated work, without removing historical audit attribution.
- Provider administrators cannot access client operational data without a separate approved assignment.
- One utility completes the demo workflow using only assigned external workers and an accountable client representative.
- SaaS charges, staffing charges and customer electricity bills reconcile independently.

## Delivery placement

Phase 1: package/module design, collaboration boundary, delegation and commercial policies.

Phase 2: entitlement infrastructure, catalog seed data, tenant access and assignment-aware authorization foundations.

Phase 3: demonstrate billing under entitlements; use a controlled external-worker assignment to validate access. Automated subscription charging is not required for the billing prototype.

Phase 4: provider onboarding, service contracts, assignment workflows, timesheets and managed staffing operations; subscription lifecycle administration.

Phase 5: validate commercial billing integrations, privacy boundaries, contract requirements and access revocation before pilot.
