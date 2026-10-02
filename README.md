# MSlides

A Claude Code plugin that turns a running web app into a **step-by-step user manual**: an editable PowerPoint
deck (plus PDF) per role, built from **real screenshots** with **numbered callout boxes** — step N on the left
always points at box N on the screenshot.

You ask Claude something like *"make a user manual for the Viewer and Editor roles of this app"* (or in Thai,
*"ทำคู่มือการใช้งานระบบนี้"*). The skill reads the app's code to plan the tasks and the exact UI wording, drives
the app with Playwright to capture each screen, builds the deck, and runs a visual QA loop with a fresh reviewer
until the slides are right. Later it can **refresh** the manual after the UI changes (replay the capture, diff the
pictures, flag button labels that no longer exist) or **edit it by chat** ("change step 2 on slide editor-02").

## Example output

The repository ships a demo: a tiny static inventory app (`examples/demo-app/`) and the manual captured from it
(`examples/demo/`). Building it produces a 14-slide combined deck plus one edition per role:

- a cover (title, edition, version and capture date) and a table of contents;
- overview tables — *Who does what*, *Stock status*;
- a **Viewer** chapter: a divider, then one slide per task — *Find your way around the item list*,
  *Search for an item*, *Open an item's details*;
- an **Editor** chapter — *Start a new item*, *Fill in and save the item*, *Check that the item was saved*;
- a reference table (*Item fields*, hidden from the Viewer edition) and a closing slide.

Each task slide has numbered steps on the left, a screenshot cropped to the relevant area on the right with an
outline box and a numbered badge per step, and a tip at the bottom. Every element is a native PowerPoint shape,
so the deck stays fully editable.

## Install

In Claude Code:

```
/plugin marketplace add JiramedFirst/MSlides
/plugin install mslides@mslides
```

Or install the skill by hand — copy the skill folder into your personal skills directory:

```bash
git clone https://github.com/JiramedFirst/MSlides.git
cp -R MSlides/plugin/skills/mslides ~/.claude/skills/
```

## Prerequisites

- **Python 3.10+** with the packages in `plugin/skills/mslides/requirements.txt`
  (`python-pptx`, `Pillow`, `lxml`, `defusedxml`) — the skill installs them into a venv in your workspace.
- **Node 18+** and **Playwright** with Chromium: `npm i -D playwright && npx playwright install chromium`
  (in your app's repo, the manual workspace, or any `node_modules` reachable through `NODE_PATH`).
- Optional, for PDFs: **Keynote** (macOS) or **LibreOffice** (`soffice`). Without either you get the PPTX only.
- Optional, for reviewing pages: `pdftoppm` (poppler).

## Quick start

1. Run your app locally with test accounts, one per role you want in the manual.
2. Export the test passwords in your own shell (see below).
3. Ask Claude: *"Make a user manual for the Viewer and Editor roles of the app running on localhost:3000."*
   It will ask for anything it cannot read from the code (roles, template, workspace folder, language), show you
   the task list, then capture, build and QA.
4. Open `<workspace>/out/` — `<name>-ALL.pptx` and one deck per role, each with a PDF.

To see the whole pipeline on the demo without your own app, run the smoke test (below) or build the committed demo:

```bash
python3 -m venv .venv && .venv/bin/pip install -r plugin/skills/mslides/requirements.txt
.venv/bin/python plugin/skills/mslides/scripts/manual.py examples/demo/manual.json --all --pdf
```

## How passwords are supplied

Passwords are read **only from environment variables** at capture time — never from a file, never written to the
workspace, never printed:

```bash
export MANUAL_PW_VIEWER='…'   # per role: MANUAL_PW_<ROLE KEY>, uppercased, non-alphanumerics → _
export MANUAL_PW_EDITOR='…'
export MANUAL_PW='…'          # optional fallback for every role
```

Set them yourself; do not paste passwords into the chat. Login selectors, the optional "who am I" endpoint used to
verify the logged-in account, and the test users' emails are configured in `manual.json` → `capture`.

## Good practice

- **Capture only against local or test environments.** Capturing creates and changes sample records. By default
  the capture refuses any host that is not loopback; add a host to `capture.allow_hosts` only when it really is a
  test environment. Never point it at production.
- **Decks may contain confidential screenshots** of internal screens and data — treat them accordingly: keep the
  workspace and output out of public repositories, and share decks only with their intended audience.

## Tests

```bash
PYTHON=.venv/bin/python NODE_PATH=/path/to/node_modules bash tests/smoke.sh
```

The smoke test serves `examples/demo-app` with `python3 -m http.server` on a free loopback port, replays the demo
capture steps into a temporary copy of the workspace, builds the deck, and asserts the build succeeded, the PPTX
exists with the expected slide count, every task slide has as many steps as callout boxes, and every quoted UI
label still exists in the app's messages. The server is stopped on exit.

## Repository layout

```
.claude-plugin/marketplace.json     marketplace entry
plugin/.claude-plugin/plugin.json   plugin manifest
plugin/skills/mslides/              the skill: SKILL.md, scripts/, references/, templates/, assets/example/
examples/demo-app/                  tiny dependency-free app to capture from
examples/demo/                      demo manual: manual.json, manifest.json, steps/, shots/
tests/smoke.sh                      end-to-end smoke test
```

## License

MIT — see [LICENSE](LICENSE).
