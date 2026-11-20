// Listings demo: a small slice of what the scraper produced, using made-up data.
// Nothing here talks to the network.
import type { Demo } from './types';

interface Listing { street: string; area: string; beds: number; sqft: number; price: number; rent: number }

const AREAS = [
  { name: 'Riverside', ppsf: 182, yield: 0.072 },
  { name: 'Old Town', ppsf: 236, yield: 0.055 },
  { name: 'Maple Hill', ppsf: 158, yield: 0.081 },
  { name: 'Northgate', ppsf: 205, yield: 0.063 },
  { name: 'Eastbank', ppsf: 131, yield: 0.094 },
];
const STREETS = ['Alder St', 'Birch Ave', 'Cedar Ln', 'Dogwood Ct', 'Elm St', 'Fern Way', 'Grove Rd', 'Hazel Dr'];

function sampleListings(count: number): Listing[] {
  let seed = 42;
  const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: count }, () => {
    const area = AREAS[Math.floor(r() * AREAS.length)];
    const beds = 1 + Math.floor(r() * r() * 5 + 0.6);
    const sqft = Math.round(520 + beds * 310 + r() * 380);
    const price = Math.round((sqft * area.ppsf * (0.82 + r() * 0.36)) / 1000) * 1000;
    const rent = Math.round(((price * area.yield) / 12) * (0.85 + r() * 0.3) / 25) * 25;
    return { street: `${100 + Math.floor(r() * 98) * 100 + Math.floor(r() * 99)} ${STREETS[Math.floor(r() * STREETS.length)]}`, area: area.name, beds, sqft, price, rent };
  });
}

const k = (n: number) => '$' + Math.round(n / 1000) + 'k';
const yieldOf = (l: Listing) => (l.rent * 12) / l.price;
const median = (xs: number[]) => (xs.length ? [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] : 0);
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export function mountListings(el: HTMLElement): Demo {
  const all = sampleListings(64);
  const maxPrice = Math.ceil(Math.max(...all.map((l) => l.price)) / 50000) * 50;
  el.innerHTML = `
    <div class="ld">
      <div class="ld-filters">
        <div class="chips" role="group" aria-label="Bedrooms"><span>Beds</span>${[0, 2, 3, 4].map((b) => `<button data-beds="${b}" aria-pressed="${b === 0}">${b ? b + '+' : 'any'}</button>`).join('')}</div>
        <label>Max price <b class="ld-maxlab"></b><input type="range" class="ld-max" min="150" max="${maxPrice}" step="10" value="${maxPrice}"></label>
      </div>
      <div class="ld-stats">
        <span><b class="num ld-n"></b>of ${all.length} listings</span>
        <span><b class="num ld-med"></b>median price</span>
        <span><b class="num ld-ppsf"></b>avg per sq ft</span>
        <span><b class="num ld-yield"></b>avg rent yield</span>
      </div>
      <div class="ld-chart" role="img" aria-label="Average price per square foot by area">
        <span class="label">Price per sq ft by area</span>
        <div class="ld-bars"></div>
      </div>
      <div class="ld-table">
        <span class="label">Best rent yield first</span>
        <table><thead><tr><th>Address</th><th>Area</th><th>Beds</th><th>Price</th><th>Rent</th><th>Yield</th></tr></thead><tbody></tbody></table>
      </div>
      <p class="ld-foot">Sample data. Nothing on this site is scraped.</p>
    </div>`;

  const q = <T extends HTMLElement>(s: string) => el.querySelector<T>(s)!;
  const max = q<HTMLInputElement>('.ld-max');
  let minBeds = 0;
  const set = (sel: string, text: string) => {
    const n = q(sel);
    if (n.textContent === text) return;
    n.textContent = text;
    n.classList.add('tick');
    window.setTimeout(() => n.classList.remove('tick'), 180);
  };

  const render = () => {
    const cap = +max.value * 1000;
    q('.ld-maxlab').textContent = k(cap);
    const rows = all.filter((l) => l.beds >= minBeds && l.price <= cap);
    set('.ld-n', String(rows.length));
    set('.ld-med', rows.length ? k(median(rows.map((l) => l.price))) : '–');
    set('.ld-ppsf', rows.length ? '$' + Math.round(mean(rows.map((l) => l.price / l.sqft))) : '–');
    set('.ld-yield', rows.length ? (mean(rows.map(yieldOf)) * 100).toFixed(1) + '%' : '–');

    const byArea = AREAS.map((a) => {
      const inArea = rows.filter((l) => l.area === a.name);
      return { name: a.name, n: inArea.length, ppsf: Math.round(mean(inArea.map((l) => l.price / l.sqft))) };
    });
    const top = Math.max(1, ...byArea.map((a) => a.ppsf));
    q('.ld-bars').innerHTML = byArea
      .map((a) => `<div class="ld-bar" title="${a.name}: ${a.n} listing${a.n === 1 ? '' : 's'}"><span>${a.name}</span><span class="track"><i style="width:${(a.ppsf / top) * 100}%"></i></span><span class="val">${a.n ? '$' + a.ppsf : '–'}</span></div>`)
      .join('');

    const best = [...rows].sort((a, b) => yieldOf(b) - yieldOf(a)).slice(0, 6);
    q('tbody').innerHTML = best.length
      ? best.map((l) => `<tr><td>${l.street}</td><td>${l.area}</td><td>${l.beds}</td><td>${k(l.price)}</td><td>$${l.rent.toLocaleString()}</td><td><b>${(yieldOf(l) * 100).toFixed(1)}%</b></td></tr>`).join('')
      : '<tr><td colspan="6">Nothing matches. Loosen a filter.</td></tr>';
  };

  max.addEventListener('input', render);
  el.querySelectorAll<HTMLButtonElement>('[data-beds]').forEach((b) =>
    b.addEventListener('click', () => {
      minBeds = +b.dataset.beds!;
      el.querySelectorAll('[data-beds]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      render();
    }),
  );
  render();

  return { start() {}, stop() {} };
}
