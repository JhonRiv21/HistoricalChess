<script lang="ts">
  // Home hero: the featured champions side by side as one group picture. The lineup is the selector;
  // the chosen champion widens and comes into focus. Auto-advances unless motion is reduced or paused.
  import { onMount } from 'svelte';
  import { reducedMotion, settings } from '../lib/settings.svelte';
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
  }
  let { lang, champions }: { lang: Lang; champions: LineupChampion[] } = $props();

  const INTERVAL_MS = 7000;
  let index = $state(0);
  let paused = $state(false);
  let interacting = $state(false);
  let tabs: HTMLButtonElement[] = $state([]);
  const current = $derived(champions[index]!);
  const autoplay = $derived(!paused && !interacting && settings.motion !== 'reduced');

  function select(next: number, focus = false) {
    index = (next + champions.length) % champions.length;
    if (focus) tabs[index]?.focus();
  }

  function onkeydown(event: KeyboardEvent) {
    const steps: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: champions.length - 1 };
    if (event.key in steps) {
      event.preventDefault();
      select(steps[event.key]!, true);
    }
  }

  onMount(() => {
    const timer = setInterval(() => autoplay && !reducedMotion() && select(index + 1), INTERVAL_MS);
    return () => clearInterval(timer);
  });
</script>

<section
  class="hero hero-lineup"
  aria-label={t(lang, 'hero.label')}
  onpointerenter={() => (interacting = true)}
  onpointerleave={() => (interacting = false)}
  onfocusin={() => (interacting = true)}
  onfocusout={(event) => !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node) && (interacting = false)}
>
  <div class="lineup" role="tablist" aria-label={t(lang, 'hero.choose')} tabindex="-1" {onkeydown}>
    {#each champions as champion, i (champion.id)}
      <button
        bind:this={tabs[i]}
        type="button"
        role="tab"
        id={`lineup-tab-${champion.id}`}
        class="lineup-face"
        aria-selected={i === index}
        aria-controls="lineup-panel"
        aria-label={champion.name}
        tabindex={i === index ? 0 : -1}
        onclick={() => select(i)}
      >
        <img src={champion.image.src} srcset={champion.image.srcset} sizes="(max-width: 820px) 60vw, 34vw" alt="" style={`object-position:${champion.image.focus}`} loading={i < 3 ? 'eager' : 'lazy'} decoding="async" />
        <span class="lineup-name">{champion.short}</span>
      </button>
    {/each}
  </div>
  <div class="lineup-panel" id="lineup-panel" role="tabpanel" aria-labelledby={`lineup-tab-${current.id}`} aria-live="polite">
    <div class="lineup-text">
      <span class="lineup-reign">{t(lang, 'hero.champion')} {current.reign}</span>
      <h2 class="lineup-title">{current.name}</h2>
      <span class="lineup-country">{current.country}</span>
      <p class="lineup-line">{current.line}</p>
    </div>
    <div class="lineup-actions">
      <a class="btn btn-primary" href={current.href}>{current.cta}</a>
      {#if settings.motion !== 'reduced'}
        <button type="button" class="icon-btn" aria-label={paused ? t(lang, 'hero.play') : t(lang, 'hero.pause')} onclick={() => (paused = !paused)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paused ? 'M8 5l11 7-11 7z' : 'M9 6v12M15 6v12'} /></svg>
        </button>
      {/if}
    </div>
  </div>
</section>
