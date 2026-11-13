// Home hero: the featured champions side by side as one group picture. The lineup is the selector;
// the chosen champion widens and comes into focus. Auto-advances unless motion is reduced or paused.
import { h, prefersReducedMotion } from '../lib/dom.js';
import { onSettingsChange } from '../lib/settings.js';
import { FEATURED } from '../../content/champions.js';
import { MATCHES } from '../../content/matches.js';
import { photoImg } from './gallery.js';

const INTERVAL_MS = 7000;
const ICONS = { pause: 'M9 6v12M15 6v12', play: 'M8 5l11 7-11 7z' };

function matchLink(champion) {
  const match = MATCHES.find((m) => m.year === champion.matchYear && m.page);
  return match
    ? h('a', { class: 'btn btn-primary', href: `#${match.page}`, text: `Ver el match de ${champion.matchYear}` })
    : h('a', { class: 'btn', href: `#y-${champion.matchYear}`, text: `Buscar ${champion.matchYear} en la línea de tiempo` });
}

export function createHeroLineup() {
  let index = 0;
  let timer = null;
  let paused = false;

  const tabs = FEATURED.map((c, i) => {
    const tab = h('button', {
      type: 'button', role: 'tab', id: `lineup-tab-${c.id}`, class: 'lineup-face',
      'aria-controls': 'lineup-panel', onClick: () => { select(i); restart(); },
    }, photoImg(c.photo, { loading: 'eager', alt: '' }), h('span', { class: 'lineup-name', text: c.short }));
    return tab;
  });

  const reign = h('span', { class: 'lineup-reign' });
  const name = h('h2', { class: 'lineup-title' });
  const country = h('span', { class: 'lineup-country' });
  const line = h('p', { class: 'lineup-line' });
  const cta = h('div', { class: 'lineup-cta' });
  const pauseBtn = h('button', { type: 'button', class: 'icon-btn', onClick: () => { paused = !paused; restart(); } });

  const panel = h('div', { class: 'lineup-panel', id: 'lineup-panel', role: 'tabpanel', 'aria-live': 'polite' },
    h('div', { class: 'lineup-text' }, reign, name, country, line), h('div', { class: 'lineup-actions' }, cta, pauseBtn));

  const list = h('div', { class: 'lineup', role: 'tablist', 'aria-label': 'Elegir campeón' }, tabs);
  list.addEventListener('keydown', (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      select(event.key === 'Home' ? 0 : FEATURED.length - 1, true);
    } else if (step) {
      event.preventDefault();
      select(index + step, true);
    }
  });

  const el = h('section', { class: 'hero hero-lineup', 'aria-label': 'Campeones del mundo' }, list, panel);

  function select(next, moveFocus = false) {
    index = (next + FEATURED.length) % FEATURED.length;
    const champion = FEATURED[index];
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      tab.setAttribute('aria-label', FEATURED[i].name);
    });
    if (moveFocus) tabs[index].focus();
    panel.setAttribute('aria-labelledby', tabs[index].id);
    reign.textContent = `Campeón ${champion.reign}`;
    name.textContent = champion.name;
    country.textContent = champion.country;
    line.textContent = champion.line;
    cta.replaceChildren(matchLink(champion));
  }

  function renderPause(autoplay) {
    pauseBtn.hidden = !autoplay && !paused;
    pauseBtn.setAttribute('aria-label', paused ? 'Reanudar el cambio automático' : 'Pausar el cambio automático');
    pauseBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paused ? ICONS.play : ICONS.pause}"/></svg>`;
  }

  function restart() {
    clearInterval(timer);
    const autoplay = !paused && !prefersReducedMotion();
    if (autoplay) timer = setInterval(() => select(index + 1), INTERVAL_MS);
    renderPause(!prefersReducedMotion());
  }

  el.addEventListener('pointerenter', () => clearInterval(timer));
  el.addEventListener('pointerleave', restart);
  el.addEventListener('focusin', () => clearInterval(timer));
  el.addEventListener('focusout', (event) => { if (!el.contains(event.relatedTarget)) restart(); });
  const stopListening = onSettingsChange(restart);

  select(0);
  restart();
  return { el, destroy: () => { clearInterval(timer); stopListening(); } };
}
