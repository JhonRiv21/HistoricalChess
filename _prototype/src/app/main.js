// Entry point: reading settings, hash routing between home and the match page.
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/components.css';
import '../styles/a11y-panel.css';
import sprite from '../assets/pieces-standard.svg';
import './lib/settings.js';
import { h } from './lib/dom.js';
import { createA11yPanel } from './components/a11y-panel.js';
import { renderHome } from './views/home-view.js';
import { renderMatch } from './views/match-view.js';
import { MATCH_1972 } from '../content/match-1972.js';

const outlet = document.getElementById('app');
let current = null;

function injectSprite() {
  const holder = h('div', { class: 'sprite-holder', 'aria-hidden': 'true' });
  holder.innerHTML = sprite;
  document.body.prepend(holder);
}

function route() {
  current?.destroy?.();
  const page = location.hash.slice(1);
  const isMatch = page === MATCH_1972.id;
  current = isMatch ? renderMatch(MATCH_1972) : renderHome();
  outlet.replaceChildren(current.el);
  document.title = isMatch ? 'Fischer–Spassky 1972 | Historical Chess' : 'Historical Chess';
  const target = page.startsWith('y-') ? document.getElementById(page) : null;
  if (target) target.scrollIntoView({ block: 'nearest', inline: 'center' });
  else window.scrollTo(0, 0);
}

const a11y = createA11yPanel();
document.getElementById('site-tools').append(a11y.trigger);
document.body.append(a11y.sheet);
injectSprite();
window.addEventListener('hashchange', route);
route();
