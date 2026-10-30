#!/usr/bin/env python3
"""Writes assets/moons.js: the moon calendar for On (Japan time).

    pip install ephem
    python3 moons.py

Run it again only to extend the years it covers (FIRST and LAST below);
the pages read the file it writes and need nothing else.

What it works out, for every lunar month in the range:
  - the new moon that opens it, and its first quarter, full moon and last quarter;
  - its number and name in the old lunisolar calendar (kyūreki 旧暦), by the rules
    modern kyūreki calendars follow: a month starts on the day (JST) of its new moon,
    takes its number from the principal solar term (chūki 中気) that falls in it, and a
    month without one, in a year of thirteen months, is a leap month (urūzuki 閏月);
  - the phase of the moon each night (its angle from the sun, at 21:00 JST);
and the start date of each of the 24 solar terms and 72 kō (every 5° of the sun).

Dates follow the computed sky, so they can differ by a day from some printed
calendars when a new moon or solar term falls close to midnight.
"""
import datetime as dt
import json
import math
from pathlib import Path

import ephem

FIRST, LAST = 2026, 2030          # old lunar years covered (Mutsuki of FIRST to Shiwasu of LAST)
JST = dt.timedelta(hours=9)
OUT = Path(__file__).resolve().parent / "assets" / "moons.js"


def to_jst(d):
    return ephem.Date(d).datetime() + JST


def from_jst(t):
    return ephem.Date(t - JST)


def sun_lon(d):
    d = ephem.Date(d)
    return math.degrees(ephem.Ecliptic(ephem.Sun(d), epoch=d).lon) % 360


def moon_elong(d):
    d = ephem.Date(d)
    m = math.degrees(ephem.Ecliptic(ephem.Moon(d), epoch=d).lon)
    return (m - sun_lon(d)) % 360


def crossings(start, end, step_deg=5):
    """Times the sun's longitude passes each multiple of step_deg."""
    out, t = [], ephem.Date(start)
    prev = sun_lon(t)
    while t < end:
        t2 = ephem.Date(t + 0.5)
        cur = sun_lon(t2)
        target = (math.floor(prev / step_deg) + 1) * step_deg % 360
        passed = (cur - prev) % 360 >= (target - prev) % 360 and (target - prev) % 360 > 0
        if passed:
            lo, hi = float(t), float(t2)
            for _ in range(40):
                mid = (lo + hi) / 2
                if (sun_lon(mid) - prev) % 360 >= (target - prev) % 360:
                    hi = mid
                else:
                    lo = mid
            out.append((to_jst(hi), int(target) % 360))
        prev, t = cur, t2
    return out


def main():
    start = from_jst(dt.datetime(FIRST - 1, 11, 1))
    end = from_jst(dt.datetime(LAST + 1, 4, 1))

    terms = crossings(start, end)                                     # every 5°
    chuki = [(t, lon) for t, lon in terms if lon % 30 == 0]           # principal terms
    CHUKI_MONTH = {330: 1, 0: 2, 30: 3, 60: 4, 90: 5, 120: 6, 150: 7, 180: 8, 210: 9, 240: 10, 270: 11, 300: 12}

    news, d = [], start
    while True:
        d = ephem.next_new_moon(d)
        if d > end:
            break
        news.append(d)
        d = ephem.Date(d + 1)

    months = []
    for a, b in zip(news, news[1:]):
        a0, b0 = to_jst(a).date(), to_jst(b).date()
        cs = [CHUKI_MONTH[lon] for t, lon in chuki if a0 <= t.date() < b0]
        months.append({"a": a, "b": b, "start": a0, "end": b0, "chuki": cs})

    # Number the months; a month without a principal term is a leap month
    # only when the span between two winter-solstice months holds thirteen months.
    for m in months:
        m["m"] = m["chuki"][0] if m["chuki"] else None
        m["leap"] = False
    solst = [i for i, m in enumerate(months) if 11 in m["chuki"]]
    for i, j in zip(solst, solst[1:]):
        span = months[i + 1:j]
        missing = [k for k in range(i + 1, j) if not months[k]["chuki"]]
        if len(span) == 12 and missing:
            k = missing[0]
            months[k]["m"], months[k]["leap"] = months[k - 1]["m"], True
            missing = missing[1:]
        if missing:
            raise SystemExit("Unusual year near %s: check by hand" % months[missing[0]]["start"])

    # Old lunar year: starts with Mutsuki (month 1)
    year = None
    for m in months:
        if m["m"] == 1 and not m["leap"]:
            year = m["start"].year
        m["y"] = year   # None for months before the first Mutsuki in range: dropped below

    keep = [m for m in months if m["y"] is not None and FIRST <= m["y"] <= LAST]

    def stamp(d):
        return to_jst(d).strftime("%Y-%m-%dT%H:%M")

    out = []
    for m in keep:
        a, b = m["a"], m["b"]
        fq = ephem.next_first_quarter_moon(a)
        fm = ephem.next_full_moon(a)
        lq = ephem.next_last_quarter_moon(a)
        n = (m["end"] - m["start"]).days
        el = []
        for i in range(n):
            day = m["start"] + dt.timedelta(days=i)
            t = from_jst(dt.datetime(day.year, day.month, day.day, 21))
            el.append(round(moon_elong(t)))
        out.append({
            "y": m["y"], "m": m["m"], "leap": m["leap"],
            "start": m["start"].isoformat(), "days": n,
            "nm": stamp(a), "fq": stamp(fq), "full": stamp(fm), "lq": stamp(lq), "next": stamp(b),
            "el": el,
        })

    first, last = out[0]["start"], out[-1]["start"]
    # kō index: 0 = the first kō of 立春 (315°), one every 5°
    kou = [[t.date().isoformat(), int(((lon - 315) % 360) // 5)] for t, lon in terms
           if first <= t.date().isoformat() <= (dt.date.fromisoformat(last) + dt.timedelta(days=31)).isoformat()]

    js = ("/* On: the moon calendar, Japan time. Made by moons.py; do not edit by hand.\n"
          "   months: one per lunar month. y = old lunar year, m = month (1 = Mutsuki), leap = leap month,\n"
          "   start = first day (the new moon's day, JST), days = length, nm/fq/full/lq = new moon,\n"
          "   first quarter, full moon, last quarter (JST), next = the next new moon,\n"
          "   el = the moon's angle from the sun each night at 21:00 (0 new, 90 first quarter, 180 full).\n"
          "   kou: [first day, kō number 0-71], counted from 立春; every third one opens a solar term. */\n"
          "window.ON_MOONS = " + json.dumps({"generated": dt.date.today().isoformat(), "months": out, "kou": kou},
                                            ensure_ascii=False, separators=(",", ":")) + ";\n")
    OUT.write_text(js, encoding="utf-8")
    print("Wrote %s: %d months (%s to %s), %d kō" % (OUT.name, len(out), first, out[-1]["next"][:10], len(kou)))
    for m in out:
        print(m["y"], ("閏" if m["leap"] else "") + str(m["m"]), m["start"], m["nm"], "full", m["full"])


if __name__ == "__main__":
    main()
