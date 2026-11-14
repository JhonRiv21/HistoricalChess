// Detects moves that leave material en prise on purpose. A heuristic: after the move, the most valuable
// piece the opponent can win (attacked and undefended, or attacked by a cheaper piece), minus what the move
// captured, is the material offered, in pawns. Replies to check and mates are skipped: they are forced or final.
// Whether an offer is brilliant is decided later from the engine evaluations.
import { Chess, type Color, type Square } from 'chess.js';

const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function exposed(position: Chess, side: Color): number {
  const opponent: Color = side === 'w' ? 'b' : 'w';
  let worst = 0;
  for (const row of position.board()) {
    for (const piece of row) {
      if (!piece || piece.color !== side || piece.type === 'k') continue;
      const square = piece.square as Square;
      const attackers = position.attackers(square, opponent);
      if (!attackers.length) continue;
      const cheapest = Math.min(...attackers.map((sq) => VALUE[position.get(sq)?.type ?? 'k'] ?? 0));
      const value = VALUE[piece.type] ?? 0;
      const loss = position.attackers(square, side).length ? Math.max(0, value - cheapest) : value;
      worst = Math.max(worst, loss);
    }
  }
  return worst;
}

export function materialOffered(beforeFen: string, after: Chess, mover: Color, captured?: string): number {
  if (after.isCheckmate() || new Chess(beforeFen).inCheck()) return 0;
  return Math.max(0, exposed(after, mover) - (captured ? VALUE[captured] ?? 0 : 0));
}
