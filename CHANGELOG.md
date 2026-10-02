# Changelog

## 1.0.1 — 2026-10-02

- Crop snapping no longer zooms out or drifts on dense screens: growth is penalised and capped at 12%, ties keep the
  original window, and a window moves only when that clears a clearly visible cut. Measured on a real 93-slide
  manual: 7 crops move (all better or equal in visual QA) instead of 84.

## 1.0.0 — 2026-10-02

First stable release, after a clean-room trial: a fresh Claude Code session with only the installed plugin built a
two-role manual (PPTX + PDF) for the demo app from a plain-language request.

- Screenshot crops no longer slice through UI text at their edges: the 16:9 window is grown/shifted slightly to
  the candidate whose edges cross the least ink (`tests/test_crop.py`).
- Contents slide shows each chapter number before its title instead of after it.

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
