<script lang="ts">
  // Accessibility side sheet: every control writes straight to the shared reading settings.
  import { DEFAULT_SETTINGS, TEXT_SCALES, settings, updateSettings, type Settings } from '../lib/settings.svelte';
  import type { Lang } from '../i18n/ui';

  let { lang }: { lang: Lang } = $props();
  let sheet: HTMLDialogElement;

  type ChoiceKey = Exclude<keyof Settings, 'scale'>;
  const copy = {
    es: {
      open: 'Accesibilidad', title: 'Accesibilidad', close: 'Cerrar accesibilidad',
      intro: 'Los cambios se aplican al instante y se guardan en este navegador.',
      size: 'Tamaño del texto', smaller: 'Reducir el texto', bigger: 'Agrandar el texto',
      preview: 'Fischer contra Spassky, 1972', previewText: 'Así se verá el texto del sitio con tus ajustes.',
      reset: 'Restablecer todo',
    },
    en: {
      open: 'Accessibility', title: 'Accessibility', close: 'Close accessibility',
      intro: 'Changes apply instantly and are saved in this browser.',
      size: 'Text size', smaller: 'Make text smaller', bigger: 'Make text bigger',
      preview: 'Fischer versus Spassky, 1972', previewText: 'This is how the site’s text will look with your settings.',
      reset: 'Reset everything',
    },
  }[lang];

  const groups: { key: ChoiceKey; legend: Record<Lang, string>; hint?: Record<Lang, string>; options: [string, Record<Lang, string>][] }[] = [
    { key: 'mode', legend: { es: 'Tema', en: 'Theme' },
      hint: { es: '«Sistema» sigue la configuración de tu dispositivo.', en: '“System” follows your device setting.' },
      options: [['dark', { es: 'Oscuro', en: 'Dark' }], ['light', { es: 'Claro', en: 'Light' }], ['system', { es: 'Sistema', en: 'System' }]] },
    { key: 'contrast', legend: { es: 'Contraste', en: 'Contrast' },
      options: [['normal', { es: 'Normal', en: 'Normal' }], ['high', { es: 'Alto', en: 'High' }]] },
    { key: 'spacing', legend: { es: 'Espaciado del texto', en: 'Text spacing' },
      options: [['normal', { es: 'Normal', en: 'Normal' }], ['wide', { es: 'Amplio', en: 'Wide' }]] },
    { key: 'board', legend: { es: 'Colores del tablero', en: 'Board colors' },
      hint: { es: 'El azul se distingue mejor con daltonismo rojo-verde.', en: 'Blue is easier to tell apart with red-green color blindness.' },
      options: [['green', { es: 'Verde', en: 'Green' }], ['blue', { es: 'Azul', en: 'Blue' }]] },
    { key: 'notation', legend: { es: 'Notación de las jugadas', en: 'Move notation' },
      hint: { es: 'Figuras o letras (R, D, T, A, C).', en: 'Figurines or letters (K, Q, R, B, N).' },
      options: [['figurine', { es: '♘f3', en: '♘f3' }], ['letters', { es: 'Cf3', en: 'Nf3' }]] },
    { key: 'motion', legend: { es: 'Movimiento', en: 'Motion' },
      hint: { es: 'Reducido detiene el cambio automático de la portada y las transiciones.', en: 'Reduced stops the home autoplay and transitions.' },
      options: [['normal', { es: 'Normal', en: 'Normal' }], ['reduced', { es: 'Reducido', en: 'Reduced' }]] },
  ];

  const boardSamples: Record<string, [string, string]> = { green: ['#eeeed2', '#6b8a4e'], blue: ['#dee3e6', '#62808f'] };
  const scaleIndex = $derived(TEXT_SCALES.indexOf(settings.scale));
  const step = (dir: number) => updateSettings({ scale: TEXT_SCALES[Math.max(0, Math.min(TEXT_SCALES.length - 1, scaleIndex + dir))]! });
</script>

<button type="button" class="btn" aria-haspopup="dialog" onclick={() => sheet.showModal()}>
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.5" r="1.8" /><path d="M5 8.5l7 1.5 7-1.5M12 10v5M12 15l-3.5 6M12 15l3.5 6" /></svg>
  <span>{copy.open}</span>
</button>

<dialog
  bind:this={sheet}
  class="a11y-sheet"
  aria-labelledby="a11y-title"
  onclick={(event) => event.target === sheet && sheet.close()}
>
  <div class="a11y-head">
    <h2 class="a11y-title" id="a11y-title">{copy.title}</h2>
    <button type="button" class="icon-btn" aria-label={copy.close} onclick={() => sheet.close()}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
  </div>
  <p class="a11y-intro">{copy.intro}</p>
  <form class="a11y-form" onsubmit={(event) => event.preventDefault()}>
    <fieldset class="a11y-group">
      <legend>{copy.size}</legend>
      <div class="stepper">
        <button type="button" aria-label={copy.smaller} disabled={scaleIndex === 0} onclick={() => step(-1)}>A−</button>
        <output class="stepper-value" aria-live="polite">{Math.round(settings.scale * 100)} %</output>
        <button type="button" aria-label={copy.bigger} disabled={scaleIndex === TEXT_SCALES.length - 1} onclick={() => step(1)}>A+</button>
      </div>
    </fieldset>
    <div class="a11y-preview"><strong>{copy.preview}</strong>{copy.previewText}</div>
    {#each groups as group (group.key)}
      <fieldset class="a11y-group">
        <legend>{group.legend[lang]}</legend>
        <div class="choice-row">
          {#each group.options as [value, label] (value)}
            <label class="choice">
              <input
                type="radio"
                name={`a11y-${group.key}`}
                {value}
                checked={settings[group.key] === value}
                onchange={() => updateSettings({ [group.key]: value } as Partial<Settings>)}
              />
              <span>
                {#if group.key === 'board'}
                  <i class="sample-board" aria-hidden="true" style={`--sample-l:${boardSamples[value]![0]};--sample-d:${boardSamples[value]![1]}`}><i></i><i></i><i></i><i></i></i>
                {/if}
                {label[lang]}
              </span>
            </label>
          {/each}
        </div>
        {#if group.hint}<p class="a11y-hint">{group.hint[lang]}</p>{/if}
      </fieldset>
    {/each}
    <button type="button" class="btn a11y-reset" onclick={() => updateSettings({ ...DEFAULT_SETTINGS })}>{copy.reset}</button>
  </form>
</dialog>
