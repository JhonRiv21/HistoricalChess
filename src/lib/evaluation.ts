// Engine math. Win probability and move accuracy follow the published Lichess formulas.
export interface Evaluation { cp?: number; mate?: number }
export interface AnalyzedPosition extends Evaluation { fen: string; best?: string; bestSan?: string }
export interface AnalyzedMove { san: string; from: string; to: string }
export interface AnalyzedGame {
  pgnRef: string;
  engine: string;
  depth: number;
  moves: AnalyzedMove[];
  positions: AnalyzedPosition[];
}

export type MoveClass = 'inaccuracy' | 'mistake' | 'blunder';
export interface Annotation { loss: number; accuracy: number; klass: MoveClass | null; whiteMoved: boolean }

const MATE_CP = 1000;
const glyphs: Record<MoveClass, string> = { inaccuracy: '?!', mistake: '?', blunder: '??' };
export const glyphOf = (klass: MoveClass) => glyphs[klass];

export const toCentipawns = ({ cp, mate }: Evaluation) => (mate != null ? Math.sign(mate) * MATE_CP : cp ?? 0);

export const whiteWinPercent = (position: Evaluation) => {
  const cp = toCentipawns(position);
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
};

export function formatEval({ cp, mate }: Evaluation) {
  if (mate != null) return `${mate > 0 ? '+' : '−'}M${Math.abs(mate)}`;
  const pawns = (cp ?? 0) / 100;
  return `${pawns > 0 ? '+' : pawns < 0 ? '−' : ''}${Math.abs(pawns).toFixed(1)}`;
}

// Thresholds on the mover's lost win percentage (Lichess: 0.1 / 0.2 / 0.3 winning chances).
const thresholds: [number, MoveClass][] = [[15, 'blunder'], [10, 'mistake'], [5, 'inaccuracy']];
const moveAccuracy = (loss: number) => Math.min(100, Math.max(0, 103.1668 * Math.exp(-0.04354 * loss) - 3.1669));

export function annotateGame(positions: AnalyzedPosition[]): Annotation[] {
  return positions.slice(1).map((after, i) => {
    const before = positions[i]!;
    const whiteMoved = i % 2 === 0;
    const sign = whiteMoved ? 1 : -1;
    const loss = Math.max(0, sign * (whiteWinPercent(before) - whiteWinPercent(after)));
    const klass = thresholds.find(([min]) => loss >= min)?.[1] ?? null;
    return { loss, accuracy: moveAccuracy(loss), klass, whiteMoved };
  });
}

export function playerAccuracy(annotations: Annotation[]) {
  const mean = (list: Annotation[]) => list.reduce((sum, a) => sum + a.accuracy, 0) / Math.max(1, list.length);
  return { white: mean(annotations.filter((a) => a.whiteMoved)), black: mean(annotations.filter((a) => !a.whiteMoved)) };
}
