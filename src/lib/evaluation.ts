// Engine math. Win probability and accuracy follow the published Lichess formulas; the move classes
// follow common conventions (Lichess, Chess.com) with criteria stated on the About page.
import type { OpeningMark } from './openings';
export interface Evaluation { cp?: number; mate?: number }
export interface AnalyzedPosition extends Evaluation { fen: string; best?: string; bestSan?: string; alt?: Evaluation }
export interface AnalyzedMove { san: string; from: string; to: string; offered?: number }
export interface AnalyzedGame {
  version?: number;
  pgnRef: string;
  engine: string;
  depth: number;
  moves: AnalyzedMove[];
  positions: AnalyzedPosition[];
  openings?: OpeningMark[];
}

export type MoveClass = 'brilliant' | 'great' | 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
export interface Annotation { loss: number; accuracy: number; klass: MoveClass; whiteMoved: boolean; famous: boolean }

const MATE_CP = 1000;
const GLYPHS: Partial<Record<MoveClass, string>> = { brilliant: '!!', great: '!', best: '★', inaccuracy: '?!', mistake: '?', blunder: '??' };
export const glyphOf = (klass: MoveClass) => GLYPHS[klass] ?? '';
/** Classes worth marking in the move list; the rest only show in the engine panel. */
export const isMarked = (klass: MoveClass) => ['brilliant', 'great', 'inaccuracy', 'mistake', 'blunder'].includes(klass);
export const isError = (klass: MoveClass) => klass === 'inaccuracy' || klass === 'mistake' || klass === 'blunder';

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

// Thresholds on the mover's lost winning chances, in percentage points (Lichess: 5 / 10 / 15).
export const CRITERIA = {
  blunder: 15, mistake: 10, inaccuracy: 5, good: 5, excellent: 2,
  onlyMoveGap: 12, // great: the best move is at least this much better than the second-best
  brilliantGap: 15, // brilliant: a stricter only-move gap
  sacrifice: 3, // brilliant: material left en prise, in pawns (a minor piece or more)
  brilliantWindow: [30, 80] as const, // brilliant: mover's chances before the move (not lost, not already won)
};

const moveAccuracy = (loss: number) => Math.min(100, Math.max(0, 103.1668 * Math.exp(-0.04354 * loss) - 3.1669));

export function annotateGame(positions: AnalyzedPosition[], moves: AnalyzedMove[], famousPly?: number): Annotation[] {
  return moves.map((move, i) => {
    const before = positions[i]!;
    const after = positions[i + 1]!;
    const whiteMoved = i % 2 === 0;
    const forMover = (e: Evaluation) => (whiteMoved ? whiteWinPercent(e) : 100 - whiteWinPercent(e));
    const chancesBefore = forMover(before);
    const chancesAfter = forMover(after);
    const loss = Math.max(0, chancesBefore - chancesAfter);
    const playedBest = before.best?.slice(0, 4) === `${move.from}${move.to}` || loss < 0.5;
    const gap = before.alt ? chancesBefore - forMover(before.alt) : 0;
    const previous = moves[i - 1];
    const forced = previous?.san.includes('+') || (previous && move.san.includes('x') && previous.to === move.to);
    const famous = famousPly === i + 1 && loss < CRITERIA.good;
    const [low, high] = CRITERIA.brilliantWindow;

    let klass: MoveClass;
    if (loss >= CRITERIA.blunder) klass = 'blunder';
    else if (loss >= CRITERIA.mistake) klass = 'mistake';
    else if (loss >= CRITERIA.inaccuracy) klass = 'inaccuracy';
    // Checks and king moves are left out of engine brilliancies: a sacrifice with check is usually a forcing
    // tactic, and a king move only leaves en prise what was already hanging. Famous ones come through keyPly.
    else if (famous || (playedBest && !forced && !move.san.includes('+') && !move.san.startsWith('K') && (move.offered ?? 0) >= CRITERIA.sacrifice
      && gap >= CRITERIA.brilliantGap && chancesBefore >= low && chancesBefore <= high && chancesAfter >= 40)) klass = 'brilliant';
    else if (playedBest && !forced && gap >= CRITERIA.onlyMoveGap && chancesBefore <= 90) klass = 'great';
    else if (playedBest) klass = 'best';
    else if (loss < CRITERIA.excellent) klass = 'excellent';
    else klass = 'good';
    return { loss, accuracy: moveAccuracy(loss), klass, whiteMoved, famous };
  });
}

export function playerAccuracy(annotations: Annotation[]) {
  const mean = (list: Annotation[]) => list.reduce((sum, a) => sum + a.accuracy, 0) / Math.max(1, list.length);
  return { white: mean(annotations.filter((a) => a.whiteMoved)), black: mean(annotations.filter((a) => !a.whiteMoved)) };
}
