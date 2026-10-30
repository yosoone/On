/* On: draws the stream, the issue list and single issues from items.js and issues.js.
   Everything from the feeds is set as text, never as HTML. */
(function () {
  "use strict";
  var SITE = "https://on.yoso.one/";
  var ITEMS = window.ON_ITEMS || [];
  var SOURCES = window.ON_SOURCES || [];
  var ISSUES = (window.ON_ISSUES || []).slice().sort(function (a, b) { return b.number - a.number; });
  var PER_SOURCE = 8;      // in the 'All' view, so no one site fills the page
  var PAGE = 24;           // pieces per 'Show more' when one site is chosen
  var MOON_PER_SOURCE = 6; // in an issue's 'This moon so far', per site

  var source = {};
  SOURCES.forEach(function (s) { source[s.key] = s; });
  var byLink = {}, byUid = {};
  ITEMS.forEach(function (it) {
    byUid[it.uid] = it;
    if (!byLink[it.link] || byLink[it.link].gone) byLink[it.link] = it;
  });
  var live = ITEMS.filter(function (it) { return !it.gone; });

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function date(iso) {
    if (!iso) return "";
    var d = new Date(iso.length === 10 ? iso + "T12:00:00+09:00" : iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Tokyo" });
  }

  // The moon on the night of a piece's date (moon.js), at the end of its date line
  function moonOf(meta, stamp) {
    var b = window.OnMoon && window.OnMoon.badge(stamp);
    if (b) meta.appendChild(b);
  }

  function piece(it) {
    var s = source[it.source] || { name: it.source, kanji: "" };
    var li = el("li", "piece" + (it.image ? "" : " text") + (it.gone ? " gone" : ""));
    li.dataset.uid = it.uid;
    var a = el("a");
    a.href = it.link;
    if (it.image && it.source) {
      // Pictures open in On's viewer; Cmd/Ctrl-click still opens the original site.
      a.setAttribute("aria-haspopup", "dialog");
      a.addEventListener("click", function (e) {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        viewer.open(li);
      });
    }
    var meta = el("span", "piece-meta");
    meta.appendChild(el("span", "k", s.kanji)).setAttribute("aria-hidden", "true");
    meta.appendChild(el("span", null, s.name));
    var d = it.note || date(it.date);
    if (d) meta.appendChild(el("span", null, "· " + d));
    moonOf(meta, it.date);
    a.appendChild(meta);
    if (it.image) {
      var f = el("span", "piece-img");
      var img = el("img");
      img.src = it.image;
      img.alt = it.alt || it.title;
      img.loading = "lazy";
      img.decoding = "async";
      f.appendChild(img);
      a.appendChild(f);
    }
    // River's texts show only the verse; their title is kept for screen readers.
    var river = it.source === "river";
    a.appendChild(el("h3", river ? "visually-hidden" : null, it.title));
    if (it.summary && (river || it.summary !== it.title)) a.appendChild(el("p", "piece-summary", it.summary));
    a.appendChild(el("span", "piece-more", !it.source ? "Open the link"
      : it.gone ? "No longer on " + s.name
      : it.image ? "View larger"
      : "Read on " + s.name + " →"));
    li.appendChild(a);
    return li;
  }

  function issueLink(issue) {
    return "issue.html?n=" + encodeURIComponent(issue.number);
  }

  // A piece written straight into the issue (an object in issues.js, not a link):
  // the full text lives in the edition, with an optional link for readers who want more.
  function inlinePiece(p, i) {
    var li = el("li", "piece inline" + (p.image ? "" : " text") + (p.wide ? " feature" : ""));
    li.dataset.uid = "issue:" + i;
    var box = el("div", "piece-body");
    var meta = el("span", "piece-meta");
    meta.appendChild(el("span", null, p.label || "In this issue"));
    var d = p.when || date(p.date);
    if (d) meta.appendChild(el("span", null, "· " + d));
    moonOf(meta, p.date);
    box.appendChild(meta);
    if (p.image) {
      var f = el(p.link ? "a" : "span", "piece-img");
      if (p.link) f.href = p.link;
      var img = el("img");
      img.src = p.image;
      img.alt = p.alt || p.title;
      img.loading = "lazy";
      img.decoding = "async";
      f.appendChild(img);
      box.appendChild(f);
    }
    box.appendChild(el("h3", "feature-title", p.title));
    if (p.original) box.appendChild(el("p", "piece-original", p.original));
    if (p.text) box.appendChild(el("p", "piece-summary", p.text));
    if (p.credit) box.appendChild(el("p", "piece-credit", p.credit));
    if (p.sign) box.appendChild(el("p", "piece-sign", p.sign));
    if (p.more && p.more.link) {
      var a = el("a", "piece-more", (p.more.label || "Read more") + " →");
      a.href = p.more.link;
      box.appendChild(a);
    }
    li.appendChild(box);
    return li;
  }

  function issuePieces(issue, key) {
    return (issue[key || "pieces"] || []).map(function (ref, i) {
      if (ref && typeof ref === "object" && ref.ref) {
        var found = byLink[ref.ref] || byUid[ref.ref];
        return found ? Object.assign({}, found, { note: ref.note, label: ref.label }) : { uid: ref.ref, source: "", title: ref.ref, link: ref.ref, summary: "", image: "", gone: true };
      }
      if (ref && typeof ref === "object") return Object.assign({ inline: true, index: (key || "pieces") + i }, ref);
      return byLink[ref] || byUid[ref] || {
        uid: ref, source: "", title: ref, link: ref, summary: "Not found in On's archive: check this link in issues.js.",
        image: "", alt: "", date: "", gone: true
      };
    });
  }

  /* ---------- home: latest issue and the stream ---------- */
  function home() {
    var feature = document.getElementById("latest-issue");
    if (feature) {
      if (ISSUES.length) {
        var is = ISSUES[0];
        var a = el("a", "issue-feature");
        a.href = issueLink(is);
        a.appendChild(el("span", "issue-no", "No. " + is.number + (is.date ? " · " + date(is.date) : "")));
        a.appendChild(el("h3", "issue-title", is.title || "Issue " + is.number));
        if (is.intro) a.appendChild(el("p", "issue-intro", is.intro));
        a.appendChild(el("span", "piece-more", "Read the issue →"));
        feature.replaceChildren(a);
      }
    }

    var filters = document.getElementById("filters");
    var list = document.getElementById("stream");
    var moreRow = document.getElementById("more-row");
    var note = document.getElementById("stream-note");
    var updated = document.getElementById("updated");
    if (updated && window.ON_UPDATED) updated.textContent = "Gathered " + date(window.ON_UPDATED);
    if (!list) return;

    var params = new URLSearchParams(location.search);
    var current = source[params.get("from")] ? params.get("from") : "all";
    var shown = PAGE;

    function button(key, label, kanji) {
      var li = el("li");
      var b = el("button");
      b.type = "button";
      b.dataset.key = key;
      if (kanji) b.appendChild(el("span", "k", kanji)).setAttribute("aria-hidden", "true");
      b.appendChild(el("span", null, label));
      b.addEventListener("click", function () {
        current = key;
        shown = PAGE;
        var url = new URL(location.href);
        if (key === "all") url.searchParams.delete("from"); else url.searchParams.set("from", key);
        history.replaceState(null, "", url);
        draw();
      });
      li.appendChild(b);
      filters.appendChild(li);
    }
    if (filters) {
      button("all", "All");
      SOURCES.forEach(function (s) { button(s.key, s.name, s.kanji); });
    }

    function draw() {
      if (filters) filters.querySelectorAll("button").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.key === current));
      });
      var pick, more = false;
      if (current === "all") {
        var count = {};
        pick = live.filter(function (it) {
          count[it.source] = (count[it.source] || 0) + 1;
          return count[it.source] <= PER_SOURCE;
        });
      } else {
        var all = live.filter(function (it) { return it.source === current; });
        pick = all.slice(0, shown);
        more = all.length > shown;
      }
      list.replaceChildren.apply(list, pick.map(piece));
      moreRow.replaceChildren();
      if (more) {
        var b = el("button", "btn", "Show more");
        b.type = "button";
        b.addEventListener("click", function () { shown += PAGE; draw(); });
        moreRow.appendChild(b);
      }
      if (current !== "all" && source[current]) {
        var go = el("a", "btn quiet", "Visit " + source[current].name + " →");
        go.href = source[current].site;
        moreRow.appendChild(go);
      }
      if (note) {
        note.textContent = !pick.length
          ? (current === "all" ? "Nothing gathered yet." : "Nothing from " + source[current].name + " yet.")
          : (current === "all" ? "The newest pieces from each site. Choose a site to see everything from it." : "");
      }
    }
    draw();
  }

  /* ---------- the list of issues ---------- */
  function issues() {
    var ul = document.getElementById("issues");
    if (!ul) return;
    if (!ISSUES.length) {
      ul.replaceWith(el("p", "empty-note", "No issues yet. The first one is in preparation; the stream on the front page fills itself in the meantime."));
      return;
    }
    ISSUES.forEach(function (is) {
      var li = el("li"), a = el("a");
      a.href = issueLink(is);
      a.appendChild(el("span", "no", "No. " + is.number));
      a.appendChild(el("span", "t", is.title || "Issue " + is.number));
      a.appendChild(el("span", "d", [date(is.date), (is.pieces || []).length + " pieces"].filter(Boolean).join(" · ")));
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  /* ---------- one issue, with a copy for the newsletter ---------- */
  function letter(is, pieces, past) {
    var md = ["# On, No. " + is.number + (is.title ? ": " + is.title : ""), ""];
    if (is.intro) md.push(is.intro, "");
    function add(it) {
      if (it.inline) {
        md.push("## " + it.title, "");
        if (it.image) md.push("![" + (it.alt || it.title) + "](" + it.image + ")", "");
        if (it.original) md.push(it.original.split("\n").join("  \n"), "");
        if (it.text) md.push(it.text.split("\n").join("  \n"), "");
        if (it.credit) md.push("*" + it.credit + "*", "");
        if (it.sign) md.push(it.sign.split("\n").join("  \n"), "");
        if (it.more && it.more.link) md.push("[" + (it.more.label || "Read more") + "](" + it.more.link + ")", "");
        return;
      }
      var s = source[it.source];
      if (!s) return;          // a link On could not find stays out of the letter
      md.push("## [" + it.title + "](" + it.link + ")", "");
      if (it.image) md.push("![" + (it.alt || it.title) + "](" + it.image + ")", "");
      if (it.summary && it.summary !== it.title) md.push(it.summary.split("\n").join("  \n"), "");
      if (s) md.push("*From " + s.name + (it.note ? ", " + it.note : "") + "*", "");
    }
    pieces.forEach(add);
    if (past && past.length) {
      md.push("---", "", "# " + (is.pastTitle || "Moons ago"), "");
      past.forEach(add);
    }
    md.push("---", "", "Read this issue online: " + SITE + issueLink(is));
    return md.join("\n");
  }

  function issue() {
    var root = document.getElementById("issue");
    if (!root) return;
    var param = new URLSearchParams(location.search).get("n");
    var is = param === null || param === "" ? ISSUES[0]
      : ISSUES.filter(function (x) { return x.number === Number(param); })[0];
    var head = document.getElementById("issue-head");
    var list = document.getElementById("issue-pieces");
    var tools = document.getElementById("letter");
    if (!is) {
      head.replaceChildren(el("h2", "issue-title", "Issue not found"),
        el("p", "issue-intro", ISSUES.length ? "There is no issue with that number." : "No issues yet."));
      tools.hidden = true;
      return;
    }
    document.title = "On, No. " + is.number + (is.title ? ": " + is.title : "");
    head.replaceChildren(
      el("span", "issue-no", "No. " + is.number + (is.date ? " · " + date(is.date) : "")),
      el("h2", "issue-title", is.title || "Issue " + is.number));
    if (is.intro) head.appendChild(el("p", "issue-intro", is.intro));
    function draw(ul, arr) {
      ul.replaceChildren.apply(ul, arr.map(function (it) {
        return it.inline ? inlinePiece(it, it.index) : piece(it);
      }));
    }
    var pieces = issuePieces(is);
    draw(list, pieces);

    // This moon so far: everything the sites publish between this issue's new moon
    // and the next one fills in by itself, a few per site, newest first.
    var moonSec = document.getElementById("moon-section");
    if (moonSec && is.opens) {
      var shownLinks = {};
      pieces.forEach(function (it) { if (it.link) shownLinks[it.link] = true; });
      var from = new Date((is.since || is.opens) + "T00:00:00+09:00");
      var to = is.closes ? new Date(is.closes + "T23:59:59+09:00") : null;
      var count = {};
      var fresh = live.filter(function (it) {
        var t = new Date(it.date);
        if (isNaN(t) || t < from || (to && t > to) || shownLinks[it.link]) return false;
        count[it.source] = (count[it.source] || 0) + 1;
        return count[it.source] <= MOON_PER_SOURCE;
      });
      if (fresh.length) {
        moonSec.hidden = false;
        draw(document.getElementById("moon-pieces"), fresh);
      }
    }

    var past = issuePieces(is, "past");
    var pastSec = document.getElementById("past-section");
    if (pastSec && past.length) {
      pastSec.hidden = false;
      if (is.pastTitle) document.getElementById("past-h").textContent = is.pastTitle;
      draw(document.getElementById("past-pieces"), past);
    }

    var text = letter(is, pieces, past);
    var area = document.getElementById("letter-text");
    var status = document.getElementById("letter-status");
    area.value = text;
    document.getElementById("letter-copy").addEventListener("click", function () {
      function done(ok) {
        status.textContent = ok ? "Copied. Paste it into a new email in Buttondown." : "Select the text below and copy it.";
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { area.closest("details").open = true; area.select(); done(false); });
      } else {
        area.closest("details").open = true; area.select(); done(false);
      }
    });
  }


  /* ---------- viewer: pictures large, left and right through the page ---------- */
  var viewer = (function () {
    var dlg, img, metaEl, titleEl, sumEl, visit, count, prevB, nextB, list = [], at = 0, opener = null;

    function build() {
      dlg = el("dialog", "viewer");
      dlg.setAttribute("aria-label", "Picture viewer");
      var bar = el("div", "viewer-bar");
      count = el("span", "viewer-count");
      count.setAttribute("aria-live", "polite");
      var close = el("button", "viewer-btn viewer-close", "Close ✕");
      close.type = "button";
      close.addEventListener("click", function () { dlg.close(); });
      bar.appendChild(count); bar.appendChild(close);

      var stage = el("div", "viewer-stage");
      prevB = el("button", "viewer-btn viewer-prev", "←");
      nextB = el("button", "viewer-btn viewer-next", "→");
      prevB.type = nextB.type = "button";
      prevB.setAttribute("aria-label", "Previous picture");
      nextB.setAttribute("aria-label", "Next picture");
      prevB.addEventListener("click", function () { go(-1); });
      nextB.addEventListener("click", function () { go(1); });
      var frame = el("figure", "viewer-frame");
      img = el("img");
      img.decoding = "async";
      frame.appendChild(img);
      stage.appendChild(prevB); stage.appendChild(frame); stage.appendChild(nextB);

      var cap = el("div", "viewer-cap");
      metaEl = el("p", "piece-meta");
      titleEl = el("h2", "viewer-title");
      sumEl = el("p", "viewer-summary");
      visit = el("a", "btn quiet viewer-visit");
      cap.appendChild(metaEl); cap.appendChild(titleEl); cap.appendChild(sumEl); cap.appendChild(visit);

      dlg.appendChild(bar); dlg.appendChild(stage); dlg.appendChild(cap);
      document.body.appendChild(dlg);

      dlg.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
        if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      });
      dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target === stage) dlg.close(); });
      var x0 = null;
      stage.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      stage.addEventListener("touchend", function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        x0 = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      });
      dlg.addEventListener("close", function () {
        document.documentElement.classList.remove("viewer-open");
        if (opener) { var a = opener.querySelector("a"); if (a) a.focus(); }
      });
    }

    function show() {
      var it = list[at], s = source[it.source] || { name: "", kanji: "" };
      img.alt = it.alt || it.title;
      img.src = it.image;                       // the smaller copy shows at once
      if (it.full && it.full !== it.image) {    // then the large one replaces it
        var big = new Image();
        big.onload = function () { if (list[at] === it) img.src = it.full; };
        big.src = it.full;
      }
      metaEl.replaceChildren();
      metaEl.appendChild(el("span", "k", s.kanji)).setAttribute("aria-hidden", "true");
      metaEl.appendChild(el("span", null, s.name));
      var d = date(it.date);
      if (d) metaEl.appendChild(el("span", null, "· " + d));
      titleEl.textContent = it.title;
      sumEl.textContent = it.summary && it.summary !== it.title ? it.summary : "";
      sumEl.hidden = !sumEl.textContent;
      visit.href = it.link;
      visit.textContent = "View on " + s.name + " →";
      visit.hidden = !!it.gone;
      count.textContent = (at + 1) + " / " + list.length;
      prevB.disabled = at === 0;
      nextB.disabled = at === list.length - 1;
      [list[at - 1], list[at + 1]].forEach(function (n) { if (n) new Image().src = n.image; });
    }

    function go(step) {
      var n = at + step;
      if (n < 0 || n >= list.length) return;
      at = n;
      opener = document.querySelector('[data-uid="' + CSS.escape(list[at].uid) + '"]') || opener;
      show();
    }

    return {
      open: function (li) {
        if (!dlg) build();
        var ul = li.closest("ul");
        list = [].slice.call(ul.querySelectorAll("li.piece")).map(function (n) { return byUid[n.dataset.uid]; })
          .filter(function (it) { return it && it.image && it.source; });
        at = Math.max(0, list.indexOf(byUid[li.dataset.uid]));
        opener = li;
        show();
        document.documentElement.classList.add("viewer-open");
        dlg.showModal();
        nextB.disabled ? prevB.focus() : nextB.focus();
      }
    };
  })();

  var page = document.documentElement.getAttribute("data-page");
  if (page === "home" || page === "stream") home();
  if (page === "issues") issues();
  if (page === "issue" || page === "current") issue();
})();
