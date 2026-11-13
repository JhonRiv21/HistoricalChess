// Match page: duel header, score race, analyzed game, gallery and facts.
import { h, half } from '../lib/dom.js';
import { createGameViewer } from '../components/game-viewer.js';
import { createGallery, photoImg } from '../components/gallery.js';
import { createScoreRace } from '../components/score-race.js';

function playerCard(player, side) {
  return h('figure', { class: `duel-player is-${side}` },
    h('div', { class: 'duel-photo' }, photoImg(player.photo, { loading: 'eager' })),
    h('figcaption', {},
      h('span', { class: 'duel-role', text: player.role }),
      h('strong', { class: 'duel-name', text: player.name }),
      h('span', { class: 'duel-meta', text: `${player.country}, Elo ${player.elo}` })));
}

export function renderMatch(match) {
  const race = createScoreRace({ match, onOpenGame: () => openGame() });
  const viewer = createGameViewer({ game: match.featuredGame, white: match.white, black: match.black });
  const gameSection = h('section', { class: 'section game', id: 'partida' },
    h('div', { class: 'section-head' },
      h('h2', { class: 'section-title', text: `Partida ${match.featuredGame.round}` }),
      h('p', { class: 'section-sub', text: `${match.white.short} con blancas, 1–0. ${match.featuredGame.opening} (${match.featuredGame.eco}). Usa las flechas del teclado.` })),
    viewer.el);

  const openGame = () => {
    gameSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    viewer.el.focus({ preventScroll: true });
  };

  const el = h('div', { class: 'view view-match' },
    h('nav', { class: 'crumbs', 'aria-label': 'Ruta' }, h('a', { href: '#inicio', text: 'Todos los campeonatos' }), h('span', { text: ` / ${match.title}` })),
    h('header', { class: 'duel' },
      playerCard(match.white, 'a'),
      h('div', { class: 'duel-center' },
        h('h1', { class: 'duel-title', text: match.title }),
        h('p', { class: 'duel-score', 'aria-label': `${match.white.short} ${half(match.score[0])}, ${match.black.short} ${half(match.score[1])}` },
          h('span', { text: half(match.score[0]) }), h('span', { class: 'duel-dash', text: '–' }), h('span', { text: half(match.score[1]) })),
        h('p', { class: 'duel-place', text: `${match.site}, del ${match.dates}` }),
        h('p', { class: 'duel-verdict', text: `${match.white.short} gana el título` })),
      playerCard(match.black, 'b')),
    h('section', { class: 'section race-section' },
      h('h2', { class: 'section-title', text: 'Partida a partida' }),
      race.el),
    gameSection,
    h('section', { class: 'section photos' },
      h('h2', { class: 'section-title', text: 'Galería' }),
      createGallery(match.gallery, match.galleryNote)),
    h('section', { class: 'section facts' },
      h('h2', { class: 'section-title', text: 'Para contar en la sobremesa' }),
      h('ul', { class: 'fact-list' }, match.facts.map((f) => h('li', { text: f.text }))),
      h('p', { class: 'sources' }, 'Fuente: ', match.sources.map((src) => h('a', { href: src.href, target: '_blank', rel: 'noopener', text: src.label })))));

  return { el, destroy: () => { viewer.destroy(); race.destroy(); } };
}
