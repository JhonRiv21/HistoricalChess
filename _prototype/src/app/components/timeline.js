// Horizontal rail of every championship, grouped by era.
import { h, half } from '../lib/dom.js';
import { ERAS, MATCHES, eraOf } from '../../content/matches.js';

const KIND_TAG = { tournament: 'Torneo', forfeit: 'Sin match', knockout: 'Eliminatorio', upcoming: 'Próximo' };

function scoreText(match) {
  if (!match.score) return null;
  const base = `${half(match.score[0])}–${half(match.score[1])}`;
  return match.tiebreak ? `${base}, rápidas ${half(match.tiebreak[0])}–${half(match.tiebreak[1])}` : base;
}

function card(match) {
  const players = match.winner && match.loser
    ? [h('strong', { text: match.winner }), h('span', { class: 'vs', text: ` vence a ${match.loser}` })]
    : match.players ? [h('strong', { text: match.players.join(' – ') })] : [h('strong', { text: match.winner })];
  const body = [
    h('span', { class: 'tl-year', text: String(match.year) }),
    match.line ? h('span', { class: 'tl-line', text: match.line }) : null,
    h('span', { class: 'tl-players' }, players),
    scoreText(match) ? h('span', { class: 'tl-score', text: scoreText(match) }) : null,
    match.site ? h('span', { class: 'tl-site', text: match.site }) : null,
    match.note ? h('span', { class: 'tl-note', text: match.note }) : null,
    KIND_TAG[match.kind] ? h('span', { class: `tl-tag tag-${match.kind}`, text: KIND_TAG[match.kind] }) : null,
    match.missingPgn ? h('span', { class: 'tl-tag tag-missing', text: 'Partidas por conseguir' }) : null,
  ];
  const cls = `tl-card kind-${match.kind}${match.page ? ' has-page' : ''}`;
  return h('li', { id: `y-${match.year}` }, match.page ? h('a', { href: `#${match.page}`, class: cls }, body) : h('div', { class: cls }, body));
}

export function createTimeline() {
  const groups = ERAS.map((era) => {
    const items = MATCHES.filter((m) => eraOf(m.year).id === era.id);
    return h('li', { class: `tl-era era-${era.id}` },
      h('h3', { class: 'tl-era-title', text: era.label }),
      h('ol', { class: 'tl-cards' }, items.map(card)));
  });
  const rail = h('ol', { class: 'tl-rail', tabindex: '0', 'aria-label': 'Línea de tiempo de los campeonatos, desplazable' }, groups);
  return h('div', { class: 'timeline' }, rail);
}
