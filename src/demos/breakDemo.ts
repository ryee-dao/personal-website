// Break enforcer demo: a short work block, then the "overdue" window appears over
// the site and slowly grows until you take the break. You can drag it around the
// screen. Taking the break fills the whole window.
import type { Demo } from './types';

const WORK_SECONDS = 12; // the real app: 45 minutes
const GROW_EVERY = 3; // seconds between growth steps (real app: 3 minutes)
const STEPS = 5; // the real app grows 5 times, up to 40% of the screen
const BREAK_SECONDS = 5;

type Phase = 'idle' | 'work' | 'overdue' | 'break' | 'done';

export function mountBreak(el: HTMLElement): Demo {
  el.innerHTML = `
    <div class="bd">
      <span class="label">Work block · sped up from 45 minutes</span>
      <span class="bd-time num">0:${String(WORK_SECONDS).padStart(2, '0')}</span>
      <p class="bd-status" aria-live="polite"></p>
      <button class="btn small bd-again" hidden>Run it again</button>
    </div>`;
  const time = el.querySelector<HTMLElement>('.bd-time')!, status = el.querySelector<HTMLElement>('.bd-status')!;
  const again = el.querySelector<HTMLButtonElement>('.bd-again')!;

  // The window floats over the whole site, like the real one floats over your desktop.
  const win = document.createElement('div');
  win.className = 'overdue-win';
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', 'Overdue: time for a break');
  win.hidden = true;
  win.innerHTML = `
    <button class="ow-x" aria-label="Try to close">✕</button>
    <strong class="ow-title">OVERDUE</strong>
    <span class="ow-time num">+0:00</span>
    <button class="ow-palm">🌴 Take the break</button>
    <small class="ow-nag"></small>
    <button class="ow-skip" hidden>demo: skip</button>`;
  document.body.append(win);
  const title = win.querySelector<HTMLElement>('.ow-title')!, owTime = win.querySelector<HTMLElement>('.ow-time')!;
  const palm = win.querySelector<HTMLButtonElement>('.ow-palm')!, nag = win.querySelector<HTMLElement>('.ow-nag')!;
  const skip = win.querySelector<HTMLButtonElement>('.ow-skip')!;

  let phase: Phase = 'idle', since = 0, timer = 0;
  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  const enter = (next: Phase) => {
    phase = next;
    since = performance.now();
    win.hidden = next !== 'overdue' && next !== 'break';
    win.classList.toggle('on-break', next === 'break');
    again.hidden = next !== 'done';
    if (next === 'work') { pos.x = pos.y = 0; win.style.transform = ''; status.textContent = 'Working… the window shows up when time runs out.'; win.dataset.step = '0'; }
    if (next === 'overdue') { status.textContent = 'Time is up. See the window? It grows until you take the break.'; title.textContent = 'OVERDUE'; palm.hidden = false; nag.textContent = 'Drag me anywhere.'; }
    skip.hidden = next !== 'break';
    if (next === 'break') { title.textContent = 'BREAK'; palm.hidden = true; nag.textContent = 'Look at something that isn\'t a screen.'; pos.x = pos.y = 0; win.style.transform = ''; skip.focus(); }
    if (next === 'done') { status.textContent = 'Break taken. In the real app the only way to lose is to click stop.'; time.textContent = '0:00'; }
  };

  const tick = () => {
    const s = (performance.now() - since) / 1000;
    if (phase === 'work') {
      const left = Math.max(0, WORK_SECONDS - s);
      time.textContent = mmss(Math.ceil(left));
      if (left <= 0) enter('overdue');
    } else if (phase === 'overdue') {
      win.dataset.step = String(Math.min(STEPS - 1, Math.floor(s / GROW_EVERY)));
      owTime.textContent = '+' + mmss(s);
      time.textContent = 'overdue';
    } else if (phase === 'break') {
      const left = Math.max(0, BREAK_SECONDS - s);
      owTime.textContent = String(Math.ceil(left));
      if (left <= 0) enter('done');
    }
  };

  // Drag it anywhere on screen and it stays there. Push it off the edge and it slides back in.
  let drag: { x: number; y: number } | null = null;
  const pos = { x: 0, y: 0 };
  const place = () => { win.style.transform = pos.x || pos.y ? `translate(${pos.x}px, ${pos.y}px)` : ''; };
  const keepOnScreen = () => {
    const r = win.getBoundingClientRect(), pad = 8;
    if (r.left < pad) pos.x += pad - r.left;
    if (r.right > innerWidth - pad) pos.x -= r.right - (innerWidth - pad);
    if (r.top < pad) pos.y += pad - r.top;
    if (r.bottom > innerHeight - pad) pos.y -= r.bottom - (innerHeight - pad);
    place();
  };
  win.addEventListener('pointerdown', (e) => {
    if (phase !== 'overdue' || (e.target as HTMLElement).closest('button')) return;
    drag = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    win.setPointerCapture(e.pointerId);
    win.classList.add('dragging');
  });
  win.addEventListener('pointermove', (e) => {
    if (!drag) return;
    pos.x = e.clientX - drag.x;
    pos.y = e.clientY - drag.y;
    place();
  });
  const release = () => {
    if (!drag) return;
    drag = null;
    win.classList.remove('dragging');
    const before = `${pos.x},${pos.y}`;
    keepOnScreen();
    if (phase === 'overdue') nag.textContent = before === `${pos.x},${pos.y}` ? 'Move me all you like. I keep growing.' : 'Not off the screen, though.';
  };
  win.addEventListener('pointerup', release);
  win.addEventListener('pointercancel', release);
  win.addEventListener('transitionend', (e) => { if (e.propertyName === 'width' && phase === 'overdue' && !drag) keepOnScreen(); });
  addEventListener('resize', () => { if (phase === 'overdue') keepOnScreen(); });

  win.querySelector('.ow-x')!.addEventListener('click', () => {
    win.classList.remove('shake');
    void win.offsetWidth; // restart the animation
    win.classList.add('shake');
    if (phase === 'overdue') nag.textContent = 'Nice try.';
  });
  palm.addEventListener('click', () => enter('break'));
  skip.addEventListener('click', () => enter('done'));
  again.addEventListener('click', () => enter('work'));

  return {
    start() {
      if (timer) return;
      enter('work');
      timer = window.setInterval(tick, 200);
    },
    stop() {
      clearInterval(timer);
      timer = 0;
      phase = 'idle';
      win.hidden = true;
    },
  };
}
