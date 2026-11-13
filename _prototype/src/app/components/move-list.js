// Game score with annotation glyphs (?!, ?, ??) computed from the engine.
import { h } from '../lib/dom.js';
import { sanNodes } from '../lib/fen.js';

export function createMoveList({ moves, annotations, notation, onSelect }) {
  const buttons = [];
  const labels = [];
  const rows = [];
  for (let i = 0; i < moves.length; i += 2) {
    const cells = [moves[i], moves[i + 1]].map((move, k) => {
      if (!move) return h('span', { class: 'move empty' });
      const ply = i + k + 1;
      const klass = annotations[ply - 1].klass;
      const san = h('span', { class: 'san' }, sanNodes(move.san, notation));
      labels[ply] = { san, text: move.san };
      const button = h('button', { type: 'button', class: `move${klass ? ` is-${klass.id}` : ''}`, onClick: () => onSelect(ply) },
        san, klass ? h('span', { class: 'glyph', 'aria-label': klass.label, text: klass.glyph }) : null);
      buttons[ply] = button;
      return button;
    });
    rows.push(h('li', { class: 'move-row' }, h('span', { class: 'move-num', text: `${i / 2 + 1}.` }), ...cells));
  }
  const list = h('ol', { class: 'move-list', 'aria-label': 'Jugadas de la partida' }, rows);

  function setPly(ply) {
    buttons.forEach((b, i) => b?.toggleAttribute('aria-current', i === ply));
    const active = buttons[ply];
    if (!active) { list.scrollTop = 0; return; }
    const top = active.offsetTop;
    if (top < list.scrollTop || top > list.scrollTop + list.clientHeight - 40) {
      list.scrollTop = top - list.clientHeight / 2;
    }
  }

  function setNotation(next) {
    labels.forEach((label) => label?.san.replaceChildren(...sanNodes(label.text, next)));
  }

  return { el: list, setPly, setNotation };
}
