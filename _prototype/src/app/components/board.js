// SVG board drawn with the cm-chessboard "standard" sprite (40px tiles).
import { s } from '../lib/dom.js';
import { piecesFromFen, squareToXY } from '../lib/fen.js';

const TILE = 40;
const SIZE = TILE * 8;

function squaresLayer() {
  const layer = s('g', { class: 'squares' });
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const dark = (r + f) % 2 === 1;
      layer.append(s('rect', { x: f * TILE, y: r * TILE, width: TILE, height: TILE, class: dark ? 'sq-d' : 'sq-l' }));
    }
  }
  return layer;
}

function coordinatesLayer() {
  const layer = s('g', { class: 'coords', 'aria-hidden': 'true' });
  'abcdefgh'.split('').forEach((file, i) => {
    layer.append(s('text', { x: i * TILE + TILE - 3, y: SIZE - 3, 'text-anchor': 'end', class: i % 2 ? 'on-l' : 'on-d', text: file }));
  });
  for (let r = 0; r < 8; r++) {
    layer.append(s('text', { x: 3, y: r * TILE + 10, class: r % 2 ? 'on-d' : 'on-l', text: String(8 - r) }));
  }
  return layer;
}

function arrow(from, to) {
  const a = squareToXY(from, TILE);
  const b = squareToXY(to, TILE);
  const [x1, y1, x2, y2] = [a.x + TILE / 2, a.y + TILE / 2, b.x + TILE / 2, b.y + TILE / 2];
  const len = Math.hypot(x2 - x1, y2 - y1);
  const shorten = 11 / len;
  return s('line', {
    x1, y1, x2: x2 - (x2 - x1) * shorten, y2: y2 - (y2 - y1) * shorten,
    class: 'best-arrow', 'marker-end': 'url(#arrow-head)',
  });
}

export function createBoard() {
  const highlights = s('g', { class: 'highlights' });
  const pieces = s('g', { class: 'pieces' });
  const arrows = s('g', { class: 'arrows' });
  const defs = s('defs', {},
    s('marker', { id: 'arrow-head', viewBox: '0 0 10 10', refX: 2, refY: 5, markerWidth: 3.2, markerHeight: 3.2, orient: 'auto' },
      s('path', { d: 'M0,0 L10,5 L0,10 z', class: 'best-arrow-head' })));

  const svg = s('svg', { viewBox: `0 0 ${SIZE} ${SIZE}`, class: 'board', role: 'img' },
    defs, squaresLayer(), highlights, coordinatesLayer(), pieces, arrows);

  function render({ fen, lastMove, bestMove, label }) {
    svg.setAttribute('aria-label', label);
    highlights.replaceChildren(...(lastMove ? [lastMove.from, lastMove.to] : []).map((sq) => {
      const { x, y } = squareToXY(sq, TILE);
      return s('rect', { x, y, width: TILE, height: TILE, class: 'last-move' });
    }));
    pieces.replaceChildren(...piecesFromFen(fen).map(({ square, piece }) => {
      const { x, y } = squareToXY(square, TILE);
      return s('use', { href: `#${piece}`, x, y, width: TILE, height: TILE });
    }));
    arrows.replaceChildren(...(bestMove ? [arrow(bestMove.slice(0, 2), bestMove.slice(2, 4))] : []));
  }

  return { el: svg, render };
}
