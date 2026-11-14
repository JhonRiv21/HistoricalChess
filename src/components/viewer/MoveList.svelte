<script lang="ts">
  // Game score with annotation glyphs (!!, !, ?!, ?, ??) computed from the engine.
  import { glyphOf, isMarked, type AnalyzedMove, type Annotation } from '../../lib/evaluation';
  import { sanParts, type Notation } from '../../lib/format';
  import { reducedMotion } from '../../lib/settings.svelte';
  import { t, type Lang } from '../../i18n/ui';

  interface Props {
    moves: AnalyzedMove[];
    annotations: Annotation[];
    ply: number;
    notation: Notation;
    lang: Lang;
    onselect: (ply: number) => void;
  }
  let { moves, annotations, ply, notation, lang, onselect }: Props = $props();

  let list: HTMLOListElement;
  const rows = $derived(Array.from({ length: Math.ceil(moves.length / 2) }, (_, r) => [r * 2 + 1, r * 2 + 2].filter((p) => p <= moves.length)));

  // Keep the current move in view inside the list (never scrolls the page). Reading `ply` makes the
  // effect re-run on every move; Svelte runs it after the DOM has the new aria-current.
  $effect(() => {
    if (!list) return;
    const current = ply;
    const active = list.querySelector<HTMLElement>('[aria-current="true"]');
    const behavior = reducedMotion() ? 'instant' : 'smooth';
    if (!active || current === 0) { list.scrollTo({ top: 0, behavior }); return; }
    const top = active.offsetTop - list.clientHeight / 2 + active.offsetHeight / 2;
    list.scrollTo({ top: Math.max(0, top), behavior });
  });
</script>

<ol class="move-list" aria-label={t(lang, 'viewer.moves')} bind:this={list}>
  {#each rows as pair, r (r)}
    <li class="move-row">
      <span class="move-num">{r + 1}.</span>
      {#each pair as p (p)}
        {@const klass = annotations[p - 1]?.klass}
        {@const marked = klass && isMarked(klass)}
        {@const parts = sanParts(moves[p - 1]!.san, notation, lang)}
        <button type="button" class={`move${marked ? ` is-${klass}` : ''}`} aria-current={p === ply ? 'true' : undefined} onclick={() => onselect(p)}>
          <span class="san">
            {#if parts.piece}<span class="fig" role="img" aria-label={parts.piece.name}>{parts.piece.glyph}</span>{/if}{parts.rest}
          </span>
          {#if marked}<span class="glyph" aria-label={t(lang, `class.${klass}`)}>{glyphOf(klass)}</span>{/if}
        </button>
      {/each}
    </li>
  {/each}
</ol>
