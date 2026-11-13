<script lang="ts">
  // Cumulative score per game for both players (classical games only), plus a strip of results.
  import { half } from '../lib/format';
  import { settings } from '../lib/settings.svelte';
  import { t, type Lang } from '../i18n/ui';

  interface Cell { round: number; label: string; text: string; side: 'a' | 'b' | 'draw'; note: boolean; href: string | null }
  interface Props {
    lang: Lang;
    a: { name: string; short: string; points: number[] }; // cumulative, starting at 0
    b: { name: string; short: string; points: number[] };
    cells: Cell[];
  }
  let { lang, a, b, cells }: Props = $props();

  const HEIGHT = 200;
  let width = $state(0);
  let hover: number | null = $state(null);

  const games = $derived(a.points.length - 1);
  const max = $derived(Math.max(1, Math.ceil(Math.max(a.points.at(-1) ?? 0, b.points.at(-1) ?? 0))));
  // Margins follow the reader's text size so the end labels never clip.
  const rem = $derived(16 * settings.scale);
  const pad = $derived({ top: 14, right: Math.round(rem * 6), bottom: Math.round(rem * 1.9), left: Math.round(rem * 2) });
  const innerW = $derived(Math.max(1, width - pad.left - pad.right));
  const innerH = $derived(HEIGHT - pad.top - pad.bottom);
  const x = (g: number) => pad.left + (g / Math.max(1, games)) * innerW;
  const y = (v: number) => pad.top + (1 - v / max) * innerH;
  const path = (points: number[]) => points.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  // Round tick steps: 1, 2, 5, 10… so labels land on numbers people read at a glance.
  const niceStep = (span: number, target: number) => [1, 2, 5, 10, 20, 50].find((s) => span / s <= target) ?? 100;
  const gridValues = $derived.by(() => {
    const stepY = niceStep(max, 4);
    return Array.from({ length: Math.floor(max / stepY) + 1 }, (_, i) => i * stepY);
  });
  const xTicks = $derived.by(() => {
    const stepX = niceStep(games, 6);
    const ticks = [1, ...Array.from({ length: Math.floor(games / stepX) }, (_, i) => (i + 1) * stepX)];
    return [...new Set(games - ticks.at(-1)! >= stepX / 2 ? [...ticks, games] : ticks)];
  });

  function onmove(event: PointerEvent) {
    const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
    hover = Math.max(1, Math.min(games, Math.round(((event.clientX - rect.left - pad.left) / innerW) * games)));
  }
  const hovered = $derived(hover ? cells.find((c) => c.round === hover) : undefined);
</script>

<div class="race">
  <div class="race-legend">
    <span class="legend-item series-a"><i class="legend-swatch"></i>{a.name}</span>
    <span class="legend-item series-b"><i class="legend-swatch"></i>{b.name}</span>
  </div>
  <div class="race-chart" bind:clientWidth={width}>
    {#if width && games > 0}
      <svg class="race-svg" {width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img"
        aria-label={`${a.short} ${half(a.points.at(-1) ?? 0)}, ${b.short} ${half(b.points.at(-1) ?? 0)}`}
        onpointermove={onmove} onpointerleave={() => (hover = null)}>
        {#each gridValues as v (v)}
          <line x1={pad.left} x2={pad.left + innerW} y1={y(v)} y2={y(v)} class="grid" />
          <text x={pad.left - 8} y={y(v) + 4} text-anchor="end" class="tick">{v}</text>
        {/each}
        {#each xTicks as g (g)}
          <text x={x(g)} y={HEIGHT - 8} text-anchor="middle" class="tick">{g}</text>
        {/each}
        {#each [['series-a', a], ['series-b', b]] as const as [cls, series] (cls)}
          <g class={cls}>
            <path d={path(series.points)} class="race-line" />
            <circle cx={x(games)} cy={y(series.points.at(-1) ?? 0)} r="4" class="race-end" />
            <text x={x(games) + 9} y={y(series.points.at(-1) ?? 0) + 4} class="race-label">{series.short} {half(series.points.at(-1) ?? 0)}</text>
          </g>
        {/each}
        {#if hover}<line class="race-cursor" style="opacity:1" x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + innerH} />{/if}
      </svg>
    {/if}
    {#if hover && hovered}
      <div class="chart-tip" role="status" style={`left:${Math.max(4, Math.min(width - 220, x(hover) - 110))}px;top:${pad.top + 8}px`}>
        <strong>{hovered.label}</strong>
        <span>{a.short} {half(a.points[hover] ?? 0)}, {b.short} {half(b.points[hover] ?? 0)}</span>
      </div>
    {/if}
  </div>
  <ol class="game-strip" aria-label={t(lang, 'match.progress')}>
    {#each cells as cell (cell.round)}
      <li>
        {#if cell.href}
          <a class={`game-cell is-${cell.side}${cell.note ? ' has-note' : ''}`} href={cell.href} aria-label={cell.label}>
            <span class="game-no">{cell.round}</span><span class="game-res">{cell.text}</span>
          </a>
        {:else}
          <span class={`game-cell is-${cell.side}${cell.note ? ' has-note' : ''}`} role="img" aria-label={cell.label}>
            <span class="game-no">{cell.round}</span><span class="game-res">{cell.text}</span>
          </span>
        {/if}
      </li>
    {/each}
  </ol>
</div>
