// Dance coach demo: an animated coach that makes up a routine on the beat.
// No camera, no score. The beat is generated with Web Audio (nothing copyrighted),
// and sound only starts if the visitor turns it on.
import type { Demo } from './types';
import { reducedMotion } from './types';

interface Frame {
  la: [number, number]; ra: [number, number]; // arms: [upper, forearm], 0 = down, + = toward screen right
  ll: [number, number]; rl: [number, number]; // legs: [thigh, shin]
  x?: number; lean?: number; lift?: number;
}
interface Move { name: string; level: number; jump?: boolean; pose: (p: number) => Frame }

const PI = Math.PI;
// p counts beats. sw swings left/right every two beats; pulse hits once per beat.
const sw = (p: number) => Math.sin(p * PI);
const pulse = (p: number) => Math.abs(Math.sin(p * PI));

const MOVES: Move[] = [
  { name: 'Step touch', level: 0, pose: (p) => ({ la: [0.3 + sw(p) * 0.3, 0.7], ra: [-0.3 + sw(p) * 0.3, -0.7], ll: [0.12 + Math.max(0, sw(p)) * 0.35, 0], rl: [-0.12 + Math.min(0, sw(p)) * 0.35, 0], x: sw(p) * 14 }) },
  { name: 'Arm waves', level: 0, pose: (p) => ({ la: [2.2 + sw(p) * 0.5, 2.6 + sw(p) * 0.6], ra: [-2.2 + sw(p) * 0.5, -2.6 + sw(p) * 0.6], ll: [0.15, 0.05], rl: [-0.15, -0.05], x: sw(p) * 8 }) },
  { name: 'Raise the roof', level: 0, pose: (p) => ({ la: [2.2 + pulse(p) * 0.3, PI], ra: [-2.2 - pulse(p) * 0.3, -PI], ll: [0.2 + pulse(p) * 0.25, -pulse(p) * 0.3], rl: [-0.2 - pulse(p) * 0.25, pulse(p) * 0.3] }) },
  { name: 'Twist', level: 0, pose: (p) => ({ la: [0.9, 2.2 + sw(p) * 0.4], ra: [-0.9, -2.2 + sw(p) * 0.4], ll: [0.25, sw(p) * 0.3], rl: [-0.25, sw(p) * 0.3], lean: sw(p) * 0.12 }) },
  { name: 'Lasso', level: 1, pose: (p) => ({ la: [0.8, -0.9], ra: [-2.7 + Math.sin(p * 2 * PI) * 0.4, -3.1 + Math.cos(p * 2 * PI) * 0.7], ll: [0.3 + pulse(p) * 0.2, -pulse(p) * 0.4], rl: [-0.2, pulse(p) * 0.2], x: sw(p) * 10 }) },
  { name: 'Squat pulse', level: 1, pose: (p) => ({ la: [1.4, 1.6 - pulse(p) * 0.4], ra: [-1.4, -1.6 + pulse(p) * 0.4], ll: [0.5 + pulse(p) * 0.6, 0.1 - pulse(p) * 0.3], rl: [-0.5 - pulse(p) * 0.6, -0.1 + pulse(p) * 0.3] }) },
  { name: 'High knees', level: 1, pose: (p) => ({ la: [0.4 - 0.6 * Math.max(0, -sw(p)), 2.0], ra: [-0.4 + 0.6 * Math.max(0, sw(p)), -2.0], ll: [1.25 * Math.max(0, sw(p)), 0], rl: [-1.25 * Math.max(0, -sw(p)), 0] }) },
  { name: 'Side lunges', level: 2, pose: (p) => ({ la: [1.1 + sw(p) * 0.4, 1.9 - sw(p) * 0.4], ra: [-1.1 + sw(p) * 0.4, -1.9 - sw(p) * 0.4], ll: [0.2 + Math.max(0, sw(p)) * 0.9, -Math.max(0, sw(p)) * 0.2], rl: [-0.2 + Math.min(0, sw(p)) * 0.9, -Math.min(0, sw(p)) * 0.2], x: sw(p) * 26 }) },
  { name: 'Jumping jacks', level: 2, jump: true, pose: (p) => ({ la: [0.3 + pulse(p) * 2.4, 0.3 + pulse(p) * 2.6], ra: [-0.3 - pulse(p) * 2.4, -0.3 - pulse(p) * 2.6], ll: [0.1 + pulse(p) * 0.5, 0.1 + pulse(p) * 0.5], rl: [-0.1 - pulse(p) * 0.5, -0.1 - pulse(p) * 0.5], lift: pulse(p) * 12 }) },
];

const LEVELS = [
  { name: 'Chill', bpm: 96, note: 'Easy moves. Chill never jumps.' },
  { name: 'Cardio', bpm: 118, note: 'Faster, with squats and knees.' },
  { name: 'Sweaty', bpm: 138, note: 'Big moves, full out.' },
];
const BEATS_PER_MOVE = 8;
const ARM = [26, 24], LEG = [30, 30], GROUND = 222;

