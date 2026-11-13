// Shared chart plumbing: redraw on width changes and a positioned HTML tooltip.
import { h } from './dom.js';

export function observeWidth(el, draw) {
  let last = 0;
  const observer = new ResizeObserver(([entry]) => {
    const width = Math.round(entry.contentRect.width);
    if (width && width !== last) { last = width; draw(width); }
  });
  observer.observe(el);
  return { redraw: () => last && draw(last), disconnect: () => observer.disconnect() };
}

// Current size of 1rem in px, so SVG layout follows the reader's text-size setting.
export const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

export function createTooltip(host) {
  const tip = h('div', { class: 'chart-tip', role: 'status' });
  tip.hidden = true;
  host.append(tip);
  return {
    show(x, y, lines) {
      tip.replaceChildren(...lines.map((line, i) => h(i ? 'span' : 'strong', { text: line })));
      tip.hidden = false;
      const max = host.clientWidth - tip.offsetWidth - 4;
      tip.style.left = `${Math.max(4, Math.min(max, x - tip.offsetWidth / 2))}px`;
      tip.style.top = `${Math.max(0, y - tip.offsetHeight - 10)}px`;
    },
    hide() { tip.hidden = true; },
  };
}
