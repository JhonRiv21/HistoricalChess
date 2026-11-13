<script lang="ts">
  // cm-chessboard wrapper: position, last-move squares and the engine's best-move arrow.
  import { onMount } from 'svelte';
  import { Chessboard } from 'cm-chessboard/src/Chessboard.js';
  import { Markers, MARKER_TYPE } from 'cm-chessboard/src/extensions/markers/Markers.js';
  import { Arrows, ARROW_TYPE } from 'cm-chessboard/src/extensions/arrows/Arrows.js';
  import { Accessibility } from 'cm-chessboard/src/extensions/accessibility/Accessibility.js';
  import 'cm-chessboard/assets/chessboard.css';
  import 'cm-chessboard/assets/extensions/markers/markers.css';
  import 'cm-chessboard/assets/extensions/arrows/arrows.css';
  import { reducedMotion } from '../../lib/settings.svelte';

  interface Props {
    fen: string;
    lastMove?: { from: string; to: string };
    bestMove?: string; // UCI, e.g. "e2e4"
    showArrow: boolean;
    lang: 'es' | 'en';
  }
  let { fen, lastMove, bestMove, showArrow, lang }: Props = $props();

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
    current.removeMarkers(MARKER_TYPE.square);
    if (lastMove) {
      current.addMarker(MARKER_TYPE.square, lastMove.from);
      current.addMarker(MARKER_TYPE.square, lastMove.to);
    }
    current.removeArrows();
    if (showArrow && bestMove) current.addArrow(ARROW_TYPE.success, bestMove.slice(0, 2), bestMove.slice(2, 4));
  });
</script>

<div class="board-host" class:is-loading={!board} bind:this={host}></div>
