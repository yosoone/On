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

  function piece(it) {
    var s = source[it.source] || { name: it.source, kanji: "" };
    var li = el("li", "piece" + (it.image ? "" : " text") + (it.gone ? " gone" : ""));
    var a = el("a");
    a.href = it.link;
    var meta = el("span", "piece-meta");
    meta.appendChild(el("span", "k", s.kanji)).setAttribute("aria-hidden", "true");
    meta.appendChild(el("span", null, s.name));
    var d = date(it.date);
    if (d) meta.appendChild(el("span", null, "· " + d));
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
    a.appendChild(el("h3", null, it.title));
    if (it.summary && it.summary !== it.title) a.appendChild(el("p", "piece-summary", it.summary));
    a.appendChild(el("span", "piece-more", !it.source ? "Open the link" : it.gone ? "No longer on " + s.name : "Read on " + s.name + " →"));
    li.appendChild(a);
    return li;
  }

  function issueLink(issue) {
    return "issue.html?n=" + encodeURIComponent(issue.number);
  }

  function issuePieces(issue) {
    return (issue.pieces || []).map(function (ref) {
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
  function letter(is, pieces) {
    var md = ["# On, No. " + is.number + (is.title ? ": " + is.title : ""), ""];
    if (is.intro) md.push(is.intro, "");
    pieces.forEach(function (it) {
      var s = source[it.source];
      if (!s) return;          // a link On could not find stays out of the letter
      md.push("## [" + it.title + "](" + it.link + ")", "");
      if (it.image) md.push("![" + (it.alt || it.title) + "](" + it.image + ")", "");
      if (it.summary && it.summary !== it.title) md.push(it.summary.split("\n").join("  \n"), "");
      if (s) md.push("*From " + s.name + "*", "");
    });
    md.push("---", "", "Read this issue online: " + SITE + issueLink(is));
    return md.join("\n");
  }

  function issue() {
    var root = document.getElementById("issue");
    if (!root) return;
    var n = Number(new URLSearchParams(location.search).get("n"));
    var is = ISSUES.filter(function (x) { return x.number === n; })[0] || (!n && ISSUES[0]);
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
    var pieces = issuePieces(is);
    list.replaceChildren.apply(list, pieces.map(piece));

    var text = letter(is, pieces);
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

  var page = document.documentElement.getAttribute("data-page");
  if (page === "home") home();
  if (page === "issues") issues();
  if (page === "issue") issue();
})();
