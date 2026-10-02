#!/usr/bin/env bash
# End-to-end smoke test: serve the demo app, replay the demo capture steps into a temp copy of the workspace,
# build the deck, and check the result.
#
#   bash tests/smoke.sh
#
# Needs: python3 with requirements.txt installed (or PYTHON=<venv>/bin/python), node 18+, and Playwright resolvable
# by node (NODE_PATH=<dir>/node_modules, or `npm i -D playwright` somewhere the capture can find it) with
# chromium installed (`npx playwright install chromium`).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PY="${PYTHON:-python3}"
TMP="$(mktemp -d)"
SRV=""
cleanup() { if [ -n "$SRV" ]; then kill "$SRV" 2>/dev/null; wait "$SRV" 2>/dev/null || true; fi; rm -rf "$TMP"; }
trap cleanup EXIT

# Same relative layout as the repo, so manual.json's relative template/messages paths resolve.
cp -R "$ROOT/examples" "$ROOT/plugin" "$TMP/"
WS="$TMP/examples/demo"
S="$TMP/plugin/skills/mslides"
rm -rf "$WS/shots" "$WS/shots-new" "$WS/out" "$WS/preview"

PORT="$("$PY" -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1])')"
(cd "$TMP/examples/demo-app" && exec "$PY" -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1) &
SRV=$!
for _ in $(seq 50); do curl -sf "http://127.0.0.1:$PORT/index.html" >/dev/null && break; sleep 0.1; done

echo "== replay (demo app on :$PORT)"
MANUAL_CONFIG="$WS/manual.json" MANUAL_BASE_URL="http://127.0.0.1:$PORT" MANUAL_PW="smoke-test" \
  node "$S/scripts/replay.mjs"
mv "$WS/shots-new" "$WS/shots"

echo "== build"
"$PY" "$S/scripts/manual.py" "$WS/manual.json" --all

echo "== checks"
"$PY" - "$WS" <<'EOF'
import json, pathlib, sys
from pptx import Presentation
ws = pathlib.Path(sys.argv[1])
cfg = json.loads((ws / "manual.json").read_text())
items = json.loads((ws / "manifest.json").read_text())
deck = ws / "out" / f"{cfg['out_name']}-ALL.pptx"
assert deck.exists(), f"missing {deck}"
for it in items:  # step N = box N
    marks = json.loads((ws / "shots" / f"{it['shot']}.json").read_text())["marks"]
    assert len(it["steps"]) == len(marks), f"{it['shot']}: {len(it['steps'])} steps vs {len(marks)} marks"
# cover + TOC + intro + (divider + tasks) per chapter + reference + closing
want = 2 + len(cfg.get("intro", [])) + sum(1 + sum(it["chapter"] == c["code"] for it in items) for c in cfg["chapters"]) \
       + len(cfg.get("reference", [])) + (1 if cfg.get("closing") else 0)
got = len(Presentation(deck).slides)
assert got == want, f"{deck.name}: {got} slides, expected {want}"
for c in cfg["chapters"]:
    assert (ws / "out" / f"{cfg['out_name']}-{c['edition']}.pptx").exists(), f"missing {c['edition']} edition"
print(f"ok: {deck.name} has {got} slides; {len(items)} task slides, steps == marks on every one")
EOF
"$PY" "$S/scripts/check_copy.py" "$WS/manual.json"
"$PY" "$ROOT/tests/test_crop.py"
echo "SMOKE OK"
