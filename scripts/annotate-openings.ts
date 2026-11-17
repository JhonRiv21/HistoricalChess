// Adds the opening names to every analyzed game (public/data/games and public/data/memorial) without
// running the engine again. The analysis script writes the same field for new games.
// Usage: npx tsx scripts/annotate-openings.ts
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openingMarks } from './lib/openings.ts';

const ROOT = join(import.meta.dirname, '..');
let count = 0;
for (const base of ['public/data/games', 'public/data/memorial']) {
  for (const entry of readdirSync(join(ROOT, base), { recursive: true, encoding: 'utf8' })) {
    if (!entry.endsWith('.json')) continue;
    const path = join(ROOT, base, entry);
    const game = JSON.parse(readFileSync(path, 'utf8'));
    game.openings = openingMarks(game.positions.map((p: { fen: string }) => p.fen));
    writeFileSync(path, JSON.stringify(game));
    count += 1;
  }
}
console.log(`openings added to ${count} games`);
