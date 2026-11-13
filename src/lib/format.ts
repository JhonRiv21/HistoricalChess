// Formatting helpers shared by pages and islands.
import type { Lang } from '../i18n/ui';

/** 12.5 -> "12½", 0.5 -> "½". */
export const half = (n: number) => {
  const whole = Math.floor(n);
  return n - whole ? `${whole || ''}½` : `${whole}`;
};

export const scoreLine = (a: number, b: number) => `${half(a)}–${half(b)}`;

export const formatDate = (iso: string | undefined, lang: Lang) =>
  iso ? new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso)) : '';

export const moveNumber = (ply: number) => `${Math.ceil(ply / 2)}${ply % 2 ? '.' : '…'}`;

// Figurine notation (as printed chess books do) or localized piece letters.
export type Notation = 'figurine' | 'letters';
const FIGURINES: Record<string, string> = { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘' };
const LETTERS: Record<Lang, Record<string, string>> = {
  es: { K: 'R', Q: 'D', R: 'T', B: 'A', N: 'C' },
  en: { K: 'K', Q: 'Q', R: 'R', B: 'B', N: 'N' },
};
export const PIECE_NAMES: Record<Lang, Record<string, string>> = {
  es: { K: 'rey', Q: 'dama', R: 'torre', B: 'alfil', N: 'caballo' },
  en: { K: 'king', Q: 'queen', R: 'rook', B: 'bishop', N: 'knight' },
};

export function formatSan(san: string, notation: Notation, lang: Lang) {
  const map = notation === 'letters' ? LETTERS[lang] : FIGURINES;
  return san.replace(/^[KQRBN]/, (p) => map[p]!).replace(/=([QRBN])/, (_, p: string) => `=${map[p]}`);
}

/** Splits a SAN move so the figurine can get its own font and an accessible piece name. */
export function sanParts(san: string, notation: Notation, lang: Lang) {
  const match = san.match(/^([KQRBN])(.*)$/);
  if (!match || notation === 'letters') return { piece: null, rest: formatSan(san, notation, lang) };
  const [, piece = '', rest = ''] = match;
  return { piece: { glyph: FIGURINES[piece]!, name: PIECE_NAMES[lang][piece]! }, rest: formatSan(rest, notation, lang) };
}
