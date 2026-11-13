// Win-probability graph for one game. Click or drag to jump to a move.
import { h, s } from '../lib/dom.js';
import { createTooltip, observeWidth } from '../lib/chart.js';
import { formatEval, whiteWinPercent } from '../lib/evaluation.js';

const HEIGHT = 150;
const PAD = { top: 10, bottom: 22, left: 4, right: 4 };

export function createEvalGraph({ positions, moves, annotations, onSelect }) {
  const svg = s('svg', { class: 'evalgraph-svg', height: HEIGHT, role: 'img', 'aria-label': 'Probabilidad de ganar de las blancas a lo largo de la partida' });
  const el = h('div', { class: 'evalgraph' }, svg);
  const tooltip = createTooltip(el);
  const pcts = positions.map(whiteWinPercent);
  let current = 0;
  let geometry = null;

  function draw(width) {
    const innerW = width - PAD.left - PAD.right;
    const innerH = HEIGHT - PAD.top - PAD.bottom;
    const x = (ply) => PAD.left + (ply / (pcts.length - 1)) * innerW;
    const y = (pct) => PAD.top + (1 - pct / 100) * innerH;
    geometry = { x, y, innerW };
    svg.setAttribute('width', width);
    svg.setAttribute('viewBox', `0 0 ${width} ${HEIGHT}`);

    const line = pcts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p).toFixed(1)}`).join('');
    const area = `${line}L${x(pcts.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;
    const mid = y(50);
    const markers = annotations
      .map((a, i) => ({ a, ply: i + 1 }))
      .filter(({ a }) => a.klass && a.klass.id !== 'inaccuracy')
      .map(({ a, ply }) => s('circle', { cx: x(ply), cy: y(pcts[ply]), r: 4, class: `mark mark-${a.klass.id}` }));
    const ticks = [10, 20, 30, 40].filter((n) => n * 2 <= pcts.length).map((n) =>
      s('text', { x: x(n * 2 - 1), y: HEIGHT - 6, 'text-anchor': 'middle', class: 'tick', text: String(n) }));

    svg.replaceChildren(
      s('rect', { x: PAD.left, y: PAD.top, width: innerW, height: innerH, class: 'graph-black' }),
      s('path', { d: area, class: 'graph-white' }),
      s('line', { x1: PAD.left, x2: PAD.left + innerW, y1: mid, y2: mid, class: 'graph-mid' }),
      s('path', { d: line, class: 'graph-line' }),
      ...markers,
      ...ticks,
      s('line', { class: 'graph-cursor', y1: PAD.top, y2: PAD.top + innerH }),
    );
    setPly(current);
  }

  function plyFromEvent(event) {
    const rect = svg.getBoundingClientRect();
    const ratio = (event.clientX - rect.left - PAD.left) / geometry.innerW;
    return Math.max(0, Math.min(pcts.length - 1, Math.round(ratio * (pcts.length - 1))));
  }

  function describe(ply) {
    if (ply === 0) return ['Posición inicial', formatEval(positions[0])];
    const move = moves[ply - 1];
    const num = `${Math.ceil(ply / 2)}${ply % 2 ? '.' : '…'}`;
    const klass = annotations[ply - 1].klass;
    return [`${num} ${move.san}${klass ? ` ${klass.glyph}` : ''}`, `Evaluación ${formatEval(positions[ply])}`, klass?.label];
  }

  svg.addEventListener('pointermove', (event) => {
    if (!geometry) return;
    const ply = plyFromEvent(event);
    tooltip.show(geometry.x(ply), geometry.y(pcts[ply]), describe(ply).filter(Boolean));
    if (event.buttons) onSelect(ply);
  });
  svg.addEventListener('pointerleave', () => tooltip.hide());
  svg.addEventListener('pointerdown', (event) => geometry && onSelect(plyFromEvent(event)));

  function setPly(ply) {
    current = ply;
    const cursor = svg.querySelector('.graph-cursor');
    if (cursor && geometry) {
      cursor.setAttribute('x1', geometry.x(ply));
      cursor.setAttribute('x2', geometry.x(ply));
    }
  }

  observeWidth(el, draw);
  return { el, setPly };
}
