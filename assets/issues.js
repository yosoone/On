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
  opens:  the day of the issue's new moon (YYYY-MM-DD); closes: the day before
          the next one. New work the sites publish in between appears under
          'This moon so far' by itself. since: (optional) start later than opens.
  past:   'Moons ago': pieces from the same moon in earlier years. Same forms as
          pieces, plus { ref: "link", note: "長月, 30 October 2021" } for a piece
          from the stream with a line saying when it was made.
          A written piece may also carry original, image, alt, credit, label, when.
          wide: true sets a written piece across the full width.

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
    opens: "2026-10-11",
    closes: "2026-11-08",
    since: "2026-10-21",
    intro: "A beta issue. From now on, On follows the moon: each issue opens at a new moon and takes the old name of its month. This is 長月 Nagatsuki, the ninth month, which opened at the new moon on 11 October. The almanac calls this season 霜降 Sōkō, frost descends, and says brief light rain falls now and then. In Miyazaki there is no frost, and the ants are still at work. No. 1, 神無月 Kannazuki, opens at the new moon on 9 November. At the end of the issue, Moons ago: what this moon held in earlier years.",
    pieces: [
      {
        title: "Touching You With My Eyes",
        wide: true,
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
    ],
    past: [
      {
        label: "Moons ago",
        when: "長月, 1694",
        title: "Matsuo Bashō",
        original: "所思\n此道や行人なしに秋の暮",
        text: "Kono michi ya\nyuku hito nashi ni\naki no kure\n\nMy thoughts:\nthis road —\nno one going along it,\nautumn dusk.",
        credit: "Written in the ninth month of Genroku 7 (1694), the month before Bashō died. Text as printed in 泥足編『其便』 (1694). English version for On.",
        more: { label: "Source: Fujita Shin'ichi, Kansai University", link: "https://kansai-u.repo.nii.ac.jp/record/5031/files/KU-1100-20180301-16.pdf" }
      },
      {
        label: "Moons ago",
        when: "c. 1857",
        title: "Utagawa Hiroshige, Maples at Mama",
        image: "https://images.metmuseum.org/CRDImages/as/web-large/DP121529.jpg",
        alt: "Woodblock print: red maple leaves framing a view of the Tekona Shrine and a bridge at Mama",
        link: "https://www.metmuseum.org/art/collection/search/37096",
        text: "The last microseason of this moon, 楓蔦黄 momiji tsuta kibamu, maple and ivy leaves turn yellow, begins on 2 November.",
        credit: "From One Hundred Famous Views of Edo. The Metropolitan Museum of Art, New York, public domain (JP646).",
        more: { label: "On The Met's site", link: "https://www.metmuseum.org/art/collection/search/37096" }
      },
      { ref: "https://kuro.yoso.one/#f-r024259", note: "長月, 30 October 2021" }
    ]
  }
];
