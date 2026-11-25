// Realist demo: two small pieces of the real dashboard, in tabs, on made-up data.
// The real one (ryandao.dev/realist) reads public sale records. Nothing here talks to the network.
import type { Demo } from './types';

const usd = (n: number) => '$' + n.toLocaleString('en-US');
const k = (n: number) => '$' + Math.round(n / 1000) + 'k';

// ── tab 1: ranked areas ───────────────────────────────────────
type Factor = 'yield' | 'growth' | 'price';
type Area = { name: string; median: number; yield: number; growth: number };
// name, median sale price, yearly rent as % of price, price growth over a year %
const AREAS: Area[] = [
  { name: 'Eastbank', median: 148000, yield: 9.4, growth: 6.1 },
  { name: 'Maple Hill', median: 186000, yield: 8.1, growth: 4.2 },
  { name: 'Riverside', median: 229000, yield: 7.2, growth: 7.8 },
  { name: 'Northgate', median: 274000, yield: 6.3, growth: 3.1 },
  { name: 'Canal Row', median: 312000, yield: 5.9, growth: 9.2 },
  { name: 'Old Town', median: 365000, yield: 5.5, growth: 2.4 },
  { name: 'Harbor Point', median: 428000, yield: 4.6, growth: 5.3 },
];
const GOALS: { id: string; label: string; w: Record<Factor, number> }[] = [
  { id: 'rent', label: 'Rental income', w: { yield: 4, growth: 1, price: 1 } },
  { id: 'growth', label: 'Rising prices', w: { yield: 1, growth: 4, price: 0 } },
  { id: 'cheap', label: 'Low price', w: { yield: 1, growth: 1, price: 4 } },
];

