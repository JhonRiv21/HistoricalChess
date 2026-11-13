<script lang="ts">
  // Game viewer island: loads the precomputed analysis, then board, eval bar, controls, engine readout,
  // move list and eval graph. The engine layer can be hidden for readers who want to judge alone.
  import { onMount } from 'svelte';
  import Board from './Board.svelte';
  import EvalGraph from './EvalGraph.svelte';
  import MoveList from './MoveList.svelte';
  import { annotateGame, formatEval, glyphOf, playerAccuracy, whiteWinPercent, type AnalyzedGame } from '../../lib/evaluation';
  import { formatSan, moveNumber } from '../../lib/format';
  import { settings } from '../../lib/settings.svelte';
  import { t, type Lang } from '../../i18n/ui';

  interface Props {
    src: string; // URL of public/data/games/<slug>/<round>.json
    lang: Lang;
    white: string;
    black: string;
    resultText: string;
  }
  let { src, lang, white, black, resultText }: Props = $props();

  let game: AnalyzedGame | null = $state(null);
  let failed = $state(false);
  let ply = $state(0);
  let engineOn = $state(true);

  onMount(() => {
    fetch(src)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status} ${src}`))))
      .then((data: AnalyzedGame) => (game = data))
      .catch((error) => {
        console.error('Game analysis could not be loaded', error);
        failed = true;
      });
  });

  const annotations = $derived(game ? annotateGame(game.positions) : []);
  const accuracy = $derived(playerAccuracy(annotations));
  const last = $derived(game ? game.moves.length : 0);
  const position = $derived(game?.positions[ply]);
  const move = $derived(ply && game ? game.moves[ply - 1] : undefined);
  const klass = $derived(ply ? annotations[ply - 1]?.klass ?? null : null);
  const san = (s: string) => formatSan(s, settings.notation, lang);
  const go = (next: number) => (ply = Math.max(0, Math.min(last, next)));

  function onkey(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (!game || target.closest('input, textarea, select, dialog')) return;
    const map: Record<string, number> = { ArrowLeft: ply - 1, ArrowRight: ply + 1, Home: 0, End: last };
    if (event.key in map) {
      event.preventDefault();
      go(map[event.key]!);
    }
  }

  const ICONS = { first: 'M18 6v12M15 6l-7 6 7 6', prev: 'M15 6l-7 6 7 6', next: 'M9 6l7 6-7 6', last: 'M6 6v12M9 6l7 6-7 6' };
</script>

<svelte:document onkeydown={onkey} />

{#if failed}
  <p class="viewer-status" role="alert">{t(lang, 'viewer.error')}</p>
{:else if !game || !position}
  <p class="viewer-status" aria-busy="true">{t(lang, 'viewer.loading')}</p>
{:else}
  <div class="viewer" class:engine-off={!engineOn}>
    <div class="viewer-board">
      <div class="evalbar" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(whiteWinPercent(position))} aria-label={`${t(lang, 'eval.label')} ${formatEval(position)}`}>
        <div class="evalbar-white" style={`height:${whiteWinPercent(position)}%`}></div>
        <span class="evalbar-label" data-side={whiteWinPercent(position) >= 50 ? 'white' : 'black'}>{formatEval(position)}</span>
      </div>
      <Board fen={position.fen} lastMove={move} bestMove={ply < last ? position.best : undefined} showArrow={engineOn} {lang} />
    </div>

    <div class="viewer-controls">
      <div class="controls" role="group" aria-label={t(lang, 'viewer.nav')}>
        {#each [['first', 0, 'viewer.first'], ['prev', ply - 1, 'viewer.prev']] as const as [icon, target, label] (icon)}
          <button type="button" class="ctrl" aria-label={t(lang, label)} onclick={() => go(target)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICONS[icon]} /></svg></button>
        {/each}
        <span class="ctrl-counter" aria-live="polite">{move ? `${moveNumber(ply)} ${san(move.san)}` : t(lang, 'viewer.start')}</span>
        {#each [['next', ply + 1, 'viewer.next'], ['last', last, 'viewer.last']] as const as [icon, target, label] (icon)}
          <button type="button" class="ctrl" aria-label={t(lang, label)} onclick={() => go(target)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICONS[icon]} /></svg></button>
        {/each}
      </div>
    </div>

    <div class="viewer-side">
      <button type="button" class="engine-toggle" role="switch" aria-checked={engineOn} onclick={() => (engineOn = !engineOn)}>
        <span class="switch" aria-hidden="true"></span>{t(lang, 'viewer.engineToggle')}
      </button>
      <section class="engine" aria-label={t(lang, 'eval.label')}>
        <div class="engine-head">
          <span class="engine-name">{game.engine}, {lang === 'es' ? 'profundidad' : 'depth'} {game.depth}</span>
          <strong class="engine-eval">{formatEval(position)}</strong>
        </div>
        <span class="engine-best">{ply < last && position.bestSan ? `${t(lang, 'viewer.best')}: ${san(position.bestSan)}` : `${t(lang, 'viewer.end')}: ${resultText}`}</span>
        <span class="engine-verdict" data-klass={klass ?? ''}>{klass && move ? `${san(move.san)} ${t(lang, 'viewer.was')} ${t(lang, `class.${klass}`).toLowerCase()} (${glyphOf(klass)})` : ''}</span>
        <div class="accuracy">
          <span class="acc-title">{t(lang, 'viewer.accuracy')}</span>
          {#each [[white, accuracy.white], [black, accuracy.black]] as const as [name, value] (name)}
            <div class="acc-row">
              <span class="acc-name">{name}</span>
              <span class="acc-track"><span class="acc-fill" style={`width:${value.toFixed(1)}%`}></span></span>
              <span class="acc-value">{value.toFixed(1)} %</span>
            </div>
          {/each}
          <p class="acc-note">{t(lang, 'viewer.accuracyNote')}</p>
        </div>
      </section>
      <MoveList moves={game.moves} {annotations} {ply} notation={settings.notation} {lang} onselect={go} />
      <p class="glyph-legend">
        <span><b class="is-inaccuracy">?!</b> {t(lang, 'class.inaccuracy').toLowerCase()}</span>
        <span><b class="is-mistake">?</b> {t(lang, 'class.mistake').toLowerCase()}</span>
        <span><b class="is-blunder">??</b> {t(lang, 'class.blunder').toLowerCase()}</span>
      </p>
    </div>

    <div class="viewer-graph">
      <h3 class="graph-title">{t(lang, 'viewer.graph')}</h3>
      <EvalGraph positions={game.positions} moves={game.moves} {annotations} {ply} {lang} onselect={go} />
    </div>
  </div>
{/if}
