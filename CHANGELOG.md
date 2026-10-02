# Changelog

## 1.1.0 — 2026-10-02

- **Windows support.** `manual.py --pdf` renders through PowerPoint (`scripts/render.ps1`, COM) on Windows and
  through LibreOffice anywhere it is found (`MSLIDES_SOFFICE`, PATH, or the stock install folders). The smoke test
  is now `tests/smoke.py` (pure Python; `smoke.sh` removed). Docs carry the PowerShell forms. ⚠️ The PowerPoint
  COM renderer is written to the documented API but untested until the first real Windows machine with Office.
- **`scripts/setup.py <workspace>`** — one idempotent command for the venv + requirements, Playwright + chromium
  in the workspace, and a line naming the PDF renderer found.
- **Dark template** `templates/dark.pptx` (`make_plain_template.py --theme dark`), with its worked config in
  `references/template.md` and `build_manual.DARK_COLORS`.
- **`inspect_template.py --suggest`** prints a ready-to-paste `"template"` block: layouts by placeholder type,
  the content area measured from the title placeholder, dark colours for a dark theme.
- **Markdown export**: `manual.py --md` (and `scripts/export_md.py`) writes one `.md` per edition with the
  tables, steps, tips and each shot cropped like its slide with the numbered boxes drawn (`out/md-images/`).
- CI: `.github/workflows/smoke.yml` runs the smoke test and the crop test on Ubuntu (with LibreOffice, so PDF
  export is exercised) and Windows.
- All text files are read and written as UTF-8 explicitly (Windows defaulted to cp1252 and failed on a manifest).
  Both CI lanes are green: Ubuntu renders real PDFs through LibreOffice; Windows captures and builds the demo.

## 1.0.2 — 2026-10-02

- Crop snapping never moves the top edge down (page titles live there) and keeps 12 px around every mark; the
  move threshold drops to 4% of an edge so cut headings get fixed. QA on a real 93-slide manual: 22 crops move,
  none worse.
- Demo: the first Viewer step marks the whole top bar, so the crop keeps the app name; shots re-captured.
- README: slide images from the demo build and a short "How it works".

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
