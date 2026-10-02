"""Regression check for crop_window's edge snapping: a crop edge must not slice through UI text.

    python tests/test_crop.py      (needs Pillow; exits non-zero on failure)

Seen in the first outside run: a mark-only window cut "Demo Inventory" to "ntory". The fixture puts a dark text
run exactly where the mark-only window's left edge lands, then checks the snapped window clears it.
"""
import pathlib, sys
from PIL import Image, ImageDraw

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "plugin/skills/mslides/scripts"))
import build_manual as B

W, H = 1600, 900
meta = {"w": W, "h": H, "marks": [{"x": 700, "y": 300, "w": 300, "h": 60}], "name": "fixture"}
x, y, w, h = B.crop_window(meta)  # geometry only — where the edge would fall without snapping
img = Image.new("RGB", (W, H), "white")
d = ImageDraw.Draw(img)
# A "word" straddling the naive left edge, and one straddling the naive top edge.
d.rectangle([x - 40, y + h / 2 - 8, x + 40, y + h / 2 + 8], fill="black")
d.rectangle([x + w / 2 - 40, y - 8, x + w / 2 + 40, y + 8], fill="black")

sx, sy, sw, sh = B.crop_window(meta, img=img)
g = img.convert("L").load()
cut = lambda pts: any(g[min(int(a), W - 1), min(int(b), H - 1)] < 128 for a, b in pts)
left = sx > 0 and cut((sx, sy + i) for i in range(int(sh)))
top = sy > 0 and cut((sx + i, sy) for i in range(int(sw)))
assert not (left or top), f"snapped window {sx:.0f},{sy:.0f},{sw:.0f},{sh:.0f} still cuts the text"
assert abs(sw / sh - 16 / 9) < 1e-6, "window lost its 16:9 ratio"
m = meta["marks"][0]
assert sx <= m["x"] and sy <= m["y"] and m["x"] + m["w"] <= sx + sw and m["y"] + m["h"] <= sy + sh, "mark left the window"
print("crop snap ok:", [round(v) for v in (x, y, w, h)], "->", [round(v) for v in (sx, sy, sw, sh)])
