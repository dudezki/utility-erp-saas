# Database naming and reusable column standards

Phase 1 decisions confirmed by the user: plural table names, underscore naming, singular foreign-key names, soft deletion and UUIDv7 for new entity IDs. This document governs physical migrations; uppercase singular ERD labels remain logical entity names.

## Naming

Use lowercase snake_case for schema objects and columns. Tables are plural: people, organizations, parties, accounts, service_agreements, worker_assignments. Foreign keys describe the singular referenced entity or role: person_id, organization_id, account_id, client_membership_id, provider_tenant_id. Subtype keys remain party_id because they reference parties. Normal entity primary keys are id; tenant-owned entity keys are (tenant_id, id). Exceptions include subtype/shared keys and pure junction keys.

Use explicit mappings for irregular plurals: person -> people, party -> parties. Do not generate foreign keys by blindly removing a trailing s. Timestamp names end in _at; calendar dates end in _on. Use descriptive constraint names such as pk_accounts, fk_accounts_tenant, uq_accounts_tenant_number and ix_accounts_tenant_status. Keep names within PostgreSQL's identifier limit using deterministic suffixes where needed.

Use database-generated UUIDv7 for new entity IDs with a vetted generator supported by the selected PostgreSQL version; verify support in Phase 2. Do not silently substitute another UUID version. UUID timestamps do not replace created_at or business ordering. Existing referenced identities and natural catalog codes are not regenerated.

## Reusable column sets

| Set | Columns | Applies to |
| --- | --- | --- |
| Entity identity | id uuid | Standalone entities; UUIDv7 on creation |
| Tenant ownership | tenant_id uuid NOT NULL | Tenant-private entities, included in keys and foreign keys |
| Creation | created_at timestamptz NOT NULL, created_by uuid | Business records; actor nullable only for explicit system/bootstrap writes |
| Mutable lifecycle | updated_at timestamptz NOT NULL, updated_by uuid | Editable records; initialize updated_at at creation |
| Soft deletion | deleted_at timestamptz NULL, deleted_by uuid NULL | Records supporting reversible removal |
| Optimistic concurrency | row_version bigint NOT NULL DEFAULT 1 | Mutable records subject to concurrent commands |

created_by, updated_by and deleted_by reference global authentication users, not people or tenant memberships. Audit events additionally record tenant membership and assignment context. Background writes without a human actor require explicit system/job context in audit records; do not fabricate a user. Actor FK existence alone does not establish authority: enforce actor/membership context in authorized operations.

Implement reusable migration helpers/definitions and application query policies. Avoid PostgreSQL table inheritance and a universal ORM base class that forces every column onto every table. Database constraints and migrations remain authoritative.

## Table categories and exceptions

- Mutable tenant business entities: identity + ownership + creation + mutable lifecycle; add soft deletion when removal is supported and row_version for concurrency-sensitive records.
- Global mutable catalog entities: same lifecycle sets without tenant_id. Published package versions/prices become immutable; retire offerings explicitly rather than deleting subscription history.
- Collaboration entities: client_tenant_id and provider_tenant_id replace generic tenant_id; contract/assignment status and effective dates control authority. Soft deletion cannot revoke grants by itself.
- Pure junctions: composite relationship key and necessary domain dates; add audit/lifecycle columns only when the link is independently administered. New standalone link IDs, if required, use UUIDv7.
- Audit/outbox events and issued financial facts: append-only creation/event context; no ordinary update or soft-delete workflow. Corrections, reversals, retention and dispatch state follow explicit domain policies. Mutable job/delivery state belongs separately from immutable event facts.
- Person/organization subtypes: share the parent party key; identity lifecycle belongs to the parent. No duplicate independent IDs or conflicting soft-delete state.

Do not add a universal status column: account status, contract status and subscription status have different allowed transitions. Do not store derived balances as shared columns.

## Soft-delete behavior

Default authorized operational queries exclude deleted_at rows; provide explicit privileged historical/restore paths. Delete and restore must update actor/timestamp/version metadata and append audit events in the same transaction. Database procedures/triggers or controlled write paths must enforce lifecycle invariants.

A foreign key can still reference a soft-deleted row. Reject new operational references to deleted parents and define archive/restrict behavior per aggregate; never blindly cascade soft deletion across financial history. Existing invoices retain their original references and snapshots.

Use partial unique indexes for active-only uniqueness only where historical reuse is allowed. Account numbers, invoice numbers and financial idempotency keys normally remain reserved after archival. Restore conflicts must return a clear conflict rather than overwrite another row. Deletion of a person is not deletion of their login or all their assignments; evaluate those lifecycles independently.

Soft deletion is not anonymization or erasure. Define Philippine privacy retention and lawful deletion procedures separately before real data is used.

## Phase 2 verification

Check actual migration names against the conventions; verify UUIDv7 generation, composite tenant FKs, deleted-row filtering, restricted historical access, active uniqueness and restore conflicts, row_version conflict handling, actor attribution and append-only financial/audit policies.
