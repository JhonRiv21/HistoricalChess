// Game viewer: board, eval bar, controls, engine readout, move list and eval graph.
// The engine layer can be hidden for readers who want to judge the position themselves.
import { h } from '../lib/dom.js';
import { annotateGame, formatEval, playerAccuracy } from '../lib/evaluation.js';
import { formatSan } from '../lib/fen.js';
import { getSettings, onSettingsChange } from '../lib/settings.js';
import { createBoard } from './board.js';
import { createEvalBar } from './eval-bar.js';
import { createEvalGraph } from './eval-graph.js';
import { createMoveList } from './move-list.js';

const ICONS = {
  first: 'M18 6v12M15 6l-7 6 7 6',
  prev: 'M15 6l-7 6 7 6',
  next: 'M9 6l7 6-7 6',
  last: 'M6 6v12M9 6l7 6-7 6',
};

function iconButton(id, label, onClick) {
  const button = h('button', { type: 'button', class: 'ctrl', 'aria-label': label, onClick });
  button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[id]}"/></svg>`;
  return button;
}

export function createGameViewer({ game, white, black }) {
  const { moves, positions } = game.analysis;
  const annotations = annotateGame(positions);
  const accuracy = playerAccuracy(annotations);
  const lastPly = moves.length;
  let ply = 0;
  let notation = getSettings().notation;

  const board = createBoard();
  const evalBar = createEvalBar();
  const select = (next) => go(next);
  const moveList = createMoveList({ moves, annotations, notation, onSelect: select });
  const graph = createEvalGraph({ positions, moves, annotations, onSelect: select });

  const counter = h('span', { class: 'ctrl-counter', 'aria-live': 'polite' });
  const engineEval = h('strong', { class: 'engine-eval' });
  const engineBest = h('span', { class: 'engine-best' });
  const engineVerdict = h('span', { class: 'engine-verdict' });

  const controls = h('div', { class: 'controls', role: 'group', 'aria-label': 'Navegar la partida' },
    iconButton('first', 'Ir al inicio', () => go(0)),
    iconButton('prev', 'Jugada anterior', () => go(ply - 1)),
    counter,
    iconButton('next', 'Jugada siguiente', () => go(ply + 1)),
    iconButton('last', 'Ir al final', () => go(lastPly)));

  const accuracyRow = (player, value) => h('div', { class: 'acc-row' },
    h('span', { class: 'acc-name', text: player.short }),
    h('span', { class: 'acc-track' }, h('span', { class: 'acc-fill', style: `width:${value.toFixed(1)}%` })),
    h('span', { class: 'acc-value', text: `${value.toFixed(1)} %` }));

  const engine = h('section', { class: 'engine', 'aria-label': 'Análisis del motor' },
    h('div', { class: 'engine-head' }, h('span', { class: 'engine-name', text: 'Stockfish 17.1, profundidad 18' }), engineEval),
    engineBest, engineVerdict,
    h('div', { class: 'accuracy' },
      h('span', { class: 'acc-title', text: 'Precisión en la partida' }),
      accuracyRow(white, accuracy.white), accuracyRow(black, accuracy.black),
      h('p', { class: 'acc-note', text: 'Compara cada jugada con la del motor. En partidas antiguas sirve de referencia, no de nota: los jugadores no tenían motores para preparar.' })));

  const toggle = h('button', { type: 'button', class: 'engine-toggle', role: 'switch', 'aria-checked': 'true' },
    h('span', { class: 'switch', 'aria-hidden': 'true' }), 'Mostrar el análisis del motor');

  const legend = h('p', { class: 'glyph-legend' },
    h('span', {}, h('b', { class: 'is-inaccuracy', text: '?!' }), ' imprecisión'),
    h('span', {}, h('b', { class: 'is-mistake', text: '?' }), ' error'),
    h('span', {}, h('b', { class: 'is-blunder', text: '??' }), ' error grave'));

  const el = h('div', { class: 'viewer', tabindex: '-1' },
    h('div', { class: 'viewer-board' }, evalBar.el, board.el),
    h('div', { class: 'viewer-controls' }, controls),
    h('div', { class: 'viewer-side' }, toggle, engine, moveList.el, legend),
    h('div', { class: 'viewer-graph' }, h('h3', { class: 'graph-title', text: 'Quién iba ganando, jugada a jugada' }), graph.el));

  toggle.addEventListener('click', () => {
    const on = toggle.getAttribute('aria-checked') !== 'true';
    toggle.setAttribute('aria-checked', String(on));
    el.classList.toggle('engine-off', !on);
  });

  function go(next) {
    ply = Math.max(0, Math.min(lastPly, next));
    const position = positions[ply];
    const move = moves[ply - 1];
    board.render({
      fen: position.fen,
      lastMove: move,
      bestMove: ply < lastPly ? position.best : null,
      label: ply ? `Posición tras ${Math.ceil(ply / 2)}. ${move.san}` : 'Posición inicial',
    });
    evalBar.update(position);
    moveList.setPly(ply);
    graph.setPly(ply);
    counter.textContent = ply ? `${Math.ceil(ply / 2)}${ply % 2 ? '.' : '…'} ${formatSan(move.san, notation)}` : 'Inicio';
    engineEval.textContent = formatEval(position);
    engineBest.textContent = ply < lastPly && position.bestSan ? `Mejor jugada aquí: ${formatSan(position.bestSan, notation)}` : 'Fin de la partida: Spassky abandona';
    const klass = ply ? annotations[ply - 1].klass : null;
    engineVerdict.textContent = klass ? `${formatSan(move.san, notation)} fue ${klass.label.toLowerCase()} (${klass.glyph})` : '';
    engineVerdict.dataset.klass = klass?.id ?? '';
  }

  function onKey(event) {
    if (event.target.closest('input, textarea, select, dialog')) return;
    const map = { ArrowLeft: ply - 1, ArrowRight: ply + 1, Home: 0, End: lastPly };
    if (event.key in map) { event.preventDefault(); go(map[event.key]); }
  }
  document.addEventListener('keydown', onKey);

  const stopListening = onSettingsChange((settings) => {
    if (settings.notation === notation) return;
    notation = settings.notation;
    moveList.setNotation(notation);
    go(ply);
  });

  go(0);
  return {
    el,
    destroy: () => { document.removeEventListener('keydown', onKey); stopListening(); },
  };
}
