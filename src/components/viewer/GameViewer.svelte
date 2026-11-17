<script lang="ts">
  // Game viewer island: loads the precomputed analysis, then board, eval bar, controls, engine readout,
  // move list and eval graph. The engine layer can be hidden for readers who want to judge alone.
  import { onMount } from 'svelte';
  import Board from './Board.svelte';
  import EvalGraph from './EvalGraph.svelte';
  import MoveList from './MoveList.svelte';
  import { annotateGame, formatEval, glyphOf, playerAccuracy, whiteWinPercent, type AnalyzedGame } from '../../lib/evaluation';
  import { formatSan, moveNumber } from '../../lib/format';
  import { openingAt, openingName } from '../../lib/openings';
  import { settings } from '../../lib/settings.svelte';
  import { track } from '../../lib/analytics';
  import { t, type Lang } from '../../i18n/ui';

  interface Props {
    src: string; // URL of public/data/games/<slug>/<round>.json
    lang: Lang;
    white: string; // short names, used in the accuracy rows
    black: string;
    whiteName?: string; // full names, shown on the plates above and below the board
    blackName?: string;
    result?: '1-0' | '0-1' | '1/2-1/2';
    resultText: string;
    keyPly?: number; // famous moment: shows a jump button
  }
  let { src, lang, white, black, whiteName = white, blackName = black, result, resultText, keyPly }: Props = $props();
  const points = (side: 'white' | 'black') =>
    result === '1/2-1/2' ? '½' : (result === '1-0') === (side === 'white') ? '1' : '0';

  let game: AnalyzedGame | null = $state(null);
  let failed = $state(false);
  let ply = $state(0);
  let engineOn = $state(true);
  let flipped = $state(false);

  onMount(() => {
    fetch(src)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status} ${src}`))))
      .then((data: AnalyzedGame) => (game = data))
      .catch((error) => {
        console.error('Game analysis could not be loaded', error);
        failed = true;
      });
  });

  const annotations = $derived(game ? annotateGame(game.positions, game.moves, keyPly) : []);
  const accuracy = $derived(playerAccuracy(annotations));
  const last = $derived(game ? game.moves.length : 0);
  const position = $derived(game?.positions[ply]);
  const move = $derived(ply && game ? game.moves[ply - 1] : undefined);
  const current = $derived(ply ? annotations[ply - 1] ?? null : null);
  const san = (s: string) => formatSan(s, settings.notation, lang);
  const opening = $derived(game ? openingAt(game.openings ?? [], ply, { white: game.moves[0]?.san, black: game.moves[1]?.san }) : null);
  // Opening names keep SAN moves ("1.e4"); figurine notation turns them into pieces like the move list.
  const openingText = (name: string) => (name.startsWith('1.') ? name.replace(/^(1\.(?:\.\.)?)(.+)$/, (_, n, m) => n + san(m)) : openingName(name, lang));
  function flip() {
    flipped = !flipped;
    track('board_flip', { game: src });
  }
  let engaged = false;
  function go(next: number) {
    ply = Math.max(0, Math.min(last, next));
    // One event per game the first time the reader steps through it, not one per move (quota).
    if (!engaged && ply > 0) { engaged = true; track('game_replay', { game: src }); }
  }

  function onkey(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (!game || target.closest('input, textarea, select, dialog')) return;
    const map: Record<string, number> = { ArrowLeft: ply - 1, ArrowRight: ply + 1, Home: 0, End: last };
    if (event.key in map) {
      event.preventDefault();
      go(map[event.key]!);
    } else if (event.key === 'f' && !event.metaKey && !event.ctrlKey && !event.altKey) {
      flip();
    }
  }

  const FLIP_ICON = 'M7 4v13m0 0l-3-3m3 3l3-3M17 20V7m0 0l-3 3m3-3l3 3';
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
      {#snippet plate(side: 'white' | 'black', name: string)}
        <div class={`player-plate is-${side}`}>
          <span class="piece-chip" aria-hidden="true"></span>
          <span class="visually-hidden">{t(lang, side === 'white' ? 'match.white' : 'match.black')}:</span>
          <span class="plate-name">{name}</span>
          {#if result && ply === last}<span class="plate-result">{points(side)}</span>{/if}
        </div>
      {/snippet}
      {@render plate(flipped ? 'white' : 'black', flipped ? whiteName : blackName)}
      <div class="board-row">
      <div class="evalbar" class:is-flipped={flipped} role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(whiteWinPercent(position))} aria-label={`${t(lang, 'eval.label')} ${formatEval(position)}`}>
        <div class="evalbar-white" style={`height:${whiteWinPercent(position)}%`}></div>
        <span class="evalbar-label" data-side={whiteWinPercent(position) >= 50 ? 'white' : 'black'}>{formatEval(position)}</span>
      </div>
      <Board fen={position.fen} lastMove={move} bestMove={ply < last ? position.best : undefined} showArrow={engineOn}
        klass={engineOn ? current?.klass : null} klassLabel={current ? t(lang, `class.${current.klass}`) : ''} {lang} {flipped} />
      </div>
      {@render plate(flipped ? 'black' : 'white', flipped ? blackName : whiteName)}
    </div>

    <div class="viewer-controls">
      {#if keyPly}
        <button type="button" class="btn key-move" onclick={() => { go(keyPly); track('key_move', { game: src }); }}>{t(lang, 'memorial.keyMove')}: {moveNumber(keyPly)} {san(game.moves[keyPly - 1]?.san ?? '')}</button>
      {/if}
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
      <div class="side-tools">
        <button type="button" class="engine-toggle" role="switch" aria-checked={engineOn} onclick={() => { engineOn = !engineOn; track('engine_toggle', { on: engineOn }); }}>
          <span class="switch" aria-hidden="true"></span>{t(lang, 'viewer.engineToggle')}
        </button>
        <button type="button" class="btn flip-btn" aria-pressed={flipped} aria-keyshortcuts="f" onclick={flip}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={FLIP_ICON} /></svg>{t(lang, 'viewer.flip')}
        </button>
      </div>
      <section class="opening" aria-label={t(lang, 'opening.title')} aria-live="polite">
        {#if opening}
          <div class="opening-head">
            <span class="opening-eco">{opening.eco}</span>
            <strong class="opening-name">{openingText(opening.name)}</strong>
          </div>
          <dl class="opening-sides">
            {#each [['white', opening.white], ['black', opening.black]] as const as [side, name] (side)}
              {#if name}
                <div class={`opening-side is-${side}`}>
                  <dt><span class="piece-chip" aria-hidden="true"></span>{t(lang, side === 'white' ? 'match.white' : 'match.black')}</dt>
                  <dd>{openingText(name)}</dd>
                </div>
              {/if}
            {/each}
          </dl>
        {:else}
          <p class="opening-empty">{t(lang, 'opening.start')}</p>
        {/if}
      </section>
      <section class="engine" aria-label={t(lang, 'eval.label')}>
        <div class="engine-head">
          <span class="engine-name">{game.engine}, {lang === 'es' ? 'profundidad' : 'depth'} {game.depth}</span>
          <strong class="engine-eval">{formatEval(position)}</strong>
        </div>
        <span class="engine-best">{ply < last && position.bestSan ? `${t(lang, 'viewer.best')}: ${san(position.bestSan)}` : `${t(lang, 'viewer.end')}: ${resultText}`}</span>
        <span class="engine-verdict">
          {#if current && move}
            {moveNumber(ply)} {san(move.san)}
            <span class={`class-badge is-${current.klass}`}>{glyphOf(current.klass)} {t(lang, `class.${current.klass}`)}</span>
            {#if current.famous}<span class="class-note">({t(lang, 'class.famous')})</span>{/if}
          {/if}
        </span>
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
        {#each ['brilliant', 'great', 'inaccuracy', 'mistake', 'blunder'] as const as k (k)}
          <span><b class={`is-${k}`}>{glyphOf(k)}</b> {t(lang, `class.${k}`).toLowerCase()}</span>
        {/each}
      </p>
    </div>

    <div class="viewer-graph">
      <h3 class="graph-title">{t(lang, 'viewer.graph')}</h3>
      <EvalGraph positions={game.positions} moves={game.moves} {annotations} {ply} {lang} onselect={go} />
    </div>
  </div>
{/if}
