// Checks the memorial (src/content/champions): PGNs replay legally, plies/result match the PGN,
// keyMove sits at keyPly, and photo/match references exist.
// Usage: npx tsx scripts/validate-champions.ts [championId ...]
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readPgnFile, replay } from './lib/pgn.ts';

const ROOT = join(import.meta.dirname, '..');
const DIR = join(ROOT, 'src/content/champions');
const only = new Set(process.argv.slice(2));
const problems: string[] = [];

interface MemorialGame { id: string; pgnRef: string; plies: number; result: string; keyPly?: number; keyMove?: string }

for (const file of existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith('.json')).sort() : []) {
  const id = file.replace(/\.json$/, '');
  if (only.size && !only.has(id)) continue;
  const doc = JSON.parse(readFileSync(join(DIR, file), 'utf8'));
  const report = (msg: string) => problems.push(`${id}: ${msg}`);

  if (/\bTODO\b/.test(JSON.stringify(doc))) report('contains TODO placeholders');
  if (!existsSync(join(ROOT, 'src/content/photos', `${doc.photo}.json`))) report(`photo "${doc.photo}" has no entry`);
  for (const slug of doc.matches ?? []) if (!existsSync(join(ROOT, 'src/content/matches', `${slug}.json`))) report(`match "${slug}" does not exist`);

  const ids = new Set<string>();
  for (const g of doc.games as MemorialGame[]) {
    if (ids.has(g.id)) report(`duplicate game id ${g.id}`);
    ids.add(g.id);
    const [pgnFile = '', index = ''] = g.pgnRef.split('#');
    let games;
    try {
      games = readPgnFile(pgnFile);
    } catch {
      report(`${g.id}: cannot read ${pgnFile}`);
      continue;
    }
    const pgn = games[Number(index)];
    if (!pgn) { report(`${g.id}: ${g.pgnRef} not found`); continue; }
    let history: string[];
    try {
      history = replay(pgn, g.id).history();
    } catch (error) {
      report((error as Error).message);
      continue;
    }
    if (history.length !== g.plies) report(`${g.id}: plies ${g.plies} but PGN has ${history.length}`);
    if (pgn.headers.Result && pgn.headers.Result !== g.result) report(`${g.id}: result ${g.result} but PGN says ${pgn.headers.Result}`);
    if (g.keyPly != null) {
      const san = history[g.keyPly - 1];
      if (!san) report(`${g.id}: keyPly ${g.keyPly} is past the end`);
      else if (g.keyMove && san !== g.keyMove) report(`${g.id}: keyPly ${g.keyPly} is ${san}, not ${g.keyMove}`);
    }
  }
}

if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`\n${problems.length} problem(s)`);
  process.exit(1);
}
console.log('champions OK');
