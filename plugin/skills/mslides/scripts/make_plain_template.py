"""Generate templates/plain.pptx: python-pptx's built-in default template, widened to 16:9, no branding.

  python make_plain_template.py [<out.pptx>]     # default: ../templates/plain.pptx

The default template is 4:3 (10" x 7.5"); changing slide_width alone leaves every master/layout placeholder at its
4:3 position, so each placeholder's x and width are scaled to the new 13.333" width as well.
"""
import pathlib, sys
from pptx import Presentation
from pptx.util import Inches
from pptx.oxml.ns import qn

out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parents[1] / "templates" / "plain.pptx"
prs = Presentation()
k = Inches(13.333) / prs.slide_width
prs.slide_width = Inches(13.333)
for master in prs.slide_masters:
    for owner in [master, *master.slide_layouts]:
        # Only shapes with their OWN xfrm: a layout placeholder without one inherits the (already scaled) master
        # position, and writing through python-pptx's inherited getters would pin a broken partial xfrm on it.
        for xfrm in owner._element.iter(qn("a:xfrm")):
            off, ext = xfrm.find(qn("a:off")), xfrm.find(qn("a:ext"))
            if off is not None and ext is not None:
                off.set("x", str(int(int(off.get("x")) * k)))
                ext.set("cx", str(int(int(ext.get("cx")) * k)))
out.parent.mkdir(parents=True, exist_ok=True)
prs.save(out)
print(out, f"{out.stat().st_size / 1e3:.0f} KB")
