# Changelog

## 0.1.0 — 2026-10-02

Initial release of MSlides.

- `mslides` skill: plan a per-role user manual from an app's code, capture real screenshots with Playwright
  (configurable login, passwords from environment variables only, loopback-only by default), mark controls with
  numbered callouts, and build editable PPTX decks (combined + one edition per role) with PDF export via Keynote or
  LibreOffice.
- Refresh mode: replay capture steps, diff the new shots against the accepted ones, and flag quoted UI labels that
  no longer exist in the app's message files.
- Bundled unbranded 16:9 template (`templates/plain.pptx`) and its generator.
- Demo app, demo manual with captured shots, and an end-to-end smoke test (`tests/smoke.sh`).