export function mountDance(el: HTMLElement): Demo {
  el.innerHTML = `
    <div class="dd">
      <div class="dd-stage">
        <svg viewBox="0 0 200 240" role="img" aria-label="An animated coach dancing">
          <ellipse class="dd-shadow" cx="100" cy="${GROUND + 4}" rx="44" ry="6"/>
          <polyline class="dd-limb dd-pink" data-l="rl"/><polyline class="dd-limb dd-mint" data-l="ll"/>
          <line class="dd-torso"/><rect class="dd-shorts" width="30" height="16" rx="6"/>
          <polyline class="dd-limb dd-pink" data-l="ra"/><polyline class="dd-limb dd-mint" data-l="la"/>
          <circle class="dd-head" r="16"/>
        </svg>
        <div class="dd-cards">
          <div class="dd-card now"><span class="label">Now</span><strong class="dd-now"></strong><span class="dd-dots" aria-hidden="true">${'<i></i>'.repeat(BEATS_PER_MOVE)}</span></div>
          <div class="dd-card"><span class="label">Next</span><strong class="dd-next"></strong></div>
        </div>
      </div>
      <div class="dd-controls">
        <div class="chips" role="group" aria-label="Level">${LEVELS.map((l, i) => `<button data-level="${i}" aria-pressed="${i === 0}">${l.name}</button>`).join('')}</div>
        <button class="btn small dd-play"></button>
        <button class="btn small ghost dd-sound" aria-pressed="false">Sound: off</button>
      </div>
      <p class="dd-note"><span class="dd-levelnote"></span> <span class="dd-stats"><b class="dd-count">0</b> moves · <b class="dd-bpm">96</b> BPM</span></p>
    </div>`;

  const q = <T extends Element>(s: string) => el.querySelector<T>(s)!;
  const limbs = Object.fromEntries([...el.querySelectorAll<SVGPolylineElement>('.dd-limb')].map((n) => [n.dataset.l!, n]));
  const torso = q<SVGLineElement>('.dd-torso'), shorts = q<SVGRectElement>('.dd-shorts'), head = q<SVGCircleElement>('.dd-head');
  const nowEl = q<HTMLElement>('.dd-now'), nextEl = q<HTMLElement>('.dd-next'), dots = [...el.querySelectorAll<HTMLElement>('.dd-dots i')];
  const playBtn = q<HTMLButtonElement>('.dd-play'), soundBtn = q<HTMLButtonElement>('.dd-sound');

  let level = 0, playing = false, raf = 0, beat = 0, lastTs = 0, moveIdx = -1, done = 0;
  let current = MOVES[0], next = MOVES[1], seed = 11;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = (avoid: Move) => {
    const pool = MOVES.filter((m) => m.level <= level && m !== avoid && !(level === 0 && m.jump));
    return pool[Math.floor(rand() * pool.length)];
  };

  // ── drawing ──
  const chain = (x: number, y: number, [a, b]: [number, number], [l1, l2]: number[]) => {
    const mx = x + Math.sin(a) * l1, my = y + Math.cos(a) * l1;
    return [x, y, mx, my, mx + Math.sin(b) * l2, my + Math.cos(b) * l2];
  };
  const drawFrame = (f: Frame) => {
    const reach = (leg: [number, number]) => Math.cos(leg[0]) * LEG[0] + Math.cos(leg[1]) * LEG[1];
    const hipX = 100 + (f.x ?? 0), hipY = GROUND - Math.max(reach(f.ll), reach(f.rl)) - (f.lift ?? 0);
    const lean = f.lean ?? 0, neckX = hipX + Math.sin(lean) * 56, neckY = hipY - Math.cos(lean) * 56;
    const set = (key: string, pts: number[]) => limbs[key].setAttribute('points', pts.map((n) => n.toFixed(1)).join(' '));
    set('ll', chain(hipX + 7, hipY, f.ll, LEG)); set('rl', chain(hipX - 7, hipY, f.rl, LEG));
    set('la', chain(neckX + 4, neckY + 8, f.la, ARM)); set('ra', chain(neckX - 4, neckY + 8, f.ra, ARM));
    torso.setAttribute('x1', String(hipX)); torso.setAttribute('y1', String(hipY)); torso.setAttribute('x2', String(neckX)); torso.setAttribute('y2', String(neckY));
    shorts.setAttribute('x', String(hipX - 15)); shorts.setAttribute('y', String(hipY - 8));
    head.setAttribute('cx', String(neckX + Math.sin(lean) * 16)); head.setAttribute('cy', String(neckY - 16));
  };
  const blend = (a: Frame, b: Frame, k: number): Frame => {
    const mix = (u: [number, number], v: [number, number]): [number, number] => [u[0] + (v[0] - u[0]) * k, u[1] + (v[1] - u[1]) * k];
    const num = (u = 0, v = 0) => u + (v - u) * k;
    return { la: mix(a.la, b.la), ra: mix(a.ra, b.ra), ll: mix(a.ll, b.ll), rl: mix(a.rl, b.rl), x: num(a.x, b.x), lean: num(a.lean, b.lean), lift: num(a.lift, b.lift) };
  };

  // ── sound: a kick, a hat and a bass note, all synthesised ──
  let ctx: AudioContext | null = null, master: GainNode | null = null, soundOn = false, scheduled = 0;
  const BASS = [55, 43.65, 65.41, 49];
  const blip = (when: number, freq: number, endFreq: number, dur: number, vol: number, type: OscillatorType) => {
    if (!ctx || !master) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, when); o.frequency.exponentialRampToValueAtTime(endFreq, when + dur);
    g.gain.setValueAtTime(vol, when); g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    o.connect(g).connect(master); o.start(when); o.stop(when + dur + 0.02);
  };
  const scheduleSound = () => {
    if (!ctx || !soundOn) return;
    const secPerBeat = 60 / LEVELS[level].bpm;
    // schedule every half-beat that falls in the next 150ms
    while (scheduled / 2 < beat + 0.15 / secPerBeat) {
      const when = ctx.currentTime + Math.max(0, (scheduled / 2 - beat) * secPerBeat);
      if (scheduled % 2 === 0) {
        blip(when, 150, 45, 0.16, 0.9, 'sine'); // kick
        blip(when, BASS[Math.floor(scheduled / 8) % 4] * 2, BASS[Math.floor(scheduled / 8) % 4] * 2, 0.22, 0.25, 'triangle');
      } else blip(when, 6000, 4000, 0.04, 0.12, 'square'); // hat
      scheduled++;
    }
  };

  // ── clock ──
  const paintCards = () => {
    nowEl.textContent = current.name; nextEl.textContent = next.name;
    q<HTMLElement>('.dd-count').textContent = String(done);
  };
  let onScreen = true;
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(el);
  const frame = (ts: number) => {
    if (!playing) return;
    const dt = Math.min(0.1, (ts - lastTs) / 1000); lastTs = ts;
    beat += dt * (LEVELS[level].bpm / 60);
    const idx = Math.floor(beat / BEATS_PER_MOVE), inMove = beat % BEATS_PER_MOVE;
    if (idx !== moveIdx) { if (moveIdx >= 0) { current = next; next = pick(current); done++; } moveIdx = idx; paintCards(); }
    // ease into each move over its first half beat so no move flashes by
    const prev = inMove < 0.5 && done > 0 ? blend(lastFrame, current.pose(inMove), inMove * 2) : current.pose(inMove);
    if (inMove >= 0.5) lastFrame = prev;
    if (onScreen) { // the beat keeps time off screen, but nothing is redrawn
      drawFrame(prev);
      dots.forEach((d, i) => d.classList.toggle('on', i <= Math.floor(inMove)));
    }
    scheduleSound();
    raf = requestAnimationFrame(frame);
  };
  let lastFrame: Frame = MOVES[0].pose(0);

  const setPlaying = (on: boolean) => {
    playing = on; playBtn.textContent = on ? 'Pause' : 'Play';
    cancelAnimationFrame(raf);
    if (on) { lastTs = performance.now(); scheduled = Math.ceil(beat * 2); raf = requestAnimationFrame(frame); }
  };
  const setLevel = (i: number) => {
    level = i;
    el.querySelectorAll<HTMLButtonElement>('[data-level]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.level! === i)));
    q<HTMLElement>('.dd-levelnote').textContent = LEVELS[i].note; q<HTMLElement>('.dd-bpm').textContent = String(LEVELS[i].bpm);
    if (current.level > i || (i === 0 && current.jump)) current = pick(next);
    next = pick(current); paintCards();
  };

  el.querySelectorAll<HTMLButtonElement>('[data-level]').forEach((b) => b.addEventListener('click', () => setLevel(+b.dataset.level!)));
  playBtn.addEventListener('click', () => setPlaying(!playing));
  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    if (soundOn && !ctx) { ctx = new AudioContext(); master = ctx.createGain(); master.gain.value = 0.35; master.connect(ctx.destination); }
    if (soundOn) { void ctx!.resume(); scheduled = Math.ceil(beat * 2); if (!playing) setPlaying(true); }
    soundBtn.textContent = soundOn ? 'Sound: on' : 'Sound: off'; soundBtn.setAttribute('aria-pressed', String(soundOn));
  });

  setLevel(0); drawFrame(lastFrame); setPlaying(false);

  return {
    start() { if (!reducedMotion()) setPlaying(true); },
    stop() { setPlaying(false); soundOn = false; soundBtn.textContent = 'Sound: off'; soundBtn.setAttribute('aria-pressed', 'false'); },
  };
}
