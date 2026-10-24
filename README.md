# Utility ERP hosted concept preview

Private Phase 1 product preview for the CEO. Static site lives in dist/. All dashboard records are synthetic. Package cards load a separate sample JSON catalog; database and authentication integrations are pending. See docs/hosted-preview.md and AGENTS.md.

Serve locally: python -m http.server 4173 --directory dist

Do not embed credentials in source. Preserve the Site identity in .openai/hosting.json and the private audience.
