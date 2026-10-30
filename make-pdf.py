#!/usr/bin/env python3
"""Make the printed issue of On: an A5 PDF of an issue page, ready to download or print.

    python3 make-pdf.py          the latest issue
    python3 make-pdf.py 0        issue No. 0

It opens the issue page from this folder in a hidden browser, waits for every picture
and font, prints it with the print styles in assets/site.css (A5, a cover page, the
pieces, 'This moon so far' and 'Moons ago' from new pages, a colophon at the end) and
saves it as issues/on-00-nagatsuki-beta.pdf (number and title from assets/issues.js).
The first time, it also adds   pdf: "issues/…pdf",   to that issue in issues.js, which
puts the 'Download the printed issue' button on the issue page.

Make it when the issue closes, the day before the next new moon, so the PDF holds the
whole moon. Running it again replaces the file. Then publish as usual:

    python3 release.py "Printed issue No. 0"

Needs, once:  pip3 install playwright pypdf pillow  and  python3 -m playwright install chromium
(pypdf and pillow are optional: they set the PDF's title and author and shrink the photos.) It needs the internet, because
the pictures and fonts come from the other Yoso sites and Google Fonts.
"""
import functools
import http.server
import re
import sys
import threading
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ISSUES_JS = ROOT / "assets" / "issues.js"
OUT_DIR = ROOT / "issues"


def issues():
    """(number, title) for each issue in issues.js, newest first."""
    text = ISSUES_JS.read_text(encoding="utf-8")
    body = text[text.index("window.ON_ISSUES"):]
    found = []
    for m in re.finditer(r'^\s*number:\s*(\d+),\s*\n\s*title:\s*"([^"]*)"', body, re.M):
        found.append((int(m.group(1)), m.group(2)))
    return sorted(found, reverse=True)


def slug(number, title):
    words = re.findall(r"[A-Za-z0-9]+", title.lower())
    return "on-%02d" % number + ("-" + "-".join(words) if words else "")


def add_pdf_line(number, rel):
    """Add  pdf: "…",  under the issue's number in issues.js, once."""
    text = ISSUES_JS.read_text(encoding="utf-8")
    start = text.index("window.ON_ISSUES")
    m = re.compile(r'^(\s*)number:\s*%d,\s*\n' % number, re.M).search(text, start)
    if not m:
        return False
    nxt = re.compile(r'^\s*number:\s*\d+,', re.M).search(text, m.end())
    block = text[m.end(): nxt.start() if nxt else len(text)]
    if re.search(r'^\s*pdf:', block, re.M):
        text = text[:m.end()] + re.sub(r'^(\s*pdf:\s*)"[^"]*"', r'\1"%s"' % rel, block, count=1, flags=re.M) \
            + text[nxt.start() if nxt else len(text):]
    else:
        text = text[:m.end()] + '%spdf: "%s",\n' % (m.group(1), rel) + text[m.end():]
    ISSUES_JS.write_text(text, encoding="utf-8")
    return True


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve():
    handler = functools.partial(Quiet, directory=str(ROOT))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


FOOTER = """<div style="width:100%;font-family:'Hiragino Mincho ProN','Yu Mincho','Noto Serif CJK JP',serif;
font-size:7pt;color:#55595D;padding:0 13mm;display:flex;justify-content:space-between;">
<span>On · No. {n}</span><span class="pageNumber"></span></div>"""


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("Playwright is missing. Run once:\n  pip3 install playwright pypdf pillow\n  python3 -m playwright install chromium")

    all_issues = issues()
    if not all_issues:
        sys.exit("No issues found in assets/issues.js.")
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    if args:
        pick = [i for i in all_issues if i[0] == int(args[0])]
        if not pick:
            sys.exit("There is no issue No. %s in assets/issues.js." % args[0])
        number, title = pick[0]
    else:
        number, title = all_issues[0]

    OUT_DIR.mkdir(exist_ok=True)
    rel = "issues/%s.pdf" % slug(number, title)
    out = ROOT / rel
    httpd = serve()
    url = "http://127.0.0.1:%d/issue.html?n=%d" % (httpd.server_address[1], number)
    missing = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 900, "height": 1200})
        page.on("requestfailed", lambda r: missing.append(r.url) if r.resource_type in ("image", "font") else None)
        page.goto(url, wait_until="networkidle", timeout=90000)
        page.emulate_media(media="print")
        page.evaluate("""async () => {
          document.querySelectorAll('img').forEach(i => {
            i.loading = 'eager';
            if (i.dataset.full) i.src = i.dataset.full;   // large photos for paper
          });
          await document.fonts.ready;
          await Promise.all([...document.images].map(i => i.complete ? null :
            new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 30000); })));
        }""")
        page.wait_for_timeout(500)
        page.pdf(path=str(out), prefer_css_page_size=True, print_background=True,
                 display_header_footer=True, header_template="<span></span>",
                 footer_template=FOOTER.format(n=number))
        browser.close()
    httpd.shutdown()

    try:
        from pypdf import PdfReader, PdfWriter
        reader = PdfReader(str(out))
        writer = PdfWriter(clone_from=reader)
        # Photos at about 300 dpi for an A5 page: no wider than 1500 px, JPEG quality 82
        try:
            from PIL import Image
            for pg in writer.pages:
                for im in pg.images:
                    pic = im.image
                    if pic.width > 1500:
                        pic = pic.resize((1500, round(pic.height * 1500 / pic.width)), Image.LANCZOS)
                        im.replace(pic.convert("RGB") if pic.mode not in ("RGB", "L") else pic, quality=82)
        except Exception as e:  # keep the PDF as it is if anything goes wrong
            print("Note: photos left at full size (%s)" % e)
        writer.add_metadata({"/Title": "On, No. %d%s" % (number, ": " + title if title else ""),
                             "/Author": "Yoso", "/Subject": "On, on.yoso.one: the printed issue",
                             "/Creator": "On, make-pdf.py, %s" % date.today().isoformat()})
        with open(out, "wb") as f:
            writer.write(f)
        pages = len(reader.pages)
    except ImportError:
        pages = None

    if add_pdf_line(number, rel):
        print("issues.js: No. %d now links to %s" % (number, rel))
    size = out.stat().st_size / 1024 / 1024
    print("Made %s%s, %.1f MB" % (rel, ", %d pages" % pages if pages else "", size))
    if missing:
        print("Warning: %d pictures or fonts did not load (no internet, or moved):" % len(missing))
        for u in sorted(set(missing))[:10]:
            print("  " + u)


if __name__ == "__main__":
    main()
