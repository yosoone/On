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
  //     more: { label: "Drafts on One", link: "https://one.yoso.one/..." }
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
    number: 1,
    title: "神無月 Kannazuki",
    date: "2026-11-09",
    opens: "2026-11-09",
    closes: "2026-12-08",
    intro: "",
    pieces: [
      {
        title: "Psychonaut Monk – The Alchemist of Stillness",
        wide: true,
        date: "2026-11-09",
        quote: "His breath was the steadying anchor, the rope tethering him to the shores of consensus reality as he plunged into the oceanic depths of consciousness.",
        text: "Within the self-drawn boundary of intention, he sat, observing the ritualistic simplicity of his existence: the dawn meditation before the sun breached the horizon, the mindful consumption of electronic media, the hours spent in silent contemplation or the rhythmic execution of simple chores. His robe was coarse, his possessions few, his distractions consciously pruned back like errant branches, allowing the core trunk of his awareness to mould consciousness. He practised the ancient art of non-attachment to the world's shimmering lures.\n\nBut this austerity was not solely for piety's sake, nor merely the path to a conventional heaven. It was the meticulously prepared laboratory, the launchpad for voyages of a different kind. For when the outward world faded through the discipline of stillness, another unfurled – vast, intricate and profoundly real. Here, he was the psychonaut.\n\nHis breath was the steadying anchor, the rope tethering him to the shores of consensus reality as he plunged into the oceanic depths of consciousness. The disciplined mind, honed by monastic practice, became the vessel – sturdy, resilient, capable of navigating the volatile currents of inner space. He journeyed not with chemicals brewed in hidden labs, but primarily through the alchemy of focused awareness, turning the lead of mundane thought into golden insight.\n\nHe charted landscapes unseen by ordinary eyes: corridors of memory gleaming with forgotten light, fractal gardens of perception blooming and dissolving in an instant, shadowy caverns where personal demons whispered tempting lies or profound truths. He encountered archetypes that shimmered with numinous power, deciphered symbols bubbling up from the collective wellspring, and touched states of being where the boundaries of the self grew porous, bleeding into a universal, interconnected awareness.\n\nHis vows – silence, simplicity, focus – were the psychonaut's essential tools. Silence allowed him to hear the subtle frequencies of the inner world. Simplicity cleared the mental clutter, preventing the ego's static from drowning out the signal. Focus was the lens, bringing clarity to the often chaotic visions.\n\nHe was a cartographer charting the labyrinth of the human psyche, a deep-sea diver exploring the pressure-filled trenches of the subconscious. The monk provided the discipline, the ethical framework, the unwavering commitment. The psychonaut provided the daring, the curiosity, the willingness to face whatever arose from the depths. He sought not escape, but understanding; not transcendence from the world, but transcendence of self within it. His monastery was the boundless territory of interconnected Mind, his pilgrimage an inward spiral towards the luminous, mysterious core of existence itself.\n\nTo each life and space he encountered, he simply bowed with love and kindness.\n\nMay the force be with you.",
        sign: "Yoso\nMiyazaki, Japan."
      },
      "https://river.yoso.one/#t294",
      "https://river.yoso.one/#t318",
      "https://river.yoso.one/#t321",
      "https://river.yoso.one/#t320"
    ],
    past: []
  },
  {
    number: 0,
    title: "長月 Nagatsuki",
    date: "2026-10-30",
    opens: "2026-10-11",
    closes: "2026-11-08",
    since: "2026-10-21",
    intro: "",
    pieces: [
      {
        title: "Touching You With My Eyes",
        wide: true,
        date: "2026-10-29",
        text: "Touching you with my eyes,\nreveals a void filled by desire.\nIs it what I have been seeking?\nThe incertitude of temptation.\n\nThere is no you or I, a living memory.\nAll that is left are pure sensations,\na fire within, resonance of an echo that burned with desire.\n\nSeeking release, surrender, flowing feelings, embrace,\nthe loss of past pleasures; there is more than one path to ecstasy.\n\nWhen lust and love dissolve, it is you that I\nsee. It was always you, peeking in the darkness. A void.\n\nWhat is your name,\nwhat is your face?\nDo you even know love?",
        sign: "Yoso\nMiyazaki, Japan.",
        more: { label: "Drafts and handwritten notes on One", link: "https://one.yoso.one/Writings/Touching+You+With+My+Eyes" }
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
        when: "葉月, 5 October 2025",
        title: "Hyperactive Ants",
        text: "Chasing, Chasing, Chasing...\nDream Hunter..\nAre you getting ready for the winter?",
        sign: "Yoso"
      },
      { ref: "https://kuro.yoso.one/#f-r024259", note: "長月, 30 October 2021" },
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
      {
        label: "Moons ago",
        when: "長月, 1694",
        title: "Matsuo Bashō",
        original: "所思\n此道や行人なしに秋の暮",
        text: "Kono michi ya\nyuku hito nashi ni\naki no kure\n\nMy thoughts:\nthis road —\nno one going along it,\nautumn dusk.",
        credit: "Written in the ninth month of Genroku 7 (1694), the month before Bashō died. Text as printed in 泥足編『其便』 (1694). English version for On.",
        more: { label: "Source: Fujita Shin'ichi, Kansai University", link: "https://kansai-u.repo.nii.ac.jp/record/5031/files/KU-1100-20180301-16.pdf" }
      }
    ]
  }
];
