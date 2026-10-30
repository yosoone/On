# On

**On** is Yoso's magazine: it gathers new work from the other Yoso sites into one stream, with a numbered issue now and then that can also go out as the 'Yoso' newsletter.

- **Live site:** <https://on.yoso.one>
- **RSS:** <https://on.yoso.one/feed.xml>

## How it works

| Part | What it does |
|---|---|
| **The stream** (front page) | Fills itself. Every six hours GitHub runs `build.py`, which reads each site's feed and saves anything new. Each piece shows its picture, title and a short summary, and links to the original site. |
| **Issues** | You choose. List the pieces for an issue in `assets/issues.js`; the issue page fills in the pictures and summaries. |
| **The letter** | Each issue page has a 'Copy the letter' button that copies the issue as text for a new Buttondown email. |

Sites it reads (set at the top of `build.py`):

| Site | Read from |
|---|---|
| One | `one.yoso.one/rss.xml` |
| Kuro | `kuro.yoso.one/feed.xml` |
| Shinsei | `shinsei.yoso.one/assets/works.js` (works with a photo only; placeholders are skipped) |
| River | `river.yoso.one/feed.xml` |

## Making an issue

1. Open `assets/issues.js`.
2. Copy the example inside it, remove the `//` at the start of each line, and fill in the number, title, date and a few lines of introduction.
3. Under `pieces`, paste the link of each piece, in order. The easiest way to get a link: on On's front page, right-click a piece's 'Read on …' and copy the link address.
4. Run `python3 check.py`, then commit and push.
5. Open the issue on the site, press **Copy the letter**, and paste it into a new email in Buttondown. To send it only to On's readers, choose the tag `on`; to send it to everyone, choose all subscribers.

## Files

- `index.html`: the front page, always the latest issue. Its 'This moon so far' section fills itself with new work dated between the issue's `opens` and `closes`; 'Moons ago' holds work from the same moon in earlier years
- `stream.html`: the whole stream, by site
- `moons.html`: the year of moons, one old lunar year per page (`moons.html?y=2027`), with a **Print** button for one A4 landscape sheet
- `issues.html`, `issue.html`: the list of issues and a single issue (`issue.html?n=1`)
- Texts chosen for an issue are kept in the vault, one folder per issue: `Writings/On/` (see `_ On Issues.md` there)
- `assets/issues.js`: **your list of issues**, the one file you edit
- `assets/items.js`, `feed.xml`, `data/archive.json`: made by `build.py`; do not edit by hand
- `assets/on.js`, `assets/site.css`: how the pages are drawn and styled
- `build.py`: the gatherer
- `make-pdf.py`: makes an issue's printed edition (A5 PDF) in `issues/`; see 'The printed issue' below
- `assets/moons.js`: the moon calendar data, made by `moons.py`; do not edit by hand
- `assets/moon.js`: draws the moon widget and the year of moons
- `moons.py`: works out the moons, the old months, the 24 solar terms and the 72 *kō* (see below)
- `setup/publish.yml`: the GitHub workflow (see below)
- `check.py`, `robots.txt`, `CNAME`, `.nojekyll`: shared with the other Yoso sites

## The moon calendar

The front page carries **tonight's moon** as a widget beside the title (below it on phones): the moon, the old date (for example 長月 二十日), the named night where there is one, the solar term and *kō* in force, and the days to the next new moon. It links to the year of moons. Any page can show it with `<div data-moon-widget="medium"></div>` (or `small`, `large`), loading `issues.js`, `moons.js` and `moon.js`. **The year of moons** (`moons.html`) shows a whole old lunar year, from 睦月 Mutsuki to 師走 Shiwasu, and prints on one A4 landscape sheet.

Everything is in Japan time. Each moon is drawn as it looks at 9 pm, waxing on the right. Months begin on the day of the new moon and take their number from the principal solar term that falls in them; a month without one is a leap month (閏月). A month's name links to its issue when an issue in `issues.js` has the same `opens` date.

`assets/moons.js` covers the old lunar years 2026 to 2030. To extend it, change `LAST` at the top of `moons.py`, then:

```
pip install ephem
python3 moons.py
```

