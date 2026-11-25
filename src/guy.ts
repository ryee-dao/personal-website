// The little stick figure. Angles: 0 = straight down, PI = straight up.
export type Pose = 'idle' | 'dance' | 'type' | 'look' | 'sleep' | 'burpee';

type PoseFn = (beat: number, t: number) => [number, number, number, number, number];

const poses: Record<Pose, PoseFn> = {
  idle: () => [0.25, -0.25, 0.12, -0.12, 0],
  dance: (b) => [Math.PI - 0.6 + Math.sin(b) * 0.5, 1.3 + Math.sin(b + 1) * 0.6, 0.35 + Math.sin(b) * 0.2, -0.35 + Math.sin(b) * 0.2, -Math.abs(Math.sin(b)) * 6],
  type: (_b, t) => [1.2 + Math.sin(t * 24) * 0.1, 1.05 - Math.sin(t * 24) * 0.1, 1.45, 1.3, 20],
  look: () => [1.35, -0.2, 0.12, -0.12, 0],
  sleep: () => [0.5, -0.5, 1.25, -1.25, 30],
  burpee: (_b, t) => [0.9, -0.9, 0.9 + Math.sin(t * 2) * 0.3, -0.9 - Math.sin(t * 2) * 0.3, 18 + Math.sin(t * 2) * 12],
};

// [x, y, length] of each limb's joint: armL, armR, legL, legR
const BASE: [number, number, number][] = [[40, 56, 24], [40, 56, 24], [40, 82, 30], [40, 82, 30]];

// How far the corners of the mouth turn: negative is a frown, positive a smile.
const MOOD: Record<Pose, number> = { idle: 1, dance: 5, type: -2.5, look: -2, sleep: 0, burpee: -3.5 };

/** Fills an <svg> with the figure and returns a function that draws one frame. */
export function makeGuy(svg: SVGSVGElement) {
  svg.setAttribute('viewBox', '0 0 80 130');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('guy');
  svg.innerHTML =
    // the desk, chair and laptop only show while typing
    '<g class="g-desk"><path class="g-furn" d="M30 88H48M39 88V110M56 71H98M90 71V110"/>' +
    '<path class="g-laptop" d="M62 68H84L90 48"/><path class="g-glow" d="M82 64L86.5 50"/></g>' +
    '<line class="g-limb" x1="40" y1="46" x2="40" y2="82"/><line class="g-limb"/><line class="g-limb"/><line class="g-limb"/><line class="g-limb"/>' +
    '<circle class="g-head" cx="40" cy="25" r="20"/>' +
    '<circle class="g-eye" cx="32" cy="24" r="3.2"/><circle class="g-eye" cx="48" cy="24" r="3.2"/>' +
    '<circle class="g-shine" cx="33.1" cy="22.8" r="1.1"/><circle class="g-shine" cx="49.1" cy="22.8" r="1.1"/>' +
    '<path class="g-mouth"/>';
  const limbs = [...svg.querySelectorAll<SVGLineElement>('.g-limb')].slice(1); // armL, armR, legL, legR
  const mouth = svg.querySelector<SVGPathElement>('.g-mouth')!;
  const desk = svg.querySelector<SVGGElement>('.g-desk')!;
  let cur = [0.25, -0.25, 0.12, -0.12];
  let mood = 0;

  return function draw(pose: Pose, t: number, bpm = 110) {
    const want = poses[pose](((t * bpm) / 60) * Math.PI, t);
    cur = cur.map((v, i) => v + (want[i] - v) * 0.25);
    limbs.forEach((n, i) => {
      const [x, y, len] = BASE[i];
      n.setAttribute('x1', String(x));
      n.setAttribute('y1', String(y));
      n.setAttribute('x2', String(x + Math.sin(cur[i]) * len));
      n.setAttribute('y2', String(y + Math.cos(cur[i]) * len));
    });
    mood += (MOOD[pose] - mood) * 0.2;
    mouth.setAttribute('d', `M35 33.5Q40 ${(33.5 + mood).toFixed(2)} 45 33.5`);
    desk.style.display = pose === 'type' ? '' : 'none';
    svg.style.transform = `translateY(${(want[4] / 130) * 100}%)`;
  };
}
