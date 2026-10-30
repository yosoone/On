/* On: the moon calendar. Draws the moon widget on the front page and the year of moons
   (moons.html) from moons.js, in Japan time. Nothing here needs editing for a new year:
   run moons.py to extend moons.js. */
(function () {
  "use strict";
  var DATA = window.ON_MOONS;
  if (!DATA) return;
  var MONTHS = DATA.months;
  var ISSUES = window.ON_ISSUES || [];
  var SVG = "http://www.w3.org/2000/svg";

  var NAMES = [null,
    ["睦月", "Mutsuki"], ["如月", "Kisaragi"], ["弥生", "Yayoi"], ["卯月", "Uzuki"],
    ["皐月", "Satsuki"], ["水無月", "Minazuki"], ["文月", "Fumizuki"], ["葉月", "Hazuki"],
    ["長月", "Nagatsuki"], ["神無月", "Kannazuki"], ["霜月", "Shimotsuki"], ["師走", "Shiwasu"]];

  // The 24 solar terms, from 立春 (315°)
  var SEKKI = [
    ["立春", "Risshun", "spring begins"], ["雨水", "Usui", "rain water"], ["啓蟄", "Keichitsu", "insects awaken"],
    ["春分", "Shunbun", "spring equinox"], ["清明", "Seimei", "clear and bright"], ["穀雨", "Kokuu", "grain rain"],
    ["立夏", "Rikka", "summer begins"], ["小満", "Shōman", "lesser fullness"], ["芒種", "Bōshu", "grain in ear"],
    ["夏至", "Geshi", "summer solstice"], ["小暑", "Shōsho", "lesser heat"], ["大暑", "Taisho", "greater heat"],
    ["立秋", "Risshū", "autumn begins"], ["処暑", "Shosho", "heat abates"], ["白露", "Hakuro", "white dew"],
    ["秋分", "Shūbun", "autumn equinox"], ["寒露", "Kanro", "cold dew"], ["霜降", "Sōkō", "frost descends"],
    ["立冬", "Rittō", "winter begins"], ["小雪", "Shōsetsu", "lesser snow"], ["大雪", "Taisetsu", "greater snow"],
    ["冬至", "Tōji", "winter solstice"], ["小寒", "Shōkan", "lesser cold"], ["大寒", "Daikan", "greater cold"]];

  // The 72 kō, from 立春. English versions for On.
  var KOU = [
    ["東風解凍", "Harukaze kōri o toku", "the east wind melts the ice"],
    ["黄鶯睍睆", "Kōō kenkan su", "bush warblers sing in the hills"],
    ["魚上氷", "Uo kōri o izuru", "fish rise through the ice"],
    ["土脉潤起", "Tsuchi no shō uruoi okoru", "rain moistens the soil"],
    ["霞始靆", "Kasumi hajimete tanabiku", "mist begins to trail"],
    ["草木萌動", "Sōmoku mebae izuru", "grass and trees bud"],
    ["蟄虫啓戸", "Sugomori mushi to o hiraku", "hibernating insects open their doors"],
    ["桃始笑", "Momo hajimete saku", "peach trees first blossom"],
    ["菜虫化蝶", "Namushi chō to naru", "caterpillars become butterflies"],
    ["雀始巣", "Suzume hajimete sukū", "sparrows begin to nest"],
    ["櫻始開", "Sakura hajimete saku", "cherry blossoms first open"],
    ["雷乃発声", "Kaminari sunawachi koe o hassu", "thunder raises its voice"],
    ["玄鳥至", "Tsubame kitaru", "swallows arrive"],
    ["鴻雁北", "Kōgan kaeru", "wild geese fly north"],
    ["虹始見", "Niji hajimete arawaru", "rainbows first appear"],
    ["葭始生", "Ashi hajimete shōzu", "reeds first sprout"],
    ["霜止出苗", "Shimo yamite nae izuru", "the frost ends, rice seedlings grow"],
    ["牡丹華", "Botan hana saku", "peonies bloom"],
    ["蛙始鳴", "Kawazu hajimete naku", "frogs begin to sing"],
    ["蚯蚓出", "Mimizu izuru", "earthworms come up"],
    ["竹笋生", "Takenoko shōzu", "bamboo shoots sprout"],
    ["蚕起食桑", "Kaiko okite kuwa o hamu", "silkworms wake and eat mulberry"],
    ["紅花栄", "Benibana sakau", "safflowers flourish"],
    ["麦秋至", "Mugi no toki itaru", "the wheat ripens"],
    ["蟷螂生", "Kamakiri shōzu", "mantises hatch"],
    ["腐草為螢", "Kusaretaru kusa hotaru to naru", "rotting grass becomes fireflies"],
    ["梅子黄", "Ume no mi kibamu", "plums turn yellow"],
    ["乃東枯", "Natsukarekusa karuru", "self-heal withers"],
    ["菖蒲華", "Ayame hana saku", "irises bloom"],
    ["半夏生", "Hange shōzu", "crow-dipper sprouts"],
    ["温風至", "Atsukaze itaru", "warm winds blow"],
    ["蓮始開", "Hasu hajimete hiraku", "lotuses first open"],
    ["鷹乃学習", "Taka sunawachi waza o narau", "young hawks learn to fly"],
    ["桐始結花", "Kiri hajimete hana o musubu", "paulownia begins to set seed"],
    ["土潤溽暑", "Tsuchi uruōte mushi atsushi", "damp earth, humid heat"],
    ["大雨時行", "Taiu tokidoki furu", "heavy rain falls now and then"],
    ["涼風至", "Suzukaze itaru", "cool winds blow"],
    ["寒蝉鳴", "Higurashi naku", "evening cicadas sing"],
    ["蒙霧升降", "Fukaki kiri matō", "thick fog lingers"],
    ["綿柎開", "Wata no hana shibe hiraku", "cotton bolls open"],
    ["天地始粛", "Tenchi hajimete samushi", "heaven and earth begin to cool"],
    ["禾乃登", "Kokumono sunawachi minoru", "the rice ripens"],
    ["草露白", "Kusa no tsuyu shiroshi", "dew shines white on the grass"],
    ["鶺鴒鳴", "Sekirei naku", "wagtails sing"],
    ["玄鳥去", "Tsubame saru", "swallows leave"],
    ["雷乃収声", "Kaminari sunawachi koe o osamu", "thunder falls silent"],
    ["蟄虫坏戸", "Mushi kakurete to o fusagu", "insects close their doors"],
    ["水始涸", "Mizu hajimete karuru", "the fields are drained"],
    ["鴻雁来", "Kōgan kitaru", "wild geese return"],
    ["菊花開", "Kiku no hana hiraku", "chrysanthemums bloom"],
    ["蟋蟀在戸", "Kirigirisu to ni ari", "crickets at the door"],
    ["霜始降", "Shimo hajimete furu", "first frost"],
    ["霎時施", "Kosame tokidoki furu", "brief light rain falls now and then"],
    ["楓蔦黄", "Momiji tsuta kibamu", "maples and ivy turn"],
    ["山茶始開", "Tsubaki hajimete hiraku", "camellias first open"],
    ["地始凍", "Chi hajimete kōru", "the land begins to freeze"],
    ["金盞香", "Kinsenka saku", "daffodils bloom"],
    ["虹蔵不見", "Niji kakurete miezu", "rainbows hide"],
    ["朔風払葉", "Kitakaze konoha o harau", "the north wind strips the leaves"],
    ["橘始黄", "Tachibana hajimete kibamu", "tachibana fruit begins to yellow"],
    ["閉塞成冬", "Sora samuku fuyu to naru", "the sky closes, winter sets in"],
    ["熊蟄穴", "Kuma ana ni komoru", "bears go into their dens"],
    ["鱖魚群", "Sake no uo muragaru", "salmon gather"],
    ["乃東生", "Natsukarekusa shōzu", "self-heal sprouts"],
    ["麋角解", "Sawashika no tsuno otsuru", "deer shed their antlers"],
    ["雪下出麦", "Yuki watarite mugi nobiru", "wheat sprouts under the snow"],
    ["芹乃栄", "Seri sunawachi sakau", "water parsley flourishes"],
    ["水泉動", "Shimizu atataka o fukumu", "springs stir"],
    ["雉始雊", "Kiji hajimete naku", "pheasants begin to call"],
    ["款冬華", "Fuki no hana saku", "butterbur buds"],
    ["水沢腹堅", "Sawamizu kōri tsumeru", "ice thickens on the streams"],
    ["鶏始乳", "Niwatori hajimete toya ni tsuku", "hens begin to lay"]];

  // Named nights of the lunar month
  var NIGHTS = {
    1: ["朔", "Tsuitachi", "the new moon"],
    3: ["三日月", "Mikazuki", "the third-night moon"],
    13: ["十三夜", "Jūsanya", "the thirteenth night"],
    15: ["十五夜", "Jūgoya", "the fifteenth night"],
    16: ["十六夜", "Izayoi", "the hesitating moon"],
    17: ["立待月", "Tachimachizuki", "the moon you wait for standing"],
    18: ["居待月", "Imachizuki", "the moon you wait for sitting"],
    19: ["寝待月", "Nemachizuki", "the moon you wait for lying down"],
    20: ["更待月", "Fukemachizuki", "the moon you wait up late for"],
    23: ["二十三夜", "Nijūsanya", "the twenty-third night"]
  };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function addDays(s, n) { var d = new Date(s + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return iso(d); }
  function todayJST() { return iso(new Date(Date.now() + 9 * 3600e3)); }
  function longDate(s) {
    return new Date(s + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
  }
  function fullDate(s) {
    return new Date(s + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  }
  function shortMonth(s) {
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(s.slice(5, 7), 10) - 1];
  }
  function kanjiNum(n) {
    var d = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    if (n < 10) return d[n];
    return (n >= 20 ? d[Math.floor(n / 10)] : "") + "十" + d[n % 10];
  }
  function monthName(m) {
    var n = NAMES[m.m];
    return { k: (m.leap ? "閏" : "") + n[0], r: (m.leap ? "Urū " : "") + n[1] };
  }
  function phaseName(e) {
    if (e < 6 || e > 354) return "new moon";
    if (e < 84) return "waxing crescent";
    if (e < 96) return "first quarter";
    if (e < 174) return "waxing gibbous";
    if (e < 186) return "full moon";
    if (e < 264) return "waning gibbous";
    if (e < 276) return "last quarter";
    return "waning crescent";
  }
  function lit(e) { return (1 - Math.cos(e * Math.PI / 180)) / 2; }

  // Which kō (and solar term) is in force on a day
  function kouOn(day) {
    var cur = null, next = null;
    for (var i = 0; i < DATA.kou.length; i++) {
      if (DATA.kou[i][0] <= day) cur = DATA.kou[i];
      else { next = DATA.kou[i]; break; }
    }
    return { cur: cur, next: next };
  }
  var kouStarts = {};
  DATA.kou.forEach(function (k) { kouStarts[k[0]] = k[1]; });

  function monthOf(day) {
    for (var i = MONTHS.length - 1; i >= 0; i--) if (MONTHS[i].start <= day) return i;
    return -1;
  }
  function issueFor(m) {
    for (var i = 0; i < ISSUES.length; i++) if (ISSUES[i].opens === m.start) return ISSUES[i];
    return null;
  }
  function dateOf(stamp) { return stamp.slice(0, 10); }
  function timeOf(stamp) { return stamp.slice(11, 16); }

  /* One moon as an SVG. e: the moon's angle from the sun (0 new, 180 full).
     Seen from Japan: the waxing moon is lit on the right. */
  function moon(e, size) {
    var r = 10, c = 12;
    var s = document.createElementNS(SVG, "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("width", size);
    s.setAttribute("height", size);
    s.setAttribute("class", "moon");
    s.setAttribute("aria-hidden", "true");
    s.setAttribute("focusable", "false");
    var disc = document.createElementNS(SVG, "circle");
    disc.setAttribute("cx", c); disc.setAttribute("cy", c); disc.setAttribute("r", r);
    disc.setAttribute("class", "moon-dark");
    s.appendChild(disc);
    var k = lit(e);
    if (k > 0.015) {
      var p = document.createElementNS(SVG, "path");
      if (k > 0.985) {
        p.setAttribute("d", "M" + c + " " + (c - r) + "A" + r + " " + r + " 0 1 1 " + c + " " + (c + r) + "A" + r + " " + r + " 0 1 1 " + c + " " + (c - r) + "Z");
      } else {
        var cos = Math.cos(e * Math.PI / 180);
        var rx = Math.abs(cos) * r;
        var waxing = e < 180;
        var outer = waxing ? 1 : 0;                       // lit limb: right when waxing
        var inner = (cos > 0) === waxing ? 0 : 1;         // terminator: bulges toward the lit limb for a crescent
        p.setAttribute("d", "M" + c + " " + (c - r) +
          "A" + r + " " + r + " 0 0 " + outer + " " + c + " " + (c + r) +
          "A" + rx.toFixed(2) + " " + r + " 0 0 " + inner + " " + c + " " + (c - r) + "Z");
      }
      p.setAttribute("class", "moon-lit");
      s.appendChild(p);
    }
    var rim = document.createElementNS(SVG, "circle");
    rim.setAttribute("cx", c); rim.setAttribute("cy", c); rim.setAttribute("r", r);
    rim.setAttribute("class", "moon-rim");
    s.appendChild(rim);
    return s;
  }

  /* The nights of one lunar month as a row of moons */
  function nights(m, today) {
    var ol = el("ol", "nights");
    var fullDay = dateOf(m.full), fq = dateOf(m.fq), lq = dateOf(m.lq);
    for (var i = 0; i < m.days; i++) {
      var day = addDays(m.start, i), e = m.el[i], n = i + 1;
      var li = el("li", "night");
      if (day === today) { li.classList.add("today"); li.setAttribute("aria-current", "date"); }
      if (day === fullDay) li.classList.add("full");
      li.appendChild(el("span", "n-lunar", String(n))).setAttribute("aria-hidden", "true");
      li.appendChild(moon(e, 28));
      var dnum = new Date(day + "T12:00:00Z").getUTCDate();
      var dl = el("span", "n-date", String(dnum));
      dl.setAttribute("aria-hidden", "true");
      li.appendChild(dl);
      if (n === 1 || dnum === 1) {
        dl.setAttribute("data-m", shortMonth(day));
        li.appendChild(el("span", "n-month", shortMonth(day))).setAttribute("aria-hidden", "true");
      }
      var kk = kouStarts[day], tag = "";
      if (kk != null && kk % 3 === 0) { tag = SEKKI[kk / 3][0]; li.appendChild(el("span", "n-term", tag)).setAttribute("aria-hidden", "true"); }
      var words = [fullDate(day), "night " + n, phaseName(e)];
      if (day === fullDay) words.push("full moon at " + timeOf(m.full));
      if (day === fq) words.push("first quarter at " + timeOf(m.fq));
      if (day === lq) words.push("last quarter at " + timeOf(m.lq));
      if (n === 1) words.push("new moon at " + timeOf(m.nm));
      if (kk != null) words.push((kk % 3 === 0 ? SEKKI[kk / 3][0] + " " + SEKKI[kk / 3][1] + " begins; " : "") + KOU[kk][0] + " " + KOU[kk][1]);
      if (day === today) words.push("today");
      li.title = words.join(" · ");
      li.appendChild(el("span", "visually-hidden", words.join(", ")));
      ol.appendChild(li);
    }
    return ol;
  }

  /* ---------- the moon as a widget: small, medium or large ---------- */
  function widget(box, size) {
    var today = todayJST();
    var mi = monthOf(today);
    if (mi < 0 || today >= MONTHS[MONTHS.length - 1].next.slice(0, 10)) { box.hidden = true; return; }
    var m = MONTHS[mi], idx = Math.round((Date.parse(today) - Date.parse(m.start)) / 864e5), n = idx + 1;
    var e = m.el[idx], name = monthName(m);
    var night = NIGHTS[n] || (n === m.days ? ["晦", "Misoka", "the last night of the month"] : null);
    var toNew = Math.round((Date.parse(dateOf(m.next)) - Date.parse(today)) / 864e5);
    var ko = kouOn(today), ki = ko.cur ? ko.cur[1] : null;

    var w = el("a", "moon-widget");
    w.href = "moons.html";
    w.dataset.size = size;
    var words = ["Tonight's moon", name.k + " " + kanjiNum(n) + "日", name.r + ", night " + n, phaseName(e), Math.round(lit(e) * 100) + "% lit"];
    if (night) words.push(night[0] + " " + night[1]);
    if (ki != null) words.push(SEKKI[Math.floor(ki / 3)][0] + " " + SEKKI[Math.floor(ki / 3)][1], KOU[ki][0] + " " + KOU[ki][1]);
    words.push("new moon in " + toNew + (toNew === 1 ? " day" : " days"), "the year of moons");
    w.setAttribute("aria-label", words.join(", "));

    var top = el("span", "mw-kicker");
    top.appendChild(el("span", null, "今宵 TONIGHT"));
    if (size !== "small") top.appendChild(el("span", null, fullDate(today).toUpperCase()));
    var mn = moon(e, size === "small" ? 72 : 104);
    var date = el("span", "mw-date", name.k + " " + kanjiNum(n) + "日");
    var sub = el("span", "mw-sub", size === "small"
      ? Math.round(lit(e) * 100) + "% · " + phaseName(e).replace(" moon", "")
      : name.r + " · night " + n + " · " + Math.round(lit(e) * 100) + "%");

    if (size === "small") {
      w.append(top, mn, date, sub);
    } else {
      var txt = el("span", "mw-text");
      txt.append(date, sub);
      if (night) {
        var nl = el("span", "mw-line");
        nl.appendChild(el("span", "k", night[0]));
        nl.appendChild(document.createTextNode(" " + night[1]));
        txt.appendChild(nl);
      }
      if (ki != null) {
        var sl = el("span", "mw-line");
        sl.appendChild(el("span", "k", SEKKI[Math.floor(ki / 3)][0] + " · " + KOU[ki][0]));
        sl.appendChild(document.createTextNode(" " + KOU[ki][2]));
        txt.appendChild(sl);
      }
      txt.appendChild(el("span", "mw-next", "New moon in " + toNew + (toNew === 1 ? " day" : " days") + " · " + parseInt(m.next.slice(8, 10), 10) + " " + shortMonth(m.next)));
      var body = el("span", "mw-body");
      body.append(mn, txt);
      w.append(top, body);
      if (size === "large") {
        var row = el("span", "mw-row");
        for (var i = 0; i < m.days; i++) {
          var c = el("span", "mw-night" + (i === idx ? " today" : ""));
          c.appendChild(moon(m.el[i], 14));
          row.appendChild(c);
        }
        w.appendChild(row);
      }
    }
    box.replaceChildren(w);
  }
  window.OnMoon = { widget: widget };

  /* ---------- the year of moons ---------- */
  function year(box) {
    var today = todayJST();
    var years = [];
    MONTHS.forEach(function (m) { if (years.indexOf(m.y) < 0) years.push(m.y); });
    var params = new URLSearchParams(location.search);
    var mi = monthOf(today);
    var y = parseInt(params.get("y"), 10);
    if (years.indexOf(y) < 0) y = mi >= 0 ? MONTHS[mi].y : years[0];
    var ms = MONTHS.filter(function (m) { return m.y === y; });
    document.documentElement.classList.toggle("moons-13", ms.length > 12);   // a year with a leap month prints a little smaller

    var title = document.getElementById("year-title");
    if (title) title.textContent = "The year of moons, " + y;
    document.title = "On: the year of moons, " + y;
    var span = document.getElementById("year-span");
    if (span) span.textContent = ms.length + " moons, from 睦月 Mutsuki on " + fullDate(ms[0].start) +
      " to the day before the next old New Year, " + fullDate(addDays(ms[ms.length - 1].start, ms[ms.length - 1].days - 1)) + ".";

    var nav = document.getElementById("year-nav");
    if (nav) {
      var parts = [];
      var at = years.indexOf(y);
      if (at > 0) { var a = el("a", "btn quiet", "← " + years[at - 1]); a.href = "moons.html?y=" + years[at - 1]; parts.push(a); }
      if (at < years.length - 1) { var b = el("a", "btn quiet", years[at + 1] + " →"); b.href = "moons.html?y=" + years[at + 1]; parts.push(b); }
      var pr = el("button", "btn quiet", "Print");
      pr.type = "button";
      pr.addEventListener("click", function () { window.print(); });
      parts.push(pr);
      nav.replaceChildren.apply(nav, parts);
    }

    var list = el("ol", "year");
    // In print, one row of night numbers heads every column
    var hd = el("li", "year-head"), hn = el("ol", "nights");
    hd.setAttribute("aria-hidden", "true");
    hd.appendChild(el("span", "ym-label", "Night"));
    for (var i = 1; i <= 30; i++) hn.appendChild(el("li", "night", String(i)));
    hd.appendChild(hn);
    list.appendChild(hd);
    ms.forEach(function (m) {
      var li = el("li", "year-month");
      if (m.start <= today && today < dateOf(m.next)) li.classList.add("now");
      var nm = monthName(m), is = issueFor(m);
      var lab = el("div", "ym-label");
      var k = el(is ? "a" : "span", "ym-name");
      if (is) { k.href = "issue.html?n=" + is.number; }
      k.appendChild(el("span", "ym-k", nm.k));
      k.appendChild(el("span", "ym-r", nm.r));
      if (m.leap) k.title = "Leap month";
      lab.appendChild(k);
      lab.appendChild(el("span", "ym-dates", longDate(m.start) + " · full " + longDate(dateOf(m.full)) + (is ? " · No. " + is.number : "")));
      li.appendChild(lab);
      li.appendChild(nights(m, today));
      list.appendChild(li);
    });
    box.replaceChildren(list);
  }

  document.querySelectorAll("[data-moon-widget]").forEach(function (b) { widget(b, b.getAttribute("data-moon-widget") || "medium"); });
  var y = document.getElementById("year-of-moons");
  if (y) year(y);
})();
