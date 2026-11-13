<script lang="ts">
  // Win-probability graph for one game. Click or drag to jump to a move.
  import { formatEval, glyphOf, whiteWinPercent, type AnalyzedMove, type AnalyzedPosition, type Annotation } from '../../lib/evaluation';
  import { moveNumber } from '../../lib/format';
  import { t, type Lang } from '../../i18n/ui';

  interface Props {
    positions: AnalyzedPosition[];
    moves: AnalyzedMove[];
    annotations: Annotation[];
    ply: number;
    lang: Lang;
    onselect: (ply: number) => void;
  }
  let { positions, moves, annotations, ply, lang, onselect }: Props = $props();

  const HEIGHT = 150;
  const PAD = { top: 10, bottom: 24, left: 4, right: 4 };
  let width = $state(0);
  let hover: number | null = $state(null);

  const pcts = $derived(positions.map(whiteWinPercent));
  const innerW = $derived(Math.max(1, width - PAD.left - PAD.right));
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (p: number) => PAD.left + (p / Math.max(1, pcts.length - 1)) * innerW;
  const y = (pct: number) => PAD.top + (1 - pct / 100) * innerH;
  const line = $derived(pcts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p).toFixed(1)}`).join(''));
  const area = $derived(`${line}L${x(pcts.length - 1)},${y(0)}L${x(0)},${y(0)}Z`);
  const marks = $derived(annotations.flatMap((a, i) => (a.klass && a.klass !== 'inaccuracy' ? [{ ply: i + 1, klass: a.klass }] : [])));
  const ticks = $derived([10, 20, 30, 40, 50, 60, 70, 80].filter((n) => n * 2 <= pcts.length));

  function plyAt(event: PointerEvent) {
    const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
    return Math.max(0, Math.min(pcts.length - 1, Math.round(((event.clientX - rect.left - PAD.left) / innerW) * (pcts.length - 1))));
  }

  const tip = $derived.by(() => {
    if (hover == null) return null;
    const position = positions[hover]!;
    if (hover === 0) return { lines: [t(lang, 'viewer.initial'), formatEval(position)], x: x(0), y: y(pcts[0]!) };
    const klass = annotations[hover - 1]?.klass;
    return {
      lines: [`${moveNumber(hover)} ${moves[hover - 1]!.san}${klass ? ` ${glyphOf(klass)}` : ''}`, `${t(lang, 'eval.label')} ${formatEval(position)}`, ...(klass ? [t(lang, `class.${klass}`)] : [])],
      x: x(hover),
      y: y(pcts[hover]!),
    };
  });
</script>

<div class="evalgraph" bind:clientWidth={width}>
  {#if width}
    <svg
      class="evalgraph-svg"
      {width}
      height={HEIGHT}
      viewBox={`0 0 ${width} ${HEIGHT}`}
      role="img"
      aria-label={t(lang, 'viewer.graphLabel')}
      onpointermove={(event) => { hover = plyAt(event); if (event.buttons) onselect(hover); }}
      onpointerleave={() => (hover = null)}
      onpointerdown={(event) => onselect(plyAt(event))}
    >
      <rect x={PAD.left} y={PAD.top} width={innerW} height={innerH} class="graph-black" />
      <path d={area} class="graph-white" />
      <line x1={PAD.left} x2={PAD.left + innerW} y1={y(50)} y2={y(50)} class="graph-mid" />
      <path d={line} class="graph-line" />
      {#each marks as mark (mark.ply)}
        <circle cx={x(mark.ply)} cy={y(pcts[mark.ply]!)} r="4" class={`mark mark-${mark.klass}`} />
      {/each}
      {#each ticks as n (n)}
        <text x={x(n * 2 - 1)} y={HEIGHT - 6} text-anchor="middle" class="tick">{n}</text>
      {/each}
      <line class="graph-cursor" x1={x(ply)} x2={x(ply)} y1={PAD.top} y2={PAD.top + innerH} />
    </svg>
  {/if}
  {#if tip}
    <div class="chart-tip" role="status" style={`left:${Math.max(4, Math.min(width - 180, tip.x - 90))}px;top:${Math.max(0, tip.y - 76)}px`}>
      {#each tip.lines as text, i (i)}
        {#if i === 0}<strong>{text}</strong>{:else}<span>{text}</span>{/if}
      {/each}
    </div>
  {/if}
</div>
