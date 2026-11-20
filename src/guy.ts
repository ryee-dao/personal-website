// The little stick figure. Angles: 0 = straight down, PI = straight up.
export type Pose = 'idle' | 'dance' | 'type' | 'look' | 'sleep' | 'burpee';

type PoseFn = (beat: number, t: number) => [number, number, number, number, number];

const poses: Record<Pose, PoseFn> = {
  idle: () => [0.25, -0.25, 0.12, -0.12, 0],
  dance: (b) => [Math.PI - 0.6 + Math.sin(b) * 0.5, 1.3 + Math.sin(b + 1) * 0.6, 0.35 + Math.sin(b) * 0.2, -0.35 + Math.sin(b) * 0.2, -Math.abs(Math.sin(b)) * 6],
  type: (_b, t) => [1.15 + Math.sin(t * 24) * 0.12, 1.0 - Math.sin(t * 24) * 0.12, 1.4, 1.25, 34],
  look: () => [1.35, -0.2, 0.12, -0.12, 0],
  sleep: () => [0.5, -0.5, 1.25, -1.25, 30],
  burpee: (_b, t) => [0.9, -0.9, 0.9 + Math.sin(t * 2) * 0.3, -0.9 - Math.sin(t * 2) * 0.3, 18 + Math.sin(t * 2) * 12],
};

const BASE: [number, number, number][] = [[40, 50, 30], [40, 50, 30], [40, 84, 40], [40, 84, 40]];

/** Fills an <svg> with the figure and returns a function that draws one frame. */
export function makeGuy(svg: SVGSVGElement) {
  svg.setAttribute('viewBox', '0 0 80 130');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('guy');
  svg.innerHTML =
    '<line class="g-body" x1="40" y1="40" x2="40" y2="84"/><line class="g-l"/><line class="g-r"/><line class="g-l"/><line class="g-r"/>' +
    '<circle class="g-head" cx="40" cy="22" r="17"/><circle class="g-eye" cx="34" cy="20" r="2.6"/><circle class="g-eye" cx="46" cy="20" r="2.6"/>';
  const limbs = svg.querySelectorAll<SVGLineElement>('.g-l, .g-r'); // armL, armR, legL, legR
  let cur = [0.25, -0.25, 0.12, -0.12];

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
    svg.style.transform = `translateY(${(want[4] / 130) * 100}%)`;
  };
}
