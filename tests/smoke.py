"""End-to-end smoke test: serve the demo app, replay the demo capture steps into a temp copy of the workspace,
build every edition (PDF + Markdown), build once more on the dark template, and check the results.

  python tests/smoke.py          (PYTHON=<venv python> for the build steps, default: this interpreter;
                                  NODE_PATH=<dir>/node_modules so node resolves Playwright, with chromium installed)

Pure Python so the same file runs on macOS, Linux and Windows (CI runs both).
"""
import http.server, json, os, pathlib, shutil, socket, subprocess, sys, tempfile, threading, urllib.request
# Windows consoles default to a legacy code page; the arrows in our messages would raise UnicodeEncodeError.
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

sys.stdout.reconfigure(line_buffering=True)  # keep our "==" headings in order with the children's output
ROOT = pathlib.Path(__file__).resolve().parents[1]
PY = os.environ.get("PYTHON", sys.executable)
TMP = pathlib.Path(tempfile.mkdtemp())
run = lambda *cmd, **kw: subprocess.run([str(c) for c in cmd], check=True, **kw)


def serve(directory):
    """The demo app on a free loopback port, in a daemon thread — no second process to forget on Windows."""
    http.server.SimpleHTTPRequestHandler.log_message = lambda *a: None  # one line per asset would drown the summary
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), lambda *a: http.server.SimpleHTTPRequestHandler(*a, directory=str(directory)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


try:
    # Same relative layout as the repo, so manual.json's relative template/messages paths resolve.
    for d in ("examples", "plugin"):
        shutil.copytree(ROOT / d, TMP / d)
    WS, S = TMP / "examples/demo", TMP / "plugin/skills/mslides"
    for d in ("shots", "shots-new", "out", "preview"):
        shutil.rmtree(WS / d, ignore_errors=True)
    sys.path.insert(0, str(S / "scripts"))
    import renderers

    srv = serve(TMP / "examples/demo-app")
    port = srv.server_address[1]
    urllib.request.urlopen(f"http://127.0.0.1:{port}/index.html").read()

    print(f"== replay (demo app on :{port})")
    run("node", S / "scripts/replay.mjs", env={**os.environ, "MANUAL_CONFIG": str(WS / "manual.json"),
                                                "MANUAL_BASE_URL": f"http://127.0.0.1:{port}", "MANUAL_PW": "smoke-test"})
    (WS / "shots-new").rename(WS / "shots")

    renderer = renderers.renderer()
    print("== build (pdf renderer:", renderer or "none", ")")
    run(PY, S / "scripts/manual.py", WS / "manual.json", "--all", "--md", *(["--pdf"] if renderer else []))

    print("== checks")
    sys.path.insert(0, str(TMP / "plugin/skills/mslides/scripts"))
    from pptx import Presentation
    cfg = json.loads((WS / "manual.json").read_text(encoding="utf-8"))
    items = json.loads((WS / "manifest.json").read_text(encoding="utf-8"))
    out = WS / "out"
    deck = out / f"{cfg['out_name']}-ALL.pptx"
    assert deck.exists(), f"missing {deck}"
    for it in items:  # step N = box N
        marks = json.loads((WS / "shots" / f"{it['shot']}.json").read_text(encoding="utf-8"))["marks"]
        assert len(it["steps"]) == len(marks), f"{it['shot']}: {len(it['steps'])} steps vs {len(marks)} marks"
    # cover + TOC + intro + (divider + tasks) per chapter + reference + closing
    want = 2 + len(cfg.get("intro", [])) + sum(1 + sum(it["chapter"] == c["code"] for it in items) for c in cfg["chapters"]) \
        + len(cfg.get("reference", [])) + (1 if cfg.get("closing") else 0)
    got = len(Presentation(deck).slides)
    assert got == want, f"{deck.name}: {got} slides, expected {want}"
    editions = {"ALL": items, **{c["edition"]: [it for it in items if it["chapter"] == c["code"]] for c in cfg["chapters"]}}
    for ed, tasks in editions.items():
        stem = out / f"{cfg['out_name']}-{ed}"
        assert stem.with_suffix(".pptx").exists(), f"missing {ed} edition"
        if renderer:  # no renderer here → PPTX only is the documented behaviour; with one, a missing PDF is a failure
            assert stem.with_suffix(".pdf").exists(), f"missing {ed} PDF ({renderer})"
        md = stem.with_suffix(".md").read_text(encoding="utf8")
        heads = [l for l in md.splitlines() if l.startswith("### ")]
        assert len(heads) == len(tasks), f"{ed}.md: {len(heads)} task headings, expected {len(tasks)}"
        for it in tasks:
            assert (out / "md-images" / f"{it['shot']}.png").exists(), f"{ed}.md: image for {it['shot']} missing"
    print(f"ok: {deck.name} has {got} slides; {len(items)} task slides, steps == marks on every one; "
          f"{len(editions)} editions with {'PDF + ' if renderer else ''}Markdown")

    print("== dark template")
    import build_manual as B
    dark = dict(cfg, template={**cfg["template"], "path": "../../plugin/skills/mslides/templates/dark.pptx", "colors": B.DARK_COLORS})
    (WS / "manual-dark.json").write_text(json.dumps(dark), encoding="utf-8")
    run(PY, S / "scripts/manual.py", WS / "manual-dark.json", "--role", "all", "--out-dir", TMP / "dark")
    got_dark = len(Presentation(TMP / "dark" / f"{cfg['out_name']}-ALL.pptx").slides)
    assert got_dark == want, f"dark deck: {got_dark} slides, expected {want}"
    print(f"ok: dark deck has {got_dark} slides")

    run(PY, S / "scripts/check_copy.py", WS / "manual.json")
    run(PY, ROOT / "tests/test_crop.py")
    print("SMOKE OK")
finally:
    shutil.rmtree(TMP, ignore_errors=True)
