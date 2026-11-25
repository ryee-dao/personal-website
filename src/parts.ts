// The text beside each demo and the "Work with me" card.
import { site, about, work, type Problem } from './content';

export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
/** Unfinished text in content.ts stays off the page. */
export const placeholder = (s: string) => s.trim().startsWith('TODO');

const links = (p: Problem) => `
  <p class="story-links"><a class="btn" href="${esc(p.after.link.url)}" target="_blank" rel="noopener">${esc(p.after.link.label)} ↗</a>${p.after.link2 ? `<a class="link" href="${esc(p.after.link2.url)}" target="_blank" rel="noopener">${esc(p.after.link2.label)} ↗</a>` : ''}</p>`;

/** The text beside a demo: what it does, then what I could build for the visitor. */
export function storyHTML(p: Problem): string {
  const learned = placeholder(p.after.learned) ? '' : `<p class="learned">${esc(p.after.learned)}</p>`;
  return `<span class="tag">after · ${esc(p.after.tag)}</span><h3>${esc(p.after.title)}</h3><p>${esc(p.after.why)}</p>${learned}<p class="foryou"><b>For you</b>${esc(p.after.benefit)}</p>${links(p)}`;
}

/** The "Work with me" card: the offer on the left, a short About on the right, then what you can count on. */
export function workHTML(): string {
  return `<div class="work-split">
      <div><h2>${esc(work.heading)}</h2><p>${esc(work.who)}</p>
        <div class="chores"><span class="label">${esc(work.choresLabel)}</span><ul class="points">${work.chores.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
        <p>${esc(work.start)}</p></div>
      <div class="about" id="about"><div class="about-head">${about.photo ? `<img class="avatar" src="${esc(about.photo)}" alt="${esc(site.name)}">` : `<span class="avatar" aria-hidden="true">${esc(site.name.split(' ').map((w) => w[0]).join(''))}</span>`}<h3>${esc(about.heading)}</h3></div>${about.paragraphs.filter((t) => !placeholder(t)).map((t) => `<p>${esc(t)}</p>`).join('')}</div>
    </div>
    <div class="facts">${work.terms.map((f) => `<span><b>${esc(f.big)}</b>${esc(f.small)}</span>`).join('')}</div>
    <p class="about-btns"><a class="btn" href="#contact">${esc(work.button)}</a></p>`;
}
