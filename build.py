#!/usr/bin/env python3
"""Gather new work from the Yoso sites into On.

    python3 build.py

Reads each site's feed (and Shinsei's works list), keeps every piece it has
ever seen in data/archive.json, and writes:

  assets/items.js   the pieces the pages show, newest first
  feed.xml          one feed for the whole magazine

GitHub runs this on a schedule (see .github/workflows/publish.yml), so the
stream fills itself. You can also run it by hand after a site changes.

If a site cannot be reached, its pieces are kept as they were and the run
carries on. A piece that disappears from its site is hidden from On, but
stays in the archive so an issue that included it still works.

For testing with feeds on disk:  python3 build.py --local kuro=../kuro/feed.xml
"""
import argparse
import html
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import format_datetime, parsedate_to_datetime
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

# ---- the sites On gathers from ----
SOURCES = [
    {"key": "vault", "name": "The Vault", "kanji": "一", "site": "https://one.yoso.one/",
     "feed": "https://one.yoso.one/rss.xml"},
    {"key": "kuro", "name": "Kuro", "kanji": "黒", "site": "https://kuro.yoso.one/",
     "feed": "https://kuro.yoso.one/feed.xml",
     "thumb": ("/img/full/", "/img/thumb/")},   # smaller copies for the magazine
    {"key": "shinsei", "name": "Shinsei", "kanji": "心", "site": "https://shinsei.yoso.one/",
     "works": "https://shinsei.yoso.one/assets/works.js",
     "works_page": "https://shinsei.yoso.one/works.html"},
    {"key": "river", "name": "River", "kanji": "川", "site": "https://river.yoso.one/",
     "feed": "https://river.yoso.one/feed.xml"},
]
FEED_ITEMS = 40          # pieces in On's own feed.xml
FEED_PER_SOURCE = 12     # so one busy site cannot fill the feed
SUMMARY_CHARS = 220
# ------------------------------------

SITE = "https://on.yoso.one/"
HERE = Path(__file__).resolve().parent
ARCHIVE = HERE / "data" / "archive.json"
JST = timezone(timedelta(hours=9))
NOW = datetime.now(JST).replace(microsecond=0)


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "on.yoso.one gatherer"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def plain(fragment):
    """HTML fragment to plain text, keeping line breaks (River's texts are set in lines)."""
    text = re.sub(r"<br\s*/?>|</p>|</li>|</h\d>", "\n", fragment or "", flags=re.I)
    text = html.unescape(re.sub(r"<[^>]+>", "", text))
    text = re.sub(r"[ \t\r\f\v]+", " ", text)
    text = "\n".join(line.strip() for line in text.split("\n"))
    text = re.sub(r"\n{2,}", "\n", text).strip()
    return re.sub(r"\s*[–—-]\s*Yoso$", "", text)   # River signs each text


def shorten(text, n=SUMMARY_CHARS):
    if len(text) <= n:
        return text
    cut = text[:n]
    cut = cut[:max(cut.rfind(" "), cut.rfind("\n"))].rstrip(",;:.–— \n")
    return cut + "…"


def https_only(url):
    return url if url and url.startswith("https://") else ""


def first_image(fragment):
    m = re.search(r"<img\b[^>]*>", fragment or "", flags=re.I)
    if not m:
        return "", ""
    tag = m.group(0)
    src = re.search(r'src\s*=\s*"([^"]+)"', tag)
    alt = re.search(r'alt\s*=\s*"([^"]*)"', tag)
    return (html.unescape(src.group(1)) if src else "", html.unescape(alt.group(1)) if alt else "")


def iso(dt):
    return dt.astimezone(JST).isoformat()


def read_feed(src, data):
    root = ET.fromstring(data)
    found = []
    for it in root.findall("./channel/item"):
        title = (it.findtext("title") or "").strip()
        link = (it.findtext("link") or "").strip()
        if not (title and link):
            continue
        desc = it.findtext("description") or ""
        image, alt = "", ""
        enc = it.find("enclosure")
        if enc is not None and (enc.get("type") or "").startswith("image/"):
            image = enc.get("url", "")
        img2, alt2 = first_image(desc)
        image, alt = image or img2, alt2
        full = image                      # the large copy, for On's viewer
        if image and src.get("thumb"):
            image = image.replace(*src["thumb"])
        date = None
        if it.findtext("pubDate"):
            try:
                date = parsedate_to_datetime(it.findtext("pubDate"))
            except (TypeError, ValueError):
                date = None
        found.append({
            "id": (it.findtext("guid") or link).strip(),
            "title": title,
            "link": https_only(link),
            "summary": shorten(plain(desc)),
            "image": https_only(image),
            "full": https_only(full),
            "alt": alt or title,
            "date": iso(date) if date else None,
        })
    return found


ENTRY = re.compile(r"\{[^{}]*\}")


def js_field(obj, name):
    m = re.search(name + r'\s*:\s*"((?:[^"\\]|\\.)*)"', obj)
    return json.loads('"' + m.group(1) + '"') if m else ""


