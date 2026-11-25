// ─────────────────────────────────────────────────────────────
// ALL the words on the site live in this file. Edit here.
// Anything starting with TODO is a placeholder. Placeholder "learned" lines and About
// paragraphs are left off the page until you replace them.
// ─────────────────────────────────────────────────────────────

import type { Pose } from './guy';

export const site = {
  name: 'Ryan Dao',
  email: 'ryan@ryandao.dev',
  github: 'https://github.com/ryee-dao',
  linkedin: 'https://www.linkedin.com/in/ryedao/',

  // Browser tab title
  title: 'Ryan Dao · I build software that fixes real problems',

  // Hero. {name} is replaced with the name above.
  headline: "I'm {name}. My day had three problems.",
  headlineAccent: 'Drag to fix them.',
  // Each entry starts on its own line.
  intro: [
    'I build software for small businesses: the dashboards, automations and small tools that take a manual chore off your plate.',
    'These are three things I built for myself, and each one runs right here in your browser.',
  ],
};

export type DemoId = 'break' | 'dance' | 'realist';

export interface Problem {
  id: DemoId;
  /** CSS colour variable for this project: --a1 (orange), --a2 (violet) or --a3 (green) */
  accent: string;
  /** Time of day shown above the panel */
  time: string;
  note: string;
  /** The number that falls as you drag. TODO: replace with real numbers. */
  meter: { from: number; to: number; unit: string; label: string };
  before: { quote: string; text: string; pose: Pose; tabs?: number };
  /** `learned` stays hidden on the site while it starts with TODO. `link2` is an optional quieter second link. */
  /** `benefit` speaks to the visitor: what I could build for them. */
  after: { tag: string; title: string; why: string; benefit: string; learned: string; link: { label: string; url: string }; link2?: { label: string; url: string } };
}

export const problems: Problem[] = [
  {
    id: 'realist',
    accent: '--a3',
    time: '9:00 PM',
    note: 'House hunting',
    meter: { from: 41, to: 1, unit: '', label: 'browser tabs open' },
    before: {
      quote: 'Which tab was the cheap one?',
      text: 'I wanted an investment property and was comparing listings by memory.',
      pose: 'look',
      tabs: 41,
    },
    after: {
      tag: 'analytics dashboard',
      title: 'See what homes really sold for.',
      why: 'Realist collects public home-sale records and shows which neighbourhoods are worth a look.',
      benefit: 'Checking five websites and a spreadsheet to answer one question? I can put it on one screen that updates itself.',
      learned: 'TODO: what I learned building it, one honest line.',
      link: { label: 'Open the live dashboard', url: 'https://ryandao.dev/realist/' },
    },
  },
  {
    id: 'dance',
    accent: '--a2',
    time: '6:00 PM',
    note: 'Supposed to be exercising',
    meter: { from: 5, to: 0, unit: '', label: 'workouts skipped this week' },
    before: {
      quote: '20 burpees. Again. No.',
      text: 'I needed exercise and hated every home workout I tried.',
      pose: 'burpee',
    },
    after: {
      tag: 'dance coach',
      title: 'Put on a song and copy the coach.',
      why: 'It finds the beat in a song and makes up dance moves for you to follow.',
      benefit: 'Need something your customers or staff will actually enjoy using? I can build it as a web app that opens in any browser, with nothing to install.',
      learned: 'TODO: what I learned building it, one honest line.',
      link: { label: 'Open the real thing', url: 'https://ryandao.dev/dancedance/' },
    },
  },
  {
    id: 'break',
    accent: '--a1',
    time: '11:47 PM',
    note: 'Still at my desk',
    meter: { from: 16, to: 9, unit: 'h', label: 'hours at my desk' },
    before: {
      quote: '"Just one more thing."',
      text: "I'm a workaholic. Reminders didn't work because I ignored them.",
      pose: 'type',
    },
    after: {
      tag: 'break enforcer',
      title: 'A window that grows until I take a break.',
      why: "When I've worked too long, a window pops up and keeps growing until I step away.",
      benefit: 'I had a habit I could not break, so I built a desktop app to fix it. Have a problem of your own? I can build an app for your computer that solves it.',
      learned: 'TODO: what I learned building it, one honest line.',
      link: { label: 'Try the full demo', url: 'https://ryandao.dev/worklife/' },
    },
  },
];

export const about = {
  heading: 'About me',
  // Your photo: put the file in the public/ folder and write its name here, e.g. 'me.jpg'. Until then your initials show.
  photo: '',
  // DRAFT. Rewrite in your own words.
  paragraphs: [
    "I'm an independent software developer. I build dashboards, automations and small tools, usually starting from something a person is tired of doing by hand.",
    "My day job is testing software, so finding what breaks before a customer does is what I do all day. I bring the same care to what I build: I test it properly, explain it in plain words, and adjust when your needs change.",
  ],
};

export const work = {
  heading: 'Work with me',
  who: 'For small businesses that are doing something by hand that software should be doing.',
  choresLabel: 'For example',
  chores: ['The spreadsheet you retype every week', 'The form you copy from one system into another', 'The report nobody has time to make'],
  start: 'It starts with a free 20-minute call about the task you would most like to stop doing. Small jobs are welcome.',
  terms: [
    { big: 'Tested properly', small: 'Testing software is my day job' },
    { big: 'Built around you', small: 'It fits how you already work' },
    { big: 'Yours to keep', small: 'You own everything I build for you' },
  ],
  button: 'Tell me the task',
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
