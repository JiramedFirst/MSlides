"""Inspect a .pptx template so its manual.json "template" block can be written from facts, not guesses.

  python inspect_template.py <template.pptx> [--render <dir>]

Prints slide size, theme colours, every master's layouts (with placeholder idx/type/box) and every sample slide
(its layout + placeholders + text). --render also exports the template to <dir>/template.pdf (Keynote on macOS,
else LibreOffice) so you can LOOK at where the logo, rules and footer sit before choosing "area".
Layout names can repeat across masters (e.g. "Title Slide" in three masters) — then pick layouts by sample slide number.
"""
import pathlib, re, sys
from pptx import Presentation

EMU = 914400


def box(sh):
    return "[" + ", ".join(f"{(v or 0) / EMU:.2f}" for v in (sh.left, sh.top, sh.width, sh.height)) + "]"


def phs(shapes):
    return "; ".join(f"idx{p.placeholder_format.idx} {p.placeholder_format.type} {box(p)}" for p in shapes.placeholders) or "no placeholders"


path = pathlib.Path(sys.argv[1]).expanduser()
prs = Presentation(path)
print(f"slide size {prs.slide_width / EMU:.2f}\" x {prs.slide_height / EMU:.2f}\"")

for mi, m in enumerate(prs.slide_masters):
    theme = m.part.part_related_by("http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme")
    clr = theme.blob.decode("utf8", "ignore")
    scheme = dict(re.findall(r"<a:(dk1|lt1|dk2|lt2|accent\d|hlink)>.*?(?:val|lastClr)=\"([0-9A-Fa-f]{6})\"", clr))
    print(f"\nmaster {mi}: theme colours {scheme}")
    for l in m.slide_layouts:
        print(f"  layout {l.name!r}: {phs(l)}")

for si, s in enumerate(prs.slides, 1):
    texts = [sh.text_frame.text.strip().replace("\n", " / ")[:60] for sh in s.shapes if sh.has_text_frame and sh.text_frame.text.strip()]
    master = next(i for i, m in enumerate(prs.slide_masters) if s.slide_layout in list(m.slide_layouts))
    print(f"\nslide {si}: layout {s.slide_layout.name!r} (master {master})")
    print(f"  {phs(s)}")
    for sh in s.shapes:
        if not sh.is_placeholder:
            print(f"  shape {sh.shape_type} {sh.name!r} {box(sh)}")
    if texts:
        print(f"  text: {texts}")

if "--render" in sys.argv:
    sys.path.insert(0, str(pathlib.Path(__file__).parent))
    from manual import render_pdf
    out = pathlib.Path(sys.argv[sys.argv.index("--render") + 1]).expanduser()
    out.mkdir(parents=True, exist_ok=True)
    tmp = out / "template.pptx"
    tmp.write_bytes(path.read_bytes())
    render_pdf(tmp)  # then: pdftoppm -r 60 -png <dir>/template.pdf <dir>/t  and read the PNGs
