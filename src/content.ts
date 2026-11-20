// ─────────────────────────────────────────────────────────────
// ALL the words on the site live in this file. Edit here.
// Anything in [SQUARE BRACKETS] or starting with TODO is a placeholder.
// ─────────────────────────────────────────────────────────────

import type { Pose } from './guy';

export const site = {
  name: 'Ryan Dao',
  email: 'ryeedao@gmail.com', // taken from your public realist repo; change if you want a different one
  github: 'https://github.com/ryee-dao',
  linkedin: '', // TODO: paste your LinkedIn URL; the link stays hidden while this is empty

  // Browser tab title
  title: 'Ryan Dao · I build software that fixes real problems',

  // Hero. {name} is replaced with the name above.
  headline: "I'm {name}. My day had three problems.",
  headlineAccent: 'Drag to fix them.',
  intro: 'I build automations, internal tools and websites. These are three I made for myself. Each one works right here in your browser.',
};

export type DemoId = 'break' | 'dance' | 'listings';

export interface Problem {
  id: DemoId;
  /** CSS colour variable for this project: --pink, --mint or --yellow */
  accent: string;
  /** Time of day shown above the panel */
  time: string;
  note: string;
  /** The number that falls as you drag. TODO: replace with real numbers. */
  meter: { from: number; to: number; unit: string; label: string };
  before: { quote: string; text: string; pose: Pose; tabs?: number };
  after: { tag: string; title: string; why: string; learned: string; link: { label: string; url: string } };
}

export const problems: Problem[] = [
  {
    id: 'break',
    accent: '--pink',
    time: '11:47 PM',
    note: 'still at my desk',
    meter: { from: 16, to: 9, unit: 'h', label: 'hours at my desk' },
    before: {
      quote: '"just one more thing."',
      text: "I'm a workaholic. Reminders didn't work because I ignored them.",
      pose: 'type',
    },
    after: {
      tag: 'break enforcer',
      title: "A window that grows until I stop.",
      why: "When a work block ends, a window opens and keeps growing. You can move it, but you can't get rid of it. Take the break and it fills the whole screen. The only way to lose is to click stop.",
      learned: 'TODO: what I learned building it, one honest line.',
      link: { label: 'Try the full demo', url: 'https://ryee-dao.github.io/worklife/' },
    },
  },
  {
    id: 'dance',
    accent: '--mint',
    time: '6:00 PM',
    note: 'supposed to be exercising',
    meter: { from: 5, to: 0, unit: '', label: 'workouts skipped this week' },
    before: {
      quote: '20 burpees. again. no.',
      text: 'I needed exercise and hated every home workout I tried.',
      pose: 'burpee',
    },
    after: {
      tag: 'dance coach',
      title: 'Put on a song and copy the coach.',
      why: 'It finds the beat and makes up a routine as it goes. No camera, no score, nothing to fail. The real one works with any song; this demo plays a beat it generates itself.',
      learned: 'TODO: what I learned building it, one honest line.',
      link: { label: 'Open the real thing', url: 'https://ryee-dao.github.io/dancedance/' },
    },
  },
  {
    id: 'listings',
    accent: '--yellow',
    time: '9:00 PM',
    note: 'house hunting',
    meter: { from: 41, to: 1, unit: '', label: 'browser tabs open' },
    before: {
      quote: 'which tab was the cheap one?',
      text: 'I wanted an investment property and was comparing listings by memory.',
      pose: 'look',
      tabs: 41,
    },
    after: {
      tag: 'real estate listings scraper',
      title: 'The whole market in one table.',
      why: 'It collected for-sale, rental and sold listings every day so I could sort by what matters. Everything below is made-up sample data. This site does not scrape anything.',
      learned: 'TODO: what I learned building it, one honest line.',
      link: { label: 'See the code on GitHub', url: 'https://github.com/ryee-dao/realist' },
    },
  },
];

export const about = {
  heading: 'About me',
  // TODO: rewrite these in your own words.
  paragraphs: [
    "TODO: A short, warm paragraph in first person. Who I am, what I like building, and why I went independent.",
    "TODO: I split my time between Pennsylvania and Virginia, swapping every month, so I'm used to rebuilding my whole routine and getting productive fast.",
  ],
  facts: [
    { big: '2 days', small: 'to get useful with Claude Code' },
    { big: '2 weeks', small: 'to learn Java for a real job' },
    { big: 'Every month', small: 'a new desk in a different state' },
  ],
};

export const contact = {
  heading: 'What\'s your "before"?',
  text: "If something in your day annoys you the way these annoyed me, I'd like to hear about it. Email is the easiest way to reach me.",
};

export const tracker = {
  progress: 'problems fixed',
  done: 'All 3 fixed.',
  doneLink: "What's yours?",
};
