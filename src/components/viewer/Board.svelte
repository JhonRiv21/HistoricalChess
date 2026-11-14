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

  // Text glyphs for annotation classes; best and excellent use drawn icons (star, thumbs up) like broadcast boards.
  const GLYPH: Partial<Record<MoveClass, string>> = { brilliant: '!!', great: '!', inaccuracy: '?!', mistake: '?', blunder: '??' };
  const ICON: Partial<Record<MoveClass, string>> = {
    best: 'M12 3.2l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z',
    excellent: 'M7.5 11v8.5H4.8V11zm2 8.5V11.4l3.2-6.1c.3-.6 1-.9 1.6-.6.8.3 1.1 1.2.8 2l-.9 3.3h4.2c1.1 0 1.9 1 1.7 2.1l-1.2 5.9c-.2.9-1 1.5-1.9 1.5z',
  };

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
      const marker = klass && klass !== 'good' ? { class: `marker-class-${klass}`, slice: 'markerSquare' } : MARKER_TYPE.square;
      current.addMarker(marker, lastMove.from);
      current.addMarker(marker, lastMove.to);
    }
    current.removeArrows();
    if (showArrow && bestMove) current.addArrow(ARROW_TYPE.success, bestMove.slice(0, 2), bestMove.slice(2, 4));
  });

  // Badge sits on the top-right corner of the destination square (board seen from White's side).
  const badge = $derived.by(() => {
    if (!lastMove || !klass || (!GLYPH[klass] && !ICON[klass])) return null;
    const file = lastMove.to.charCodeAt(0) - 97;
    const rank = Number(lastMove.to[1]);
    // Centered on the square's top-right corner, nudged inside on the board's right and top edges.
    return { glyph: GLYPH[klass], icon: ICON[klass], left: Math.min(96.2, (file + 1) * 12.5 - 1.9), top: Math.max(0, (8 - rank) * 12.5 - 1.9) };
  });
</script>

<div class="board-wrap">
  <div class="board-host" class:is-loading={!board} bind:this={host}></div>
  {#if badge}
    <span class={`board-badge is-${klass}`} style={`left:${badge.left}%;top:${badge.top}%`} role="img" aria-label={klassLabel}>
      {#if badge.icon}<svg viewBox="0 0 24 24" aria-hidden="true"><path d={badge.icon} /></svg>{:else}{badge.glyph}{/if}
    </span>
  {/if}
</div>
