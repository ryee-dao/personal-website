import './styles.css';
import { site, problems, about, contact, tracker, type Problem, type DemoId } from './content';
import { makeGuy, type Pose } from './guy';
import type { Demo } from './demos/types';
import { reducedMotion } from './demos/types';
import { mountBreak } from './demos/breakDemo';
import { mountDance } from './demos/danceDemo';
import { mountListings } from './demos/listingsDemo';

const mounts: Record<DemoId, (el: HTMLElement) => Demo> = { break: mountBreak, dance: mountDance, listings: mountListings };
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const START = 88; // where the divider sits before you touch it (% from the left)
const DONE = 12; // drag past this and the problem counts as fixed

// ── page ──────────────────────────────────────────────────────
const problemHTML = (p: Problem) => `
  <section class="problem" id="${p.id}" style="--k:var(${p.accent})">
    <div class="stamp">
      <span class="num time">${esc(p.time)}</span><span>${esc(p.note)}</span>
      <span class="meter"><span class="num"></span><span>${esc(p.meter.label)}</span></span>
    </div>
    <div class="cmp">
      <div class="side before">
        <span class="tag">before</span>
        <h2>${esc(p.before.quote)}</h2>
        <p>${esc(p.before.text)}</p>
        <div class="mess"><svg></svg>${p.before.tabs ? `<div class="tabs" aria-hidden="true">${'<i></i>'.repeat(p.before.tabs)}</div>` : ''}</div>
      </div>
      <div class="side after">
        <div class="in">
          <div class="story">
            <span class="tag">after · ${esc(p.after.tag)}</span>
            <h3>${esc(p.after.title)}</h3>
            <p>${esc(p.after.why)}</p>
            <p class="learned">${esc(p.after.learned)}</p>
            <a class="btn" href="${esc(p.after.link.url)}" target="_blank" rel="noopener">${esc(p.after.link.label)} ↗</a>
          </div>
          <div class="demo"></div>
        </div>
      </div>
      <div class="handle" aria-hidden="true"></div>
      <input class="divider" type="range" min="0" max="100" value="${START}" aria-label="Drag left to fix: ${esc(p.after.tag)}">
    </div>
    <div class="under">
      <button class="link fix">Or tap here to fix it</button>
      <button class="link undo" hidden>↺ Show the before again</button>
    </div>
  </section>`;

document.title = site.title;
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="wrap">
    <nav>
      <a class="brand" href="#top">${esc(site.name)}</a>
      <span><a href="#about">About</a><a href="#contact">Contact</a><button class="theme" aria-label="Switch between light and dark">◐</button></span>
    </nav>
    <header class="intro" id="top">
      <h1>${esc(site.headline.replace('{name}', site.name))} <em>${esc(site.headlineAccent)}</em></h1>
      <p>${esc(site.intro)}</p>
    </header>
    <main>${problems.map(problemHTML).join('')}</main>
    <section class="card about" id="about">
      <h2>${esc(about.heading)}</h2>
      ${about.paragraphs.map((t) => `<p>${esc(t)}</p>`).join('')}
      <div class="facts">${about.facts.map((f) => `<span><b class="num">${esc(f.big)}</b>${esc(f.small)}</span>`).join('')}</div>
    </section>
    <section class="card contact" id="contact">
      <h2>${esc(contact.heading)}</h2>
      <p>${esc(contact.text)}</p>
      <a class="mail" href="mailto:${esc(site.email)}">${esc(site.email)}</a>
      <p class="links">${site.github ? `<a href="${esc(site.github)}" target="_blank" rel="noopener">GitHub ↗</a>` : ''}${site.linkedin ? `<a href="${esc(site.linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a>` : ''}</p>
    </section>
  </div>
  <div class="tracker" aria-live="polite"><b>0</b>/${problems.length} ${esc(tracker.progress)}</div>`;

// ── light / dark ──────────────────────────────────────────────
const root = document.documentElement;
const stored = (() => { try { return localStorage.getItem('theme'); } catch { return null; } })();
if (stored === 'light' || stored === 'dark') root.dataset.theme = stored;
document.querySelector('.theme')!.addEventListener('click', () => {
  const now = root.dataset.theme ?? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  root.dataset.theme = now === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch { /* private mode: fine */ }
});

// ── drag to fix ───────────────────────────────────────────────
const fixedIds = new Set<DemoId>();
const trackerEl = document.querySelector<HTMLElement>('.tracker')!;
const paintTracker = () => {
  trackerEl.innerHTML = fixedIds.size === problems.length
    ? `${esc(tracker.done)} <a href="#contact">${esc(tracker.doneLink)}</a>`
    : `<b>${fixedIds.size}</b>/${problems.length} ${esc(tracker.progress)}`;
  document.querySelector('.contact')!.classList.toggle('lit', fixedIds.size === problems.length);
};

const guys: Array<(t: number) => void> = [];

problems.forEach((p) => {
  const sec = document.getElementById(p.id)!;
  const cmp = sec.querySelector<HTMLElement>('.cmp')!, input = sec.querySelector<HTMLInputElement>('.divider')!;
  const meter = sec.querySelector<HTMLElement>('.meter .num')!;
  const fixBtn = sec.querySelector<HTMLButtonElement>('.fix')!, undoBtn = sec.querySelector<HTMLButtonElement>('.undo')!;
  const demo = mounts[p.id](sec.querySelector<HTMLElement>('.demo')!);
  let progress = 0;

  const paint = (v: number) => {
    progress = Math.min(1, Math.max(0, (START - v) / (START - DONE)));
    cmp.style.setProperty('--x', v + '%');
    meter.textContent = Math.round(p.meter.from + (p.meter.to - p.meter.from) * progress) + p.meter.unit;
    meter.classList.toggle('good', progress > 0.6);
  };
  const fix = () => {
    if (fixedIds.has(p.id)) return;
    paint(0);
    cmp.classList.add('fixed');
    fixBtn.hidden = true;
    undoBtn.hidden = false;
    fixedIds.add(p.id);
    paintTracker();
    demo.start();
  };
  const unfix = () => {
    demo.stop();
    cmp.classList.remove('fixed', 'touched');
    fixBtn.hidden = false;
    undoBtn.hidden = true;
    input.value = String(START);
    paint(START);
    fixedIds.delete(p.id);
    paintTracker();
  };

  input.addEventListener('input', () => {
    cmp.classList.add('touched');
    paint(+input.value);
    if (+input.value <= DONE) fix();
  });
  fixBtn.addEventListener('click', () => {
    cmp.classList.add('touched');
    if (reducedMotion()) return fix();
    const from = +input.value, t0 = performance.now();
    const step = (t: number) => {
      const kk = Math.min(1, (t - t0) / 600), v = from * (1 - kk * kk);
      input.value = String(v);
      paint(v);
      if (kk < 1) requestAnimationFrame(step); else fix();
    };
    requestAnimationFrame(step);
  });
  undoBtn.addEventListener('click', unfix);
  paint(START);
  if (new URLSearchParams(location.search).has('open')) fix(); // add ?open to the URL to start with every demo open

  // the little guy cheers up as you drag
  const draw = makeGuy(sec.querySelector<SVGSVGElement>('.mess svg')!);
  const sad: Pose = p.before.pose;
  guys.push((t) => { if (!fixedIds.has(p.id)) draw(progress > 0.6 ? 'dance' : sad, t); });
});

const loop = (ts: number) => { guys.forEach((g) => g(ts / 1000)); requestAnimationFrame(loop); };
requestAnimationFrame(loop);
