// Content checks that the zod schema cannot express: placeholders, score consistency, cross references.
// Usage: npx tsx scripts/validate-content.ts [slug ...]   (no args = every match)
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const MATCHES = join(ROOT, 'src/content/matches');
const PHOTOS = join(ROOT, 'src/content/photos');
const only = new Set(process.argv.slice(2));

interface Game { round: number; kind: string; white: string; black: string; result: string }
interface Localized { es: string; en: string }

const problems: string[] = [];
const report = (slug: string, msg: string) => problems.push(`${slug}: ${msg}`);

function findTodos(value: unknown, path: string, slug: string) {
  if (typeof value === 'string' && /\bTODO\b/.test(value)) report(slug, `placeholder at ${path}`);
  else if (Array.isArray(value)) value.forEach((v, i) => findTodos(v, `${path}[${i}]`, slug));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) findTodos(v, `${path}.${k}`, slug);
}

function tally(games: Game[], kinds: string[]) {
  const score: Record<string, number> = {};
  for (const g of games.filter((x) => kinds.includes(x.kind))) {
    const add = (id: string, points: number) => { score[id] = (score[id] ?? 0) + points; };
    add(g.white, g.result === '1-0' ? 1 : g.result === '0-1' ? 0 : 0.5);
    add(g.black, g.result === '0-1' ? 1 : g.result === '1-0' ? 0 : 0.5);
  }
  return score;
}

const sameScore = (a: Record<string, number> = {}, b: Record<string, number> = {}) =>
  Object.keys({ ...a, ...b }).every((k) => (a[k] ?? 0) === (b[k] ?? 0));

for (const file of readdirSync(MATCHES).filter((f) => f.endsWith('.json')).sort()) {
  const slug = file.replace(/\.json$/, '');
  if (only.size && !only.has(slug)) continue;
  const doc = JSON.parse(readFileSync(join(MATCHES, file), 'utf8'));
  findTodos(doc, '', slug);

  const ids = new Set<string>(doc.players.map((p: { id: string }) => p.id));
  if (doc.winner && !ids.has(doc.winner)) report(slug, `winner "${doc.winner}" is not a player`);
  const games: Game[] = doc.games;
  games.forEach((g, i) => {
    if (g.round !== i + 1) report(slug, `round ${g.round} out of sequence at index ${i}`);
    for (const side of [g.white, g.black]) if (!ids.has(side)) report(slug, `game ${g.round}: unknown player "${side}"`);
  });

  if (doc.kind === 'match' && games.length) {
    // Forfeits count for the score, so they are tallied with classical games.
    const classical = tally(games, ['classical', 'forfeit']);
    if (!sameScore(classical, doc.score) && !doc.note) report(slug, `score ${JSON.stringify(doc.score)} != games ${JSON.stringify(classical)} (explain in "note")`);
    const tb = tally(games, ['rapid', 'blitz', 'armageddon']);
    if (Object.keys(tb).length && !sameScore(tb, doc.tiebreak)) report(slug, `tiebreak ${JSON.stringify(doc.tiebreak)} != games ${JSON.stringify(tb)}`);
  }

  const rounds = new Set(games.map((g) => g.round));
  for (const r of doc.featuredRounds ?? []) if (!rounds.has(r)) report(slug, `featured round ${r} does not exist`);
  for (const mo of doc.moments ?? []) if (mo.round && !rounds.has(mo.round)) report(slug, `moment ${mo.id} points to missing round ${mo.round}`);
  for (const p of [...(doc.photos ?? []), ...(doc.moments ?? []).map((x: { photo?: string }) => x.photo).filter(Boolean)]) {
    if (!existsSync(join(PHOTOS, `${p}.json`))) report(slug, `photo "${p}" has no entry in src/content/photos`);
  }
  const localizedFields: [string, Localized | undefined][] = [['summary', doc.summary], ['site', doc.site]];
  for (const [name, value] of localizedFields) if (!value?.es || !value?.en) report(slug, `${name} needs es and en`);
  if (!doc.sources?.length) report(slug, 'needs at least one source');
}

if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`\n${problems.length} problem(s)`);
  process.exit(1);
}
console.log('content OK');
