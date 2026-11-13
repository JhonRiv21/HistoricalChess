// Tiny DOM helpers shared by the components.
export const SVG_NS = 'http://www.w3.org/2000/svg';

export function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  setAttrs(node, attrs);
  node.append(...children.flat().filter((c) => c != null && c !== false));
  return node;
}

export function s(tag, attrs = {}, ...children) {
  const node = document.createElementNS(SVG_NS, tag);
  setAttrs(node, attrs);
  node.append(...children.flat().filter((c) => c != null && c !== false));
  return node;
}

function setAttrs(node, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'text') node.textContent = value;
    else node.setAttribute(key, value === true ? '' : value);
  }
}

export const half = (n) => {
  const whole = Math.floor(n);
  const frac = n - whole;
  return frac ? `${whole || ''}½` : `${whole}`;
};

export const prefersReducedMotion = () =>
  document.documentElement.dataset.motion === 'reduced' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
