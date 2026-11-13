<script lang="ts">
  // Game score with annotation glyphs (?!, ?, ??) computed from the engine.
  import { glyphOf, type AnalyzedMove, type Annotation } from '../../lib/evaluation';
  import { sanParts, type Notation } from '../../lib/format';
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

  $effect(() => {
    const active = list?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!active) { if (list) list.scrollTop = 0; return; }
    const top = active.offsetTop;
    if (top < list.scrollTop || top > list.scrollTop + list.clientHeight - 40) list.scrollTop = top - list.clientHeight / 2;
  });
</script>

<ol class="move-list" aria-label={t(lang, 'viewer.moves')} bind:this={list}>
  {#each rows as pair, r (r)}
    <li class="move-row">
      <span class="move-num">{r + 1}.</span>
      {#each pair as p (p)}
        {@const klass = annotations[p - 1]?.klass}
        {@const parts = sanParts(moves[p - 1]!.san, notation, lang)}
        <button type="button" class={`move${klass ? ` is-${klass}` : ''}`} aria-current={p === ply ? 'true' : undefined} onclick={() => onselect(p)}>
          <span class="san">
            {#if parts.piece}<span class="fig" role="img" aria-label={parts.piece.name}>{parts.piece.glyph}</span>{/if}{parts.rest}
          </span>
          {#if klass}<span class="glyph" aria-label={t(lang, `class.${klass}`)}>{glyphOf(klass)}</span>{/if}
        </button>
      {/each}
    </li>
  {/each}
</ol>
