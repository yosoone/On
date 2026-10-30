/*
  On: issues
  ----------
  One entry per issue, newest at the top. For each piece, paste the link to it
  on its own site (the address its 'Read on …' link opens in On's stream).
  Title, picture and summary are filled in from the stream automatically.

  number: the issue number
  title:  a name for the issue (can be left empty)
  date:   the day it comes out, as YYYY-MM-DD
  intro:  a few lines that open the issue (can be left empty)
  pieces: links to the pieces, in the order they should appear

  A piece can also be written straight into the issue, so its text belongs to
  the edition. Put it in braces instead of a link:

  //   {
  //     title: "A title",
  //     date: "2026-10-29",
  //     text: "First line,\nsecond line.\n\nA new stanza.",
  //     sign: "Yoso\nMiyazaki, Japan.",
  //     more: { label: "Drafts on The Vault", link: "https://one.yoso.one/..." }
  //   },

  \n starts a new line; \n\n leaves a blank line between stanzas. 'more' is
  optional: a link at the foot for readers who want to go deeper.

  Example (remove the two slashes at the start of each line to use it):

  // {
  //   number: 1,
  //   title: "Autumn",
  //   date: "2026-11-01",
  //   intro: "A few lines to open the issue.",
  //   pieces: [
  //     "https://kuro.yoso.one/#f-r0000576",
  //     "https://river.yoso.one/#t0"
  //   ]
  // },
*/
window.ON_ISSUES = [
  {
    number: 0,
    title: "長月 Nagatsuki · Beta",
    date: "2026-10-30",
    intro: "A beta issue. From now on, On follows the moon: each issue opens at a new moon and takes the old name of its month. This is 長月 Nagatsuki, the ninth month, which opened at the new moon on 11 October. Frost descended with 霜降 Sōkō on 23 October, and the almanac says brief light rain falls now and then. In Miyazaki, the ants are still at work. No. 1, 神無月 Kannazuki, opens at the new moon on 9 November.",
    pieces: [
      {
        title: "Touching You With My Eyes",
        date: "2026-10-29",
        text: "Touching you with my eyes,\nreveals a void filled by desire.\nIs it what I have been seeking?\nThe incertitude of temptation.\n\nThere is no you or I, a living memory.\nAll that is left are pure sensations,\na fire within, resonance of an echo that burned with desire.\n\nSeeking release, surrender, flowing feelings, embrace,\nthe loss of past pleasures; there is more than one path to ecstasy.\n\nWhen lust and love dissolve, it is you that I\nsee. It was always you, peeking in the darkness. A void.\n\nWhat is your name,\nwhat is your face?\nDo you even know love?",
        sign: "Yoso\nMiyazaki, Japan.",
        more: { label: "Drafts and handwritten notes on The Vault", link: "https://one.yoso.one/Writings/Touching+You+With+My+Eyes" }
      },
      "https://river.yoso.one/#t113",
      "https://kuro.yoso.one/#f-r0000725",
      "https://river.yoso.one/#t102",
      "https://kuro.yoso.one/#f-r024801",
      "https://river.yoso.one/#t111",
      "https://kuro.yoso.one/#f-r0000141",
      "https://river.yoso.one/#t114"
    ]
  }
];
