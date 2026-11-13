// Engine math. Win probability and move accuracy follow the published Lichess formulas.
const MATE_CP = 1000;

export const toCentipawns = ({ cp, mate }) => (mate != null ? Math.sign(mate) * MATE_CP : cp ?? 0);

export const whiteWinPercent = (position) => {
  const cp = toCentipawns(position);
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
};

export const formatEval = ({ cp, mate }) => {
  if (mate != null) return `${mate > 0 ? '+' : '−'}M${Math.abs(mate)}`;
  const pawns = (cp ?? 0) / 100;
  return `${pawns > 0 ? '+' : pawns < 0 ? '−' : ''}${Math.abs(pawns).toFixed(1)}`;
};

// Thresholds on the mover's lost win percentage (Lichess: 0.1 / 0.2 / 0.3 winning chances).
const CLASSES = [
  { min: 15, id: 'blunder', glyph: '??', label: 'Error grave' },
  { min: 10, id: 'mistake', glyph: '?', label: 'Error' },
  { min: 5, id: 'inaccuracy', glyph: '?!', label: 'Imprecisión' },
];

const moveAccuracy = (loss) => Math.min(100, Math.max(0, 103.1668 * Math.exp(-0.04354 * loss) - 3.1669));

export function annotateGame(positions) {
  return positions.slice(1).map((after, i) => {
    const before = positions[i];
    const whiteMoved = i % 2 === 0;
    const sign = whiteMoved ? 1 : -1;
    const loss = Math.max(0, sign * (whiteWinPercent(before) - whiteWinPercent(after)));
    const klass = CLASSES.find((c) => loss >= c.min) ?? null;
    return { loss, accuracy: moveAccuracy(loss), klass, whiteMoved };
  });
}

export function playerAccuracy(annotations) {
  const mean = (list) => list.reduce((sum, a) => sum + a.accuracy, 0) / Math.max(1, list.length);
  return {
    white: mean(annotations.filter((a) => a.whiteMoved)),
    black: mean(annotations.filter((a) => !a.whiteMoved)),
  };
}
