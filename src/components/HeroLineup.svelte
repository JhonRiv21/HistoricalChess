<script lang="ts">
  // Home hero: the featured champions side by side as one group picture. Nobody is selected at first;
  // hovering or focusing a face zooms it as a preview, and a click (or tap) selects it and shows its card.
  import { track } from '../lib/analytics';
  import { t, type Lang } from '../i18n/ui';

  export interface LineupChampion {
    id: string;
    name: string;
    short: string;
    country: string;
    reign: string;
    line: string;
    image: { src: string; srcset: string; focus: string };
    href: string;
    cta: string;
    memorialHref: string;
  }
  let { lang, champions, memorialHref }: { lang: Lang; champions: LineupChampion[]; memorialHref: string } = $props();

  let selected: number | null = $state(null);
  let previewing: number | null = $state(null);
  const active = $derived(previewing ?? selected);
  const shown = $derived(active == null ? null : champions[active]!);

  function toggle(i: number) {
    selected = selected === i ? null : i;
    if (selected != null) track('champion_select', { champion: champions[i]!.id });
  }
</script>

<section class="hero hero-lineup" aria-label={t(lang, 'hero.label')}>
  <div class="lineup" class:has-active={active != null} role="group" aria-label={t(lang, 'hero.choose')} onpointerleave={() => (previewing = null)}>
    {#each champions as champion, i (champion.id)}
      <button
        type="button"
        class="lineup-face"
        class:is-active={active === i}
        aria-pressed={selected === i}
        aria-controls="lineup-panel"
        aria-label={champion.name}
        onpointerenter={(event) => event.pointerType === 'mouse' && (previewing = i)}
        onfocus={() => (previewing = i)}
        onblur={() => (previewing = null)}
        onclick={() => toggle(i)}
      >
        <img src={champion.image.src} srcset={champion.image.srcset} sizes="(max-width: 820px) 60vw, 34vw" alt="" style={`object-position:${champion.image.focus}`} loading={i < 3 ? 'eager' : 'lazy'} decoding="async" />
        <span class="lineup-name">{champion.short}</span>
      </button>
    {/each}
  </div>
  <div class="lineup-panel" id="lineup-panel" aria-live="polite">
    {#if shown}
      <div class="lineup-text">
        <span class="lineup-reign">{t(lang, 'hero.champion')} {shown.reign}</span>
        <h2 class="lineup-title">{shown.name}</h2>
        <span class="lineup-country">{shown.country}</span>
        <p class="lineup-line">{shown.line}</p>
      </div>
      <div class="lineup-actions">
        <a class="btn" href={shown.memorialHref}>{t(lang, 'hero.bestGames')}</a>
        <a class="btn btn-primary" href={shown.href}>{shown.cta}</a>
      </div>
    {:else}
      <div class="lineup-text">
        <h2 class="lineup-title">{t(lang, 'hero.intro')}</h2>
        <p class="lineup-line">{t(lang, 'hero.hint')}</p>
      </div>
      <div class="lineup-actions">
        <a class="btn btn-primary" href={memorialHref}>{t(lang, 'hero.memorial')}</a>
      </div>
    {/if}
  </div>
</section>
