// PGN helpers shared by the data scripts.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Chess } from 'chess.js';

export const PGN_DIR = join(import.meta.dirname, '../../data/pgn');

export interface PgnGame {
  index: number; // position inside its file, 0-based
  headers: Record<string, string>;
  movetext: string;
}

export function readPgnFile(file: string): PgnGame[] {
  const path = file.startsWith('extra/') ? join(PGN_DIR, file) : join(PGN_DIR, 'raw', file);
  const text = readFileSync(path, 'latin1').replace(/\r\n/g, '\n');
  return text
    .split(/\n(?=\[Event )/)
    .map((block) => block.trim())
    .filter((block) => block.startsWith('[Event '))
    .map((block, index) => {
      const headers: Record<string, string> = {};
      for (const [, key, value] of block.matchAll(/^\[(\w+) "([^"]*)"\]$/gm)) headers[key!] = value!;
      const movetext = block.replace(/^\[.*\]$/gm, '').trim();
      return { index, headers, movetext };
    });
}

/** Loads a game into chess.js; throws with context when the movetext is illegal. */
export function replay(game: PgnGame, label: string): Chess {
  const chess = new Chess();
  try {
    chess.loadPgn(`${Object.entries(game.headers).map(([k, v]) => `[${k} "${v}"]`).join('\n')}\n\n${game.movetext}`, { strict: false });
  } catch (error) {
    throw new Error(`${label}: illegal PGN (${(error as Error).message})`);
  }
  return chess;
}

const ALIASES: Record<string, string> = {
  kortschnoj: 'korchnoi', korchnoi: 'korchnoi', bogoljubow: 'bogoljubov', bogoljubov: 'bogoljubov',
  janowsky: 'janowski', janowski: 'janowski', tschigorin: 'chigorin', chigorin: 'chigorin', tchigorin: 'chigorin',
  aljechin: 'alekhine', alekhine: 'alekhine', 'ding liren': 'ding', ding: 'ding', gukesh: 'gukesh', 'gukesh d': 'gukesh',
  'nepomniachtchi': 'nepomniachtchi', 'nepomniachtchi ian': 'nepomniachtchi', kasparov: 'kasparov', karpov: 'karpov',
};

/** "Spassky, Boris V" -> "spassky"; known spelling variants map to one id. */
export function playerId(pgnName: string): string {
  const surname = pgnName.split(',')[0]!.trim().toLowerCase();
  const key = ALIASES[pgnName.trim().toLowerCase()] ?? ALIASES[surname];
  return key ?? surname.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]+/g, '-');
}

export function gameKind(event: string): 'classical' | 'rapid' | 'blitz' | 'armageddon' {
  if (/armageddon/i.test(event)) return 'armageddon';
  if (/blitz/i.test(event)) return 'blitz';
  if (/rapid|playoff|tie-?break|\bTB\b/i.test(event)) return 'rapid';
  return 'classical';
}
