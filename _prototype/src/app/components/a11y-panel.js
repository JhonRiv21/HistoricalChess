// Accessibility side sheet. Every control writes straight to the settings store.
import { h } from '../lib/dom.js';
import { DEFAULT_SETTINGS, TEXT_SCALES, getSettings, onSettingsChange, updateSettings } from '../lib/settings.js';

const GROUPS = [
  { key: 'mode', legend: 'Tema', options: [['dark', 'Oscuro'], ['light', 'Claro'], ['system', 'Sistema']],
    hint: '«Sistema» sigue la configuración de tu dispositivo.' },
  { key: 'contrast', legend: 'Contraste', options: [['normal', 'Normal'], ['high', 'Alto']] },
  { key: 'spacing', legend: 'Espaciado del texto', options: [['normal', 'Normal'], ['wide', 'Amplio']] },
  { key: 'board', legend: 'Colores del tablero', options: [['green', 'Verde'], ['blue', 'Azul']],
    hint: 'El azul se distingue mejor con daltonismo rojo-verde.' },
  { key: 'notation', legend: 'Notación de las jugadas', options: [['figurine', '♘f3'], ['letters', 'Cf3']],
    hint: 'Figuras o letras en español (R, D, T, A, C).' },
  { key: 'motion', legend: 'Movimiento', options: [['normal', 'Normal'], ['reduced', 'Reducido']],
    hint: 'Reducido detiene el carrusel automático y las transiciones.' },
];

const BOARD_SAMPLES = { green: ['#eeeed2', '#6b8a4e'], blue: ['#dee3e6', '#62808f'] };

function choiceGroup({ key, legend, options, hint }) {
  const name = `a11y-${key}`;
  const inputs = [];
  const row = h('div', { class: 'choice-row' }, options.map(([value, label]) => {
    const input = h('input', { type: 'radio', name, id: `${name}-${value}`, value });
    input.addEventListener('change', () => updateSettings({ [key]: value }));
    inputs.push(input);
    const sample = key === 'board'
      ? h('i', { class: 'sample-board', 'aria-hidden': 'true', style: `--sample-l:${BOARD_SAMPLES[value][0]};--sample-d:${BOARD_SAMPLES[value][1]}` }, h('i'), h('i'), h('i'), h('i'))
      : null;
    return h('label', { class: 'choice', for: `${name}-${value}` }, input, h('span', {}, sample, label));
  }));
  const el = h('fieldset', { class: 'a11y-group' }, h('legend', { text: legend }), row, hint ? h('p', { class: 'a11y-hint', text: hint }) : null);
  return { el, sync: (settings) => inputs.forEach((i) => { i.checked = settings[key] === i.value; }) };
}

function textSizeGroup() {
  const value = h('output', { class: 'stepper-value', 'aria-live': 'polite' });
  const step = (dir) => {
    const index = TEXT_SCALES.indexOf(getSettings().scale);
    const next = TEXT_SCALES[Math.max(0, Math.min(TEXT_SCALES.length - 1, index + dir))];
    updateSettings({ scale: next });
  };
  const smaller = h('button', { type: 'button', 'aria-label': 'Reducir el texto', text: 'A−', onClick: () => step(-1) });
  const bigger = h('button', { type: 'button', 'aria-label': 'Agrandar el texto', text: 'A+', onClick: () => step(1) });
  const el = h('fieldset', { class: 'a11y-group' },
    h('legend', { text: 'Tamaño del texto' }),
    h('div', { class: 'stepper' }, smaller, value, bigger));
  return {
    el,
    sync: ({ scale }) => {
      value.textContent = `${Math.round(scale * 100)} %`;
      smaller.disabled = scale === TEXT_SCALES[0];
      bigger.disabled = scale === TEXT_SCALES.at(-1);
    },
  };
}

export function createA11yPanel() {
  const groups = [textSizeGroup(), ...GROUPS.map(choiceGroup)];
  const close = h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Cerrar accesibilidad' });
  close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const reset = h('button', { type: 'button', class: 'btn a11y-reset', text: 'Restablecer todo', onClick: () => updateSettings(DEFAULT_SETTINGS) });

  const sheet = h('dialog', { class: 'a11y-sheet', 'aria-labelledby': 'a11y-title' },
    h('div', { class: 'a11y-head' }, h('h2', { class: 'a11y-title', id: 'a11y-title', text: 'Accesibilidad' }), close),
    h('p', { class: 'a11y-intro', text: 'Los cambios se aplican al instante y se guardan en este navegador.' }),
    h('form', { class: 'a11y-form', onSubmit: (event) => event.preventDefault() },
      groups[0].el,
      h('div', { class: 'a11y-preview' }, h('strong', { text: 'Fischer contra Spassky, 1972' }), 'Así se verá el texto del sitio con tus ajustes.'),
      groups.slice(1).map((g) => g.el),
      reset));

  close.addEventListener('click', () => sheet.close());
  sheet.addEventListener('click', (event) => { if (event.target === sheet) sheet.close(); });

  const sync = (settings) => groups.forEach((g) => g.sync(settings));
  sync(getSettings());
  onSettingsChange(sync);

  const trigger = h('button', { type: 'button', class: 'btn', 'aria-haspopup': 'dialog', onClick: () => sheet.showModal() });
  trigger.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5l7 1.5 7-1.5M12 10v5M12 15l-3.5 6M12 15l3.5 6"/></svg><span>Accesibilidad</span>';

  return { trigger, sheet };
}
