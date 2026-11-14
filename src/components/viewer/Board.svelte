<script lang="ts">
  // cm-chessboard wrapper: position, last-move squares (tinted by move class), the engine's best-move arrow
  // and a class badge on the destination square, the way broadcast boards show them.
  import { onMount } from 'svelte';
  import { Chessboard } from 'cm-chessboard/src/Chessboard.js';
  import { Markers, MARKER_TYPE } from 'cm-chessboard/src/extensions/markers/Markers.js';
  import { Arrows, ARROW_TYPE } from 'cm-chessboard/src/extensions/arrows/Arrows.js';
  import { Accessibility } from 'cm-chessboard/src/extensions/accessibility/Accessibility.js';
  import 'cm-chessboard/assets/chessboard.css';
  import 'cm-chessboard/assets/extensions/markers/markers.css';
  import 'cm-chessboard/assets/extensions/arrows/arrows.css';
  import { reducedMotion } from '../../lib/settings.svelte';
  import type { MoveClass } from '../../lib/evaluation';

  interface Props {
    fen: string;
    lastMove?: { from: string; to: string };
    bestMove?: string; // UCI, e.g. "e2e4"
    showArrow: boolean;
    klass?: MoveClass | null; // class of the move that led to this position
    klassLabel?: string;
    lang: 'es' | 'en';
  }
  let { fen, lastMove, bestMove, showArrow, klass = null, klassLabel = '', lang }: Props = $props();

  const BADGE: Partial<Record<MoveClass, string>> = { brilliant: '!!', great: '!', best: '★', excellent: '✓', inaccuracy: '?!', mistake: '?', blunder: '??' };
  const TINTED: MoveClass[] = ['brilliant', 'great', 'inaccuracy', 'mistake', 'blunder'];

  let host: HTMLDivElement;
  let board: Chessboard | null = $state(null);

  onMount(() => {
    const instance = new Chessboard(host, {
      position: fen,
      assetsUrl: '/cm-chessboard/',
      style: { cssClass: 'hc', showCoordinates: true, borderType: 'none', pieces: { file: 'pieces/standard.svg' }, animationDuration: reducedMotion() ? 0 : 200 },
      extensions: [
        { class: Markers, props: { autoMarkers: null } },
        { class: Arrows },
        // cm-chessboard only names pieces in English or German; Spanish readers get English piece names.
        { class: Accessibility, props: { language: lang === 'es' ? 'en' : lang, movePieceForm: false, boardAsTable: true, piecesAsList: true, visuallyHidden: true } },
      ],
    });
    board = instance;
    return () => instance.destroy();
  });

  $effect(() => {
    if (!board) return;
    const current = board;
    current.setPosition(fen, !reducedMotion());
    current.removeMarkers();
    if (lastMove) {
      const marker = klass && TINTED.includes(klass) ? { class: `marker-class-${klass}`, slice: 'markerSquare' } : MARKER_TYPE.square;
      current.addMarker(marker, lastMove.from);
      current.addMarker(marker, lastMove.to);
    }
    current.removeArrows();
    if (showArrow && bestMove) current.addArrow(ARROW_TYPE.success, bestMove.slice(0, 2), bestMove.slice(2, 4));
  });

  // Badge sits on the top-right corner of the destination square (board seen from White's side).
  const badge = $derived.by(() => {
    if (!lastMove || !klass || !BADGE[klass]) return null;
    const file = lastMove.to.charCodeAt(0) - 97;
    const rank = Number(lastMove.to[1]);
    return { glyph: BADGE[klass]!, left: Math.min(96, (file + 1) * 12.5 - 3.2), top: Math.max(-1, (8 - rank) * 12.5 - 1.8) };
  });
</script>

<div class="board-wrap">
  <div class="board-host" class:is-loading={!board} bind:this={host}></div>
  {#if badge}
    <span class={`board-badge is-${klass}`} style={`left:${badge.left}%;top:${badge.top}%`} role="img" aria-label={klassLabel}>{badge.glyph}</span>
  {/if}
</div>
