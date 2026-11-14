// View models for the match and game pages, so the .astro files only render.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { gameUrl, isTiebreak, playerOf, pointsFor, type Game, type MatchData } from './content';
import { half } from './format';
import { pick, t, type Lang } from '../i18n/ui';

export const analysisPath = (slug: string, round: number) => `/data/games/${slug}/${round}.json`;
export const hasAnalysis = (slug: string, round: number) => existsSync(join(process.cwd(), 'public', analysisPath(slug, round)));

/** The two finalists, title holder first. Tournaments and empty entries return null. */
export function finalists(match: MatchData) {
  if ((match.kind !== 'match' && match.kind !== 'upcoming') || match.players.length !== 2) return null;
  const [a, b] = match.players;
  return a && b ? { a, b } : null;
}

/** "Partida 7" for classical games, "Rápida 2 de desempate" for tiebreak games (numbered on their own). */
export function gameLabel(match: MatchData, game: Game, lang: Lang) {
  if (!isTiebreak(game)) return `${t(lang, 'match.round')} ${game.round}`;
  const index = match.games.filter(isTiebreak).findIndex((g) => g.round === game.round) + 1;
  return t(lang, 'match.rapidGame').replace('{n}', String(index));
}

/** Short cell tag: the classical round number, or R1, R2… for rapid tiebreak games. */
export const gameTag = (match: MatchData, game: Game) =>
  isTiebreak(game) ? `R${match.games.filter(isTiebreak).findIndex((g) => g.round === game.round) + 1}` : String(game.round);

export function resultLabel(match: MatchData, game: Game, lang: Lang) {
  if (game.kind === 'forfeit') {
    const loser = game.result === '1-0' ? game.black : game.white;
    return `${t(lang, 'match.forfeit')}: ${playerOf(match, loser)?.short ?? loser}`;
  }
  if (game.result === '1/2-1/2') return t(lang, 'match.draw');
  const winner = game.result === '1-0' ? game.white : game.black;
  return `${t(lang, 'match.winsGame')} ${playerOf(match, winner)?.short ?? winner}`;
}

/** Cumulative classical score and the per-game strip for the score race. */
export function scoreRace(match: MatchData, slug: string, lang: Lang) {
  const pair = finalists(match);
  if (!pair) return null;
  const counted = match.games.filter((g) => !isTiebreak(g));
  if (!counted.length) return null;
  const points = { a: [0], b: [0] };
  for (const g of counted) {
    points.a.push(points.a.at(-1)! + pointsFor(g, pair.a.id));
    points.b.push(points.b.at(-1)! + pointsFor(g, pair.b.id));
  }
  // Initials only when they tell the players apart (Karpov and Kasparov both start with K).
  const tag = pair.a.short.charAt(0) === pair.b.short.charAt(0)
    ? (short: string) => short.slice(0, 3)
    : (short: string) => short.charAt(0);
  const cell = (g: Game) => {
    const pa = pointsFor(g, pair.a.id);
    const side = g.result === '1/2-1/2' ? 'draw' : pa === 1 ? 'a' : 'b';
    return {
      round: g.round,
      tag: gameTag(match, g),
      side: side as 'a' | 'b' | 'draw',
      text: side === 'draw' ? '½' : tag(side === 'a' ? pair.a.short : pair.b.short),
      label: `${gameLabel(match, g, lang)}: ${resultLabel(match, g, lang)}${g.note ? `. ${pick(g.note, lang)}` : ''}`,
      note: Boolean(g.note) || g.kind === 'forfeit',
      href: g.plies > 0 ? gameUrl(lang, slug, g.round) : null,
    };
  };
  const cells = counted.map(cell);
  const rapid = match.games.filter(isTiebreak);
  const tiebreak = rapid.length && match.tiebreak
    ? { score: `${half(match.tiebreak[pair.a.id] ?? 0)}–${half(match.tiebreak[pair.b.id] ?? 0)}`, cells: rapid.map(cell) }
    : null;
  return {
    a: { name: pair.a.name, short: pair.a.short, points: points.a },
    b: { name: pair.b.name, short: pair.b.short, points: points.b },
    cells,
    tiebreak,
  };
}

/** Points per player across all games, best first (used for tournaments). */
export function standings(match: MatchData) {
  const table = new Map(match.players.map((p) => [p.id, 0]));
  for (const g of match.games) {
    table.set(g.white, (table.get(g.white) ?? 0) + pointsFor(g, g.white));
    table.set(g.black, (table.get(g.black) ?? 0) + pointsFor(g, g.black));
  }
  return [...table.entries()]
    .sort(([, x], [, y]) => y - x)
    .flatMap(([id, points]) => {
      const player = playerOf(match, id);
      return player ? [{ player, points: half(points) }] : [];
    });
}

export function verdict(match: MatchData, lang: Lang) {
  const winner = playerOf(match, match.winner);
  if (!winner) return t(lang, 'match.noWinner');
  const holder = match.players.find((p) => p.role === 'champion');
  return `${winner.short} ${holder?.id === winner.id && match.kind === 'match' ? t(lang, 'match.retains') : t(lang, 'match.wins')}`;
}