function mountRanked(el: HTMLElement) {
  const raw = (a: Area, f: Factor) => (f === 'price' ? -a.median : a[f]);
  // each area's standing on each factor among all areas, 0 (worst) to 1 (best)
  const standing = (a: Area, f: Factor) => AREAS.filter((b) => raw(b, f) < raw(a, f)).length / (AREAS.length - 1);
  el.innerHTML = `
    <div class="seg" role="group" aria-label="What matters most">${GOALS.map((g, i) => `<button data-goal="${g.id}" aria-pressed="${i === 0}">${g.label}</button>`).join('')}</div>
    <ol class="rd-rank"></ol>
    <p class="rd-foot">Pick what matters and the areas re-rank.</p>`;
  const list = el.querySelector<HTMLElement>('.rd-rank')!;
  const render = (goal: (typeof GOALS)[number]) => {
    const total = goal.w.yield + goal.w.growth + goal.w.price;
    const ranked = AREAS.map((a) => ({ a, score: ((['yield', 'growth', 'price'] as Factor[]).reduce((s, f) => s + goal.w[f] * standing(a, f), 0) / total) * 100 }))
      .sort((p, n) => n.score - p.score).slice(0, 5);
    list.innerHTML = ranked.map(({ a, score }, i) => `
      <li><span class="num">${i + 1}</span><b>${a.name}</b><span class="rd-score"><i style="width:${score.toFixed(0)}%"></i></span>
      <span class="num">${k(a.median)}</span><span class="num rd-wide">${a.yield.toFixed(1)}% rent</span><span class="num rd-wide">+${a.growth.toFixed(1)}%</span></li>`).join('');
  };
  el.querySelectorAll<HTMLButtonElement>('[data-goal]').forEach((b) =>
    b.addEventListener('click', () => {
      el.querySelectorAll('[data-goal]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      render(GOALS.find((g) => g.id === b.dataset.goal)!);
    }),
  );
  render(GOALS[0]);
}

// ── tab 2: one home for sale, checked ─────────────────────────
// mark = where on the photo the problem is, in % from the left and top
const HOMES: { street: string; area: string; asking: number; estimate: number; finding: string; mark: [number, number] }[] = [
  { street: '1423 Alder St', area: 'Eastbank', asking: 239000, estimate: 212000, finding: 'Water stain on the ceiling', mark: [64, 20] },
  { street: '88 Birch Ave', area: 'Riverside', asking: 198000, estimate: 221000, finding: 'Cracked front step', mark: [30, 82] },
  { street: '905 Dogwood Ct', area: 'Maple Hill', asking: 174000, estimate: 176000, finding: 'Peeling paint by the window', mark: [78, 48] },
];

function mountCheck(el: HTMLElement) {
  el.innerHTML = `
    <div class="rd-home">
      <div class="rd-photo" role="img"><span class="rd-mark"></span></div>
      <div class="rd-facts">
        <b class="rd-street"></b><span class="rd-area"></span>
        <dl><dt>Asking price</dt><dd class="num rd-ask"></dd><dt>Realist's estimate</dt><dd class="num rd-est"></dd></dl>
        <p class="rd-verdict"></p>
        <p class="rd-find"><span class="rd-dot"></span><span></span></p>
      </div>
    </div>
    <button class="btn small ghost rd-next">Next home →</button>
    <p class="rd-foot">It estimates a fair price and points at problems it spots in the photos.</p>`;
  const q = <T extends HTMLElement>(s: string) => el.querySelector<T>(s)!;
  let i = 0;
  const render = () => {
    const h = HOMES[i], gap = Math.round(((h.asking - h.estimate) / h.estimate) * 100);
    q('.rd-street').textContent = h.street;
    q('.rd-area').textContent = h.area;
    q('.rd-ask').textContent = usd(h.asking);
    q('.rd-est').textContent = usd(h.estimate);
    q('.rd-verdict').textContent = Math.abs(gap) < 3 ? 'Priced about right.' : gap > 0 ? `Asking ${gap}% more than the estimate.` : `Asking ${-gap}% less than the estimate.`;
    q('.rd-find span:last-child').textContent = 'Spotted in a photo: ' + h.finding.toLowerCase() + '.';
    q('.rd-photo').setAttribute('aria-label', `Drawing of a listing photo with a marker on the problem: ${h.finding.toLowerCase()}`);
    q('.rd-mark').style.cssText = `left:${h.mark[0]}%;top:${h.mark[1]}%`;
  };
  q('.rd-next').addEventListener('click', () => { i = (i + 1) % HOMES.length; render(); });
  render();
}

const TABS: { id: string; label: string; mount: (el: HTMLElement) => void }[] = [
  { id: 'areas', label: 'Find areas', mount: mountRanked },
  { id: 'listing', label: 'New listing', mount: mountCheck },
];

export function mountRealist(el: HTMLElement): Demo {
  el.innerHTML = `
    <div class="rd">
      <div class="rd-head">
        <span class="rd-brand"><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M3 17V9l7-6 7 6v8h-5v-5H8v5z" fill="currentColor"/></svg>Realist</span>
        <div class="rd-tabs" role="tablist" aria-label="Realist screens">${TABS.map((t, i) => `<button role="tab" id="rd-tab-${t.id}" aria-controls="rd-panel-${t.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${t.label}</button>`).join('')}</div>
        <span class="rd-chip">sample data</span>
      </div>
      <!-- both screens sit in the same grid cell, so the panel is always as tall as the taller one -->
      <div class="rd-body">${TABS.map((t, i) => `<div class="rd-panel${i === 0 ? ' on' : ''}" role="tabpanel" id="rd-panel-${t.id}" aria-labelledby="rd-tab-${t.id}"></div>`).join('')}</div>
    </div>`;
  const tabs = [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')], panels = [...el.querySelectorAll<HTMLElement>('.rd-panel')];
  TABS.forEach((t, i) => t.mount(panels[i]));
  const show = (n: number, focus = false) => {
    tabs.forEach((t, i) => { t.setAttribute('aria-selected', String(i === n)); t.tabIndex = i === n ? 0 : -1; });
    panels.forEach((p, i) => { p.classList.toggle('on', i === n); p.inert = i !== n; });
    if (focus) tabs[n].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(i));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') show((i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length, true);
    });
  });
  show(0);
  return { start() {}, stop() {} };
}
