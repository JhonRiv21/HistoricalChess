// Cumulative match score per game for both players, plus a strip of game results.
import { h, half, s } from '../lib/dom.js';
import { createTooltip, observeWidth, remPx } from '../lib/chart.js';
import { onSettingsChange } from '../lib/settings.js';

const HEIGHT = 190;


export function createScoreRace({ match, onOpenGame }) {
  const { white, black, results, notes, featuredGame } = match;
  const series = [{ player: white, cls: 'series-a', points: [0] }, { player: black, cls: 'series-b', points: [0] }];
  results.forEach((r) => {
    series[0].points.push(series[0].points.at(-1) + r);
    series[1].points.push(series[1].points.at(-1) + (1 - r));
  });
  const max = Math.ceil(Math.max(...series.map((x) => x.points.at(-1))));

  const svg = s('svg', { class: 'race-svg', height: HEIGHT, role: 'img', 'aria-label': `Marcador acumulado: ${white.short} ${half(match.score[0])}, ${black.short} ${half(match.score[1])}` });
  const chart = h('div', { class: 'race-chart' }, svg);
  const tooltip = createTooltip(chart);
  let geometry = null;

  function draw(width) {
    const rem = remPx();
    const PAD = { top: 14, right: Math.round(rem * 5.5), bottom: Math.round(rem * 1.9), left: Math.round(rem * 2) };
    const innerW = width - PAD.left - PAD.right;
    const innerH = HEIGHT - PAD.top - PAD.bottom;
    const x = (g) => PAD.left + (g / results.length) * innerW;
    const y = (v) => PAD.top + (1 - v / max) * innerH;
    geometry = { x, innerW, pad: PAD };
    svg.setAttribute('width', width);
    svg.setAttribute('viewBox', `0 0 ${width} ${HEIGHT}`);

    const grid = [0, 4, 8, 12].filter((v) => v <= max).flatMap((v) => [
      s('line', { x1: PAD.left, x2: PAD.left + innerW, y1: y(v), y2: y(v), class: 'grid' }),
      s('text', { x: PAD.left - 8, y: y(v) + 4, 'text-anchor': 'end', class: 'tick', text: String(v) }),
    ]);
    const xTicks = [1, 5, 10, 15, 21].map((g) => s('text', { x: x(g), y: HEIGHT - 8, 'text-anchor': 'middle', class: 'tick', text: String(g) }));
    const lines = series.map(({ cls, points, player }) => {
      const d = points.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
      const end = points.at(-1);
      return s('g', { class: cls },
        s('path', { d, class: 'race-line' }),
        s('circle', { cx: x(results.length), cy: y(end), r: 4, class: 'race-end' }),
        s('text', { x: x(results.length) + 9, y: y(end) + 4, class: 'race-label', text: `${player.short} ${half(end)}` }));
    });
    svg.replaceChildren(...grid, ...xTicks, ...lines, s('line', { class: 'race-cursor', y1: PAD.top, y2: PAD.top + innerH }));
  }

  svg.addEventListener('pointermove', (event) => {
    if (!geometry) return;
    const rect = svg.getBoundingClientRect();
    const g = Math.max(1, Math.min(results.length, Math.round(((event.clientX - rect.left - geometry.pad.left) / geometry.innerW) * results.length)));
    const cursor = svg.querySelector('.race-cursor');
    cursor.setAttribute('x1', geometry.x(g));
    cursor.setAttribute('x2', geometry.x(g));
    cursor.style.opacity = 1;
    const r = results[g - 1];
    const outcome = r === 1 ? `Gana ${white.short}` : r === 0 ? `Gana ${black.short}` : 'Tablas';
    tooltip.show(geometry.x(g), geometry.pad.top + 20, [`Partida ${g}: ${outcome}`, `${white.short} ${half(series[0].points[g])}, ${black.short} ${half(series[1].points[g])}`, notes[g]].filter(Boolean));
  });
  svg.addEventListener('pointerleave', () => {
    tooltip.hide();
    svg.querySelector('.race-cursor').style.opacity = 0;
  });

  const legend = h('div', { class: 'race-legend' }, series.map(({ cls, player }) =>
    h('span', { class: `legend-item ${cls}` }, h('i', { class: 'legend-swatch' }), player.name)));

  const strip = h('ol', { class: 'game-strip', 'aria-label': 'Resultado de cada partida' }, results.map((r, i) => {
    const g = i + 1;
    const winner = r === 1 ? 'a' : r === 0 ? 'b' : 'draw';
    const text = r === 0.5 ? '½' : r === 1 ? white.short[0] : black.short[0];
    const label = `Partida ${g}: ${r === 0.5 ? 'tablas' : `gana ${r === 1 ? white.short : black.short}`}${notes[g] ? `. ${notes[g]}` : ''}`;
    const featured = g === featuredGame.round;
    const cell = featured
      ? h('button', { type: 'button', class: `game-cell is-${winner} is-featured`, 'aria-label': `${label}. Ver partida analizada`, onClick: onOpenGame }, h('span', { class: 'game-no', text: String(g) }), h('span', { class: 'game-res', text }))
      : h('span', { class: `game-cell is-${winner}${notes[g] ? ' has-note' : ''}`, role: 'img', 'aria-label': label }, h('span', { class: 'game-no', text: String(g) }), h('span', { class: 'game-res', text }));
    return h('li', {}, cell);
  }));

  const sizing = observeWidth(chart, draw);
  const stopListening = onSettingsChange(() => requestAnimationFrame(sizing.redraw));
  return {
    el: h('div', { class: 'race' }, legend, chart, strip),
    destroy: () => { stopListening(); sizing.disconnect(); },
  };
}
