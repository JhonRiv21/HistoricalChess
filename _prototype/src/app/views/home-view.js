// Home: champions hero, the full timeline and a teaser for the analyzed match.
import { h } from '../lib/dom.js';
import { createHeroLineup } from '../components/hero-lineup.js';
import { createTimeline } from '../components/timeline.js';
import { photoImg } from '../components/gallery.js';

export function renderHome() {
  const heroPart = createHeroLineup();

  const teaser = h('a', { class: 'teaser', href: '#match-1972' },
    h('div', { class: 'teaser-photos' }, photoImg('fischer71'), photoImg('spassky73')),
    h('div', { class: 'teaser-text' },
      h('h2', { class: 'teaser-title', text: 'Fischer contra Spassky, Reikiavik 1972' }),
      h('p', { text: 'El match más famoso del siglo XX, con las 21 partidas, la evolución del marcador y la partida 6 analizada jugada por jugada con Stockfish.' }),
      h('span', { class: 'teaser-cta', text: 'Abrir el match' })));

  const el = h('div', { class: 'view view-home' },
    heroPart.el,
    h('section', { class: 'section intro' },
      h('h2', { class: 'section-title', text: 'Todos los campeonatos del mundo' }),
      h('p', { class: 'lede', text: 'Desde Steinitz contra Zukertort en 1886 hasta Gukesh contra Sindarov en Ginebra. Desliza la línea de tiempo y abre cualquier match para repasar sus partidas.' }),
      createTimeline()),
    h('section', { class: 'section featured' }, teaser));

  return { el, destroy: heroPart.destroy };
}
