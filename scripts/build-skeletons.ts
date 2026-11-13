// Generates src/content/matches/<slug>.json from the seed catalog and the PGN files.
// Existing files are left alone (they are curated by hand) unless --force <slug> is given.
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PLAYERS, SEED, type SeedMatch } from './catalog-seed.ts';
import { gameKind, playerId, readPgnFile, replay } from './lib/pgn.ts';

const OUT = join(import.meta.dirname, '../src/content/matches');
const forced = new Set(process.argv.slice(2).filter((a) => a !== '--force'));
const TODO = { es: 'TODO', en: 'TODO' };

function playerEntry(id: string, seed: SeedMatch, pgnName?: string) {
  const known = PLAYERS[id];
  const role = seed.kind === 'tournament' ? (id === seed.winner ? 'champion' : 'contender') : id === seed.players[0] ? 'champion' : 'challenger';
  if (known) return { id, name: known.name, short: known.short, country: known.country, role };
  const [surname = id, given = ''] = (pgnName ?? id).split(',').map((s) => s.trim());
  return { id, name: `${given} ${surname}`.trim(), short: surname, country: TODO, role };
}

function buildGames(seed: SeedMatch) {
  if (!seed.pgn) return { games: [], names: new Map<string, string>() };
  const file = seed.pgn;
  if (!existsSync(join(import.meta.dirname, '../data/pgn', file.startsWith('extra/') ? file : `raw/${file}`))) {
    console.warn(`! ${seed.slug}: missing ${file}`);
    return { games: [], names: new Map<string, string>() };
  }
  const names = new Map<string, string>();
  const games = readPgnFile(file).map((g, i) => {
    const chess = replay(g, `${seed.slug} #${i}`);
    const white = playerId(g.headers.White ?? '');
    const black = playerId(g.headers.Black ?? '');
    names.set(white, g.headers.White ?? white);
    names.set(black, g.headers.Black ?? black);
    const date = g.headers.Date?.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
    return {
      round: i + 1,
      kind: gameKind(g.headers.Event ?? ''),
      white,
      black,
      result: g.headers.Result as '1-0' | '0-1' | '1/2-1/2',
      ...(date ? { date: `${date[1]}-${date[2]}-${date[3]}` } : {}),
      ...(g.headers.ECO ? { eco: g.headers.ECO } : {}),
      plies: chess.history().length,
      pgnRef: `${file}#${g.index}`,
    };
  });
  return { games, names };
}

function tally(games: ReturnType<typeof buildGames>['games'], kinds: string[]) {
  const score: Record<string, number> = {};
  for (const g of games.filter((x) => kinds.includes(x.kind))) {
    const add = (id: string, points: number) => { score[id] = (score[id] ?? 0) + points; };
    add(g.white, g.result === '1-0' ? 1 : g.result === '0-1' ? 0 : 0.5);
    add(g.black, g.result === '0-1' ? 1 : g.result === '1-0' ? 0 : 0.5);
  }
  return score;
}

for (const seed of SEED) {
  const path = join(OUT, `${seed.slug}.json`);
  if (existsSync(path) && !forced.has(seed.slug)) continue;
  const { games, names } = buildGames(seed);
  const ids = seed.kind === 'tournament' ? [...new Set([...seed.players, ...names.keys()])] : seed.players;
  const score = tally(games, ['classical']);
  const tiebreak = tally(games, ['rapid', 'blitz', 'armageddon']);
  const doc = {
    year: seed.year,
    kind: seed.kind,
    era: seed.era,
    title: seed.title,
    players: ids.map((id) => playerEntry(id, seed, names.get(id))),
    winner: seed.winner,
    ...(Object.keys(score).length ? { score } : {}),
    ...(Object.keys(tiebreak).length ? { tiebreak } : {}),
    ...(seed.retainedOnTie ? { retainedOnTie: true } : {}),
    site: seed.site,
    dates: {},
    summary: TODO,
    games,
    featuredRounds: [],
    moments: [],
    facts: [],
    photos: [],
    videos: [],
    sources: [{ label: 'Wikipedia', url: seed.wikipedia }],
  };
  writeFileSync(path, `${JSON.stringify(doc, null, 2)}\n`);
  console.log(`${seed.slug}: ${games.length} games, players ${ids.join(', ')}`);
}
