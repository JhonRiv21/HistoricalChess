// Vertical advantage bar: the white share is White's win probability.
import { h } from '../lib/dom.js';
import { formatEval, whiteWinPercent } from '../lib/evaluation.js';

export function createEvalBar() {
  const fill = h('div', { class: 'evalbar-white' });
  const label = h('span', { class: 'evalbar-label' });
  const el = h('div', { class: 'evalbar', role: 'meter', 'aria-valuemin': 0, 'aria-valuemax': 100 }, fill, label);

  function update(position) {
    const pct = whiteWinPercent(position);
    fill.style.height = `${pct}%`;
    label.textContent = formatEval(position);
    label.dataset.side = pct >= 50 ? 'white' : 'black';
    el.setAttribute('aria-valuenow', pct.toFixed(0));
    el.setAttribute('aria-label', `Evaluación ${formatEval(position)}`);
  }

  return { el, update };
}