The dates were checked against the National Astronomical Observatory of Japan's 暦要項 for 2026 and 2027 (new and full moons to the minute, all 24 solar terms on the same day).

## The printed issue (PDF)

Each issue can be downloaded as a printed edition: an A5 PDF with a cover (the masthead, the issue's title and introduction), the pieces one after another, 'This moon so far' and 'Moons ago' each from a new page, and a colophon at the end. Links are written out under each piece, so the paper copy still says where everything lives. The look comes from the print styles at the end of `assets/site.css`, so pressing Print on any issue page in a browser gives the same layout.

**When the issue closes** (the day before the next new moon), in this folder:

```
python3 make-pdf.py        # the latest issue; or  python3 make-pdf.py 0  for No. 0
python3 release.py "Printed issue No. 0"
```

`make-pdf.py` saves the PDF in `issues/` (for example `issues/on-00-nagatsuki-beta.pdf`) and, the first time, adds `pdf: "issues/…pdf",` to that issue in `assets/issues.js`, which puts a **Download the printed issue (PDF, A5)** button on the issue page and a link in the letter. Running it again replaces the file. It uses the large copy of each photograph, shrunk to about 300 dpi for A5, and sets the PDF's title and author.

It needs, once:

```
pip3 install playwright pypdf pillow
python3 -m playwright install chromium
```

and the internet, since the photographs and fonts come from the other Yoso sites and Google Fonts. It lists any picture that did not load.

## Setting it up on GitHub (once)

1. Create a new public repository named `on` under `yosoone`, with nothing in it, and push this folder to it.
2. **Add the workflow** (Claude cannot push workflow files): on GitHub, *Add file → Create new file*, name it `.github/workflows/publish.yml`, paste in the contents of `setup/publish.yml`, and commit.
3. **Settings → Pages → Source:** *GitHub Actions*.
4. At the DNS provider for `yoso.one`, add a `CNAME` record: name `on`, value `yosoone.github.io`. When the domain resolves, tick **Enforce HTTPS** in the Pages settings.
5. Under the **Actions** tab, open 'Gather, check and publish' and press **Run workflow** once to fill the stream.

## Publishing an update (beta number)

The footer of every page shows the site's beta number, for example 'Beta 0.4'. It goes up by one with each update. To publish, in this folder:

```
python3 release.py "What changed"
```

That moves the number up (kept in `VERSION`), writes it into every footer, runs the check below, and commits and pushes. If the check fails, nothing is changed and the number stays where it was. Edits made straight on GitHub's website do not move the number; the next `release.py` run catches up.

## Safety: check, publish, undo

**Before publishing**, run the check in this folder:

```
python3 check.py
```

It looks for broken HTML, links to missing files, script errors, a missing hub link or mailing-list form, and a broken `feed.xml` or `robots.txt`. GitHub runs the same check on every push and every gathering run; a version that fails is never published, the live site keeps its last good version, and GitHub emails you what went wrong.

If a site cannot be reached during a run, its pieces stay as they were and the rest carries on. A piece removed from its own site disappears from the stream, but an issue that included it still shows it.

**To undo the last change**, in this folder:

```
git revert HEAD
git push
```

**To go back to a known-good version** (kept as branches named `good-YYYY-MM-DD`):

```
git fetch origin
git checkout origin/good-2026-10-20 -- .
git commit -m "Back to the good version of 20 October 2026"
git push
```

A full copy of this site, with its history, is also backed up to the external drive (`BLACK_PUNK_/00 Yoso_one Websites Back up`).

© Yoso. All works and images are the artist's own.

## Mailing list

The sign-up form asks for an email address first; pressing **Continue** shows a list of Yoso's newsletters (One, Yosokuro, Shinsei, River, On), with this site's own one already ticked. Each ticked box reaches Buttondown as a tag (`one`, `yosokuro`, `shinsei`, `river`, `on`), so to write to one newsletter's readers, send to that tag. The step is run by `assets/list-choice.js`, which is the same file on every site; without it the boxes simply show under the email field and the form still works. To add or rename a newsletter, change the boxes in every form, `NEWSLETTERS` in `check.py`, and this list, on every site.
