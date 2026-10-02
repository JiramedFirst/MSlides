"""QA preview: python overlay.py <workspace> <shot>... → <workspace>/preview/<shot>.png with numbered red boxes.
Check marks here before building — a wrong box is cheaper to see on one PNG than on a rendered 100-slide deck."""
import json, pathlib, sys
from PIL import Image, ImageDraw

ws = pathlib.Path(sys.argv[1]).expanduser()
(ws / "preview").mkdir(exist_ok=True)
for name in sys.argv[2:]:
    im = Image.open(ws / "shots" / f"{name}.png").convert("RGB")
    dr = ImageDraw.Draw(im)
    for i, m in enumerate(json.loads((ws / "shots" / f"{name}.json").read_text())["marks"], 1):
        dr.rectangle([m["x"], m["y"], m["x"] + m["w"], m["y"] + m["h"]], outline="red", width=3)
        dr.ellipse([m["x"] - 14, m["y"] - 14, m["x"] + 14, m["y"] + 14], fill="red")
        dr.text((m["x"] - 4, m["y"] - 7), str(i), fill="white")
    im.save(ws / "preview" / f"{name}.png")
    print(ws / "preview" / f"{name}.png")
