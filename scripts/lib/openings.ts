// Opening names from the Lichess chess-openings set (CC0, data/openings/*.tsv), looked up by position so
// transpositions get their name too. A game gets the name of the last known position along its moves.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Chess } from 'chess.js';

const DIR = join(import.meta.dirname, '../../data/openings');

export interface OpeningMark { ply: number; eco: string; name: string }

// Board, side to move, castling and en passant: the same position regardless of move counters.
const key = (fen: string) => fen.split(' ').slice(0, 4).join(' ');

let book: Map<string, { eco: string; name: string }> | null = null;

function load() {
  if (book) return book;
  book = new Map();
  for (const file of readdirSync(DIR).filter((f) => f.endsWith('.tsv')).sort()) {
    for (const line of readFileSync(join(DIR, file), 'utf8').split('\n').slice(1)) {
      const [eco, name, pgn] = line.split('\t');
      if (!eco || !name || !pgn) continue;
      const board = new Chess();
      board.loadPgn(pgn);
      book.set(key(board.fen()), { eco, name });
    }
  }
  return book;
}

/** Plies where the opening name changes, from the FEN of every position (index = ply). */
export function openingMarks(fens: string[]): OpeningMark[] {
  const names = load();
  const marks: OpeningMark[] = [];
  fens.forEach((fen, ply) => {
    const hit = ply > 0 ? names.get(key(fen)) : undefined;
    if (hit && (hit.name !== marks.at(-1)?.name || hit.eco !== marks.at(-1)?.eco)) marks.push({ ply, ...hit });
  });
  return marks;
}
