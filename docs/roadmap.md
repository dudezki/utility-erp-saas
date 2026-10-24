# Delivery roadmap

Status reflects artifacts actually created, not deployed functionality. No dates are committed; estimate milestones after confirming requirements and runtime support.

Phase 1 now includes [Top-level ERD v1](phase-1-erd.md), with cardinalities, keys, tenant boundaries and Phase 2 migration order.

The [landing-page design](landing-page-design.md) adds marketing copy, responsive page structure and a database-driven public package catalog. Phase 2 includes its catalog foundation and landing skeleton; real checkout and managed staffing activation follow the later commercial workflows.

| Phase | Deliverables | Exit criteria | Status |
| --- | --- | --- | --- |
| 1. Planning | Scope, architecture, normalized people/company relationships, workflows, acceptance criteria | Planning baseline available; Philippines confirmed; utility-specific decisions recorded | Baseline prepared |
| 2. Workspace foundation | Application skeleton, database, migrations, sample tenants, authentication, tenant controls, startup instructions | Application runs in supported workspace runtime; tenant isolation verified | Pending |
| 3. Meter-to-cash prototype | Accounts, connections, meters, validated readings, tariffs, billing, invoices, recorded payments | Complete synthetic billing cycle; billing and retry/concurrency checks pass | Pending |
| 4. Operational workflows | Approval controls, adjustments, arrears, work orders, customer portal, reports | Role-based workflows and report reconciliation pass | Pending |
| 5. Pilot readiness | Approved tariffs, selected integrations, deployment configuration, monitoring, backup/restore and operational runbooks | Security, recovery and billing reconciliation validated; pilot scope accepted | Pending |

Production prerequisites include a hosting destination, domain, identity configuration, data residency and retention requirements, approved regulatory billing configuration, support ownership and recovery objectives. Infrastructure provisioning is a later task after the destination is selected.

Next step: implement Phase 2 with synthetic data, retaining open jurisdiction decisions as configuration requirements.

Scope extension: [subscription packages and managed staffing](subscriptions-and-staffing.md). Phase 1 defines module entitlements and cross-tenant staffing; Phase 2 includes access foundations; Phase 3 validates controlled external-worker access; Phase 4 delivers subscription administration and staffing workflows; Phase 5 validates commercial integrations and contractual controls.
