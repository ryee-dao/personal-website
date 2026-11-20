// Shared little guy for skeletons K, L, M. Angles: 0 = straight down, PI = straight up.
function makeGuy(svg) {
  svg.setAttribute('viewBox', '0 0 80 130');
  svg.classList.add('guy');
  svg.innerHTML = '<line class="g-body" x1="40" y1="40" x2="40" y2="84"/><line class="g-l"/><line class="g-r"/><line class="g-l"/><line class="g-r"/>' +
    '<circle class="g-head" cx="40" cy="22" r="17"/><circle class="g-eye" cx="34" cy="20" r="2.6"/><circle class="g-eye" cx="46" cy="20" r="2.6"/>';
  const limbs = svg.querySelectorAll('.g-l, .g-r');           // armL, armR, legL, legR
  const base = [[40, 50, 30], [40, 50, 30], [40, 84, 40], [40, 84, 40]];
  let cur = [0.25, -0.25, 0.12, -0.12];
  const poses = {
    idle:   () => [0.25, -0.25, 0.12, -0.12, 0],
    dance:  (b) => [Math.PI - 0.6 + Math.sin(b) * 0.5, 1.3 + Math.sin(b + 1) * 0.6, 0.35 + Math.sin(b) * 0.2, -0.35 + Math.sin(b) * 0.2, -Math.abs(Math.sin(b)) * 6],
    type:   (b, t) => [1.15 + Math.sin(t * 24) * 0.12, 1.0 - Math.sin(t * 24) * 0.12, 1.4, 1.25, 34],
    look:   () => [1.35, -0.2, 0.12, -0.12, 0],
    sleep:  () => [0.5, -0.5, 1.25, -1.25, 30],
    burpee: (b, t) => [0.9, -0.9, 0.9 + Math.sin(t * 2) * 0.3, -0.9 - Math.sin(t * 2) * 0.3, 18 + Math.sin(t * 2) * 12],
  };
  return function draw(state, t, bpm = 110) {
    const want = (poses[state] || poses.idle)(t * bpm / 60 * Math.PI, t);
    cur = cur.map((v, i) => v + (want[i] - v) * 0.25);
    limbs.forEach((n, i) => { const [x, y, L] = base[i]; n.setAttribute('x1', x); n.setAttribute('y1', y); n.setAttribute('x2', x + Math.sin(cur[i]) * L); n.setAttribute('y2', y + Math.cos(cur[i]) * L); });
    svg.style.transform = 'translateY(' + (want[4] / 130 * 100) + '%)';
    svg.querySelectorAll('.g-eye').forEach((e) => e.setAttribute('ry', state === 'sleep' ? 0.6 : 2.6));
  };
}
const rnd = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;   // tiny repeatable random
