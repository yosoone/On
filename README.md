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
| The Vault | `one.yoso.one/rss.xml` |
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
- `issues.html`, `issue.html`: the list of issues and a single issue (`issue.html?n=1`)
- Texts chosen for an issue are kept in the vault, one folder per issue: `Writings/On/` (see `_ On Issues.md` there)
- `assets/issues.js`: **your list of issues**, the one file you edit
- `assets/items.js`, `feed.xml`, `data/archive.json`: made by `build.py`; do not edit by hand
- `assets/on.js`, `assets/site.css`: how the pages are drawn and styled
- `build.py`: the gatherer
- `setup/publish.yml`: the GitHub workflow (see below)
- `check.py`, `robots.txt`, `CNAME`, `.nojekyll`: shared with the other Yoso sites

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

The sign-up form asks for an email address first; pressing **Continue** shows a list of Yoso's newsletters (The Vault, Yosokuro, Shinsei, River, On), with this site's own one already ticked. Each ticked box reaches Buttondown as a tag (`one`, `yosokuro`, `shinsei`, `river`, `on`), so to write to one newsletter's readers, send to that tag. The step is run by `assets/list-choice.js`, which is the same file on every site; without it the boxes simply show under the email field and the form still works. To add or rename a newsletter, change the boxes in every form, `NEWSLETTERS` in `check.py`, and this list, on every site.
