# MSlides

Claude Code plugin that makes user-manual slide decks for a web app. It captures each screen with Playwright, draws
a numbered box for every step, and builds one editable PPTX (and PDF) per role.

![Two task slides from the demo manual](docs/images/hero.png)

## Install

```
/plugin marketplace add JiramedFirst/MSlides
/plugin install mslides@mslides
```

## Use

Run your app locally with one test account per role, then ask Claude:

> Make a user manual for the Viewer and Editor roles of the app on localhost:3000.

Claude reads the code for the tasks and the exact UI labels, shows you the task list, then captures the screens,
builds the decks, and checks the rendered pages. The output goes to `<workspace>/out/`.

Later you can ask it to refresh the manual after a UI change, or to edit a slide ("change step 2 on editor-02").

## Requirements

- Python 3.10+. The skill installs its packages into a venv in the workspace.
- Node 18+ and Playwright: `npm i -D playwright && npx playwright install chromium`
- Keynote or LibreOffice for PDF export (optional).

## Passwords

Capture reads passwords from environment variables only. It never writes them to a file or prints them:

```bash
export MANUAL_PW_VIEWER='…'   # MANUAL_PW_<ROLE>; MANUAL_PW is the fallback
```

Capture refuses non-loopback hosts unless you list them in `capture.allow_hosts`. Don't point it at production.
Screenshots of internal screens may be confidential, so treat the decks that way.

## Demo

`examples/demo-app/` is a small static app, and `examples/demo/` holds the manual captured from it.

| Task slide | Form | Reference table |
|---|---|---|
| ![](docs/images/viewer-task.png) | ![](docs/images/editor-form.png) | ![](docs/images/reference-table.png) |

The smoke test serves the demo, replays the capture, builds the deck, and checks it:

```bash
PYTHON=.venv/bin/python NODE_PATH=/path/to/node_modules bash tests/smoke.sh
```

## License

MIT
