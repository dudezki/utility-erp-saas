# Phase 1 — Normalized people, companies and relationships

## Design boundary

Logical database design and normalization belong to Phase 1. Phase 2 implements and verifies SQL migrations, constraints, tenant policies and seed data. This document is a logical design, not an implemented schema.

Target third normal form for operational records: store each fact with its owning entity, use junction tables for many-to-many relationships, and avoid repeated names/contact fields across customer, employee and supplier records. Issued invoice snapshots deliberately preserve historical names, addresses and prices; later identity edits must not rewrite issued documents.

## Identity and tenancy

A party is a person or organization. Customer, employee, supplier and utility operator are roles, not separate identity copies. An organization can be a company, cooperative, government entity or another legal organization; branches are organizational units unless separately incorporated.

Tenant is the SaaS isolation boundary, not a synonym for company. Each tenant references its operator organization. Parties remain private to their tenant even if the same legal person appears in another tenant. Do not deduplicate identities across utility companies.

Authentication users are separate from business people. A user has tenant memberships; a membership may reference a person in that tenant. A customer need not have a login, and employee status alone grants no application access.

## Logical tables

All business tables below carry tenant_id. IDs and composite foreign keys must enforce same-tenant references.

| Table | Facts owned by this table |
| --- | --- |
| party | Identity ID, kind (person/organization), lifecycle status |
| person | Party ID, given/middle/family names, suffix; no login credentials |
| organization | Party ID, legal name, trading name, legal form |
| organization_unit | Organization, optional parent unit, unit code and name |
| party_role | Party, role code, effective start/end; supports multiple roles |
| party_relationship | From-party, to-party, relationship type, effective start/end |
| relationship_type | Direction, allowed endpoint kinds and relationship meaning |
| party_identifier | Party, identifier type, issuer/jurisdiction, protected value and validity |
| contact_point | Phone or email value and type |
| party_contact | Party/contact junction, purpose, preference and effective dates |
| address | Address lines, barangay, locality, province, postal code and country |
| party_address | Party/address junction, purpose and effective dates |
| account | Account number, status, currency and billing configuration |
| account_party | Account/party junction, role (holder/payer/contact), effective dates |
| premise | Physical service location and address reference |
| service_point | Connection at a premise, independent of customer identity |
| service_agreement | Account, service point, dates and tariff assignment |

Use typed columns for core relationships and business facts. Additional employment/representation attributes belong in typed extension tables keyed to the relationship if needed; do not turn core data into arbitrary JSON or an entity-attribute-value model. Organization units are not legal parties and cannot hold accounts independently without an associated legal organization.

## Relationship examples

- Maria Santos is one person party with both customer and employee roles; her login membership has separately assigned access permissions.
- ABC Manufacturing is one organization party with multiple service accounts and premises.
- Maria is an authorized representative of ABC through a dated party relationship. Her access to a specific account is scoped explicitly through account_party and server authorization; the relationship alone grants no access.
- A parent company and subsidiary are distinct organization parties connected through a directed relationship.
- A customer's account can name a separate payer without changing the service agreement or duplicating the customer.

## Integrity rules for Phase 2

1. Require exactly one subtype per party, matching party.kind; enforce across tables with transactional database constraints/triggers, not UI checks alone.
2. Include unique (tenant_id, id) parent keys and corresponding composite foreign keys. Tenant operator linkage must also stay within tenant; implement creation atomically with deferred constraints where necessary.
3. Enforce nonempty effective periods and prohibit overlapping duplicate role/relationship assignments where required. Define intervals as start-inclusive/end-exclusive.
4. Define permitted relationship directions and endpoints; prevent self-parenting and cycles for organization hierarchies.
5. Do not treat names, shared email addresses or phone numbers as unique person identifiers. Use reviewed duplicate detection and audited merges.
6. Restrict sensitive identifiers, minimize collection, and define identifier-specific uniqueness rules before implementation. Do not expose identifiers in logs or sample data.
7. Prevent deletion of identities referenced by issued financial records; use lifecycle status, audited corrections and an explicit retention policy.
8. Version address changes or create replacement address records so historical links remain meaningful. Premise location and customer mailing address are independent.
9. Define account-holder cardinality before pilot: allow multiple related parties, with explicit rules for primary holder and billing recipient. Financial balances belong to accounts, not person records.

## Philippines configuration

Set initial locale to en-PH, currency to PHP and utility timezone to Asia/Manila. Support Philippine address components without assuming all addresses have identical structure. Preserve decimal precision and explicit rounding policies for charge calculation.

Before real billing, confirm the specific utility's approved tariffs and applicable ERC requirements, BIR invoice/tax requirements, and privacy/retention obligations under Philippine law. Model charge components and exemptions as effective-dated configuration; do not assume one universal electricity rate or tax percentage. This planning document does not establish regulatory compliance.

## Acceptance examples

- One party can be both customer and employee without repeated personal details.
- A company can hold several accounts and have multiple dated representatives.
- Revoking a representative's account authorization leaves company identity and invoice history intact.
- Tenant A cannot reference Tenant B's person, company, contact or account through any junction table.
- Changing an organization's legal name does not change an issued invoice's stored recipient snapshot.
