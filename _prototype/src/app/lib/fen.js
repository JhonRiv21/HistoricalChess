// Minimal FEN placement parser: returns [{ square: 'e4', piece: 'wk' }, ...].
const FILES = 'abcdefgh';

export function piecesFromFen(fen) {
  const rows = fen.split(' ')[0].split('/');
  const pieces = [];
  rows.forEach((row, r) => {
    let file = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) { file += Number(ch); continue; }
      const color = ch === ch.toUpperCase() ? 'w' : 'b';
      pieces.push({ square: `${FILES[file]}${8 - r}`, piece: color + ch.toLowerCase() });
      file += 1;
    }
  });
  return pieces;
}

export const squareToXY = (square, size) => ({
  x: FILES.indexOf(square[0]) * size,
  y: (8 - Number(square[1])) * size,
});

// Figurine notation (as printed chess books do) or Spanish piece letters.
const FIGURINES = { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘' };
const SPANISH = { K: 'R', Q: 'D', R: 'T', B: 'A', N: 'C' };
const PIECE_NAMES = { K: 'rey', Q: 'dama', R: 'torre', B: 'alfil', N: 'caballo' };

export const formatSan = (san, notation) => {
  const map = notation === 'letters' ? SPANISH : FIGURINES;
  return san.replace(/^[KQRBN]/, (p) => map[p]).replace(/=([QRBN])/, (_, p) => `=${map[p]}`);
};

// DOM version so the figurine gets its own font and an accessible piece name.
export function sanNodes(san, notation) {
  const match = san.match(/^([KQRBN])(.*)$/);
  if (!match || notation === 'letters') return [formatSan(san, notation)];
  const fig = document.createElement('span');
  fig.className = 'fig';
  fig.setAttribute('role', 'img');
  fig.setAttribute('aria-label', PIECE_NAMES[match[1]]);
  fig.textContent = FIGURINES[match[1]];
  return [fig, formatSan(match[2], notation)];
}
