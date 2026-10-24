# Phase 1 hosted preview

Source: website/ (buildless HTML, CSS, JavaScript and a sample package catalog). The Sites deployment checkout is /workspace/sites/utility-erp-preview, with a separate source repository. Its static output is dist/. The tracked Site manifest binds the exact Site identity.

The Site is private. Expected origin: https://utility-erp-foundation-preview.lj-faderon.chatgpt.site (registration alone is not evidence of publication; see the deployment record appended after successful publication).

## Delivered experience

Responsive marketing landing, synthetic operations dashboard, keyboard-operable service-cycle tabs, dynamically fetched sample package cards, managed-staffing illustration, FAQ, and informational dialogs. Provider sign-in buttons are disabled placeholders. There is no lead submission, payment, live subscription activation or worker assignment.

Package cards fetch assets/catalog.json. This is explicitly a sample catalog fixture, not a database query. The planned public database API is described in landing-page-design.md; private subscriptions are never included in this fixture.

## Local checks

- HTTP 200 for the landing page.
- JavaScript syntax check passed.
- Chromium desktop 1440px and mobile 390px renders captured.
- Three fetched package cards, workflow billing step, four disabled sign-in providers, package dialog and mobile navigation verified.
- No horizontal overflow at 390px and no browser page errors during those checks.
- Screenshots in artifacts/ are local evidence and excluded from Git.

No production ERP, PostgreSQL migrations or live authentication providers are delivered by this preview. Database integration belongs to Phase 2.

## Updating

Edit website/, validate affected interactions, then mirror those files to the Site checkout's dist/. Preserve .openai/hosting.json and private audience. Push exact Site source and publish its matching artifact/version. Never embed credentials in files or remotes. The installed Sites workflow helper was unavailable in this workspace; ordinary Git and a matching static archive are used for this initial publication.