def read_works(src, data):
    """Shinsei has no feed yet: read its works list. Placeholders (no photo) are skipped."""
    text = data.decode("utf-8")
    text = text[text.index("["):] if "[" in text else ""
    found = []
    for obj in ENTRY.findall(text):
        image, title = js_field(obj, "image"), js_field(obj, "title")
        if not (image and title):
            continue
        medium, year = js_field(obj, "medium"), js_field(obj, "year")
        found.append({
            "id": "shinsei-" + image,
            "title": title,
            "link": src["works_page"],
            "summary": shorten(", ".join(x for x in (year, medium) if x)),
            "image": src["site"] + "images/" + image,
            "full": src["site"] + "images/" + image,
            "alt": title + (", " + medium if medium else ""),
            "date": None,          # works have no dates: the day On first saw it is used
        })
    return found


def dump(archive):
    return json.dumps(archive, ensure_ascii=False, indent=1, sort_keys=True) + "\n"


def gather(local):
    archive = json.loads(ARCHIVE.read_text(encoding="utf-8")) if ARCHIVE.exists() else {}
    reached = set()
    for src in SOURCES:
        key = src["key"]
        try:
            if key in local:
                data = Path(local[key]).read_bytes()
            else:
                data = fetch(src.get("feed") or src["works"])
            pieces = read_feed(src, data) if src.get("feed") else read_works(src, data)
        except Exception as e:  # noqa: BLE001 - one site failing must not stop the rest
            print(f"  {src['name']}: could not be read ({e}); keeping what was there")
            continue
        reached.add(key)
        seen = set()
        new = 0
        for p in pieces:
            uid = key + ":" + p["id"]
            seen.add(uid)
            old = archive.get(uid)
            if old is None:
                new += 1
            first_seen = old["first_seen"] if old else iso(NOW)
            archive[uid] = {**p, "source": key, "first_seen": first_seen,
                            "date": p["date"] or first_seen, "gone": False}
        for uid, p in archive.items():
            if p["source"] == key and uid not in seen:
                p["gone"] = True
        print(f"  {src['name']}: {len(pieces)} piece(s), {new} new")
    return archive


def write(archive):
    ARCHIVE.parent.mkdir(exist_ok=True)
    ARCHIVE.write_text(dump(archive), encoding="utf-8")
    items = sorted((dict(p, uid=uid) for uid, p in archive.items()),
                   key=lambda p: (p["date"], p["uid"]), reverse=True)
    public = [{k: p.get(k, "") for k in ("uid", "source", "title", "link", "summary", "image", "full", "alt", "date", "gone")}
              for p in items]
    sources = [{k: s[k] for k in ("key", "name", "kanji", "site")} for s in SOURCES]
    js = ("/* Made by build.py: do not edit by hand. */\n"
          "window.ON_SOURCES = " + json.dumps(sources, ensure_ascii=False) + ";\n"
          "window.ON_UPDATED = " + json.dumps(iso(NOW)) + ";\n"
          "window.ON_ITEMS = " + json.dumps(public, ensure_ascii=False, indent=0) + ";\n")
    (HERE / "assets" / "items.js").write_text(js, encoding="utf-8")

    names = {s["key"]: s["name"] for s in SOURCES}
    picked, count = [], {}
    for p in items:
        if p["gone"] or count.get(p["source"], 0) >= FEED_PER_SOURCE:
            continue
        count[p["source"]] = count.get(p["source"], 0) + 1
        picked.append(p)
        if len(picked) == FEED_ITEMS:
            break
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">', "<channel>",
           "  <title>On</title>", f"  <link>{SITE}</link>",
           f'  <atom:link href="{SITE}feed.xml" rel="self" type="application/rss+xml"/>',
           "  <description>New work gathered from the Yoso sites.</description>",
           "  <language>en</language>", "  <copyright>© Yoso</copyright>",
           f"  <lastBuildDate>{format_datetime(NOW)}</lastBuildDate>"]
    for p in picked:
        body = ""
        if p["image"]:
            body += f'<p><img src="{html.escape(p["image"])}" alt="{html.escape(p["alt"])}"></p>'
        if p["summary"]:
            body += f"<p>{html.escape(p['summary'])}</p>"
        body += f'<p>From {html.escape(names[p["source"]])}.</p>'
        out += ["  <item>",
                f"    <title>{xml_escape(p['title'])}</title>",
                f"    <link>{xml_escape(p['link'])}</link>",
                f'    <guid isPermaLink="false">on-{xml_escape(p["uid"])}</guid>',
                f"    <pubDate>{format_datetime(datetime.fromisoformat(p['date']))}</pubDate>",
                f"    <category>{xml_escape(names[p['source']])}</category>",
                f"    <description>{xml_escape(body)}</description>",
                "  </item>"]
    out += ["</channel>", "</rss>", ""]
    (HERE / "feed.xml").write_text("\n".join(out), encoding="utf-8")
    shown = sum(1 for p in items if not p["gone"])
    print(f"Wrote assets/items.js ({shown} piece(s)) and feed.xml ({len(picked)} item(s)).")


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--local", action="append", default=[], metavar="KEY=PATH",
                    help="read one site's feed from a file instead of the web")
    args = ap.parse_args()
    local = dict(x.split("=", 1) for x in args.local)
    print("Gathering:")
    before = ARCHIVE.read_text(encoding="utf-8") if ARCHIVE.exists() else ""
    archive = gather(local)
    if dump(archive) == before and (HERE / "assets" / "items.js").exists() and (HERE / "feed.xml").exists():
        print("Nothing new: the files are left as they were.")
        return
    write(archive)


if __name__ == "__main__":
    sys.exit(main())
