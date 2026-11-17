// Analyzes every game referenced by the match catalog with Stockfish (WASM, UCI over stdio) and writes
// public/data/games/<slug>/<round>.json. Incremental: games already analyzed are skipped.
// Usage: npx tsx scripts/analyze-games.ts [--depth 18] [--workers 8] [slug ...]
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { cpus } from 'node:os';
import { Chess } from 'chess.js';
import { readPgnFile, replay } from './lib/pgn.ts';
import { materialOffered } from './lib/sacrifice.ts';
import { openingMarks } from './lib/openings.ts';

const ROOT = join(import.meta.dirname, '..');
const MATCHES = join(ROOT, 'src/content/matches');
const OUT = join(ROOT, 'public/data/games');
const CHAMPIONS = join(ROOT, 'src/content/champions');
const MEMORIAL_OUT = join(ROOT, 'public/data/memorial');
const ENGINE_VERSION = 'Stockfish 17.1 lite';
// v2 adds the second-best line (to spot only-moves) and material offered per move (to spot sacrifices).
const ANALYSIS_VERSION = 2;

const args = process.argv.slice(2);
const flag = (name: string, fallback: number) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args[i + 1]) : fallback;
};
const DEPTH = flag('depth', 18);
const WORKERS = flag('workers', Math.max(1, Math.min(8, cpus().length - 2)));
const onlySlugs = new Set(args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--')));

const require = createRequire(import.meta.url);
const engineDir = join(dirname(require.resolve('stockfish/package.json')), 'src');
const enginePath = join(engineDir, readdirSync(engineDir).find((f) => /^stockfish-.*-lite-[0-9a-f]+\.js$/.test(f))!);

interface Job { slug: string; round: number; pgnRef: string; out: string }

class Engine {
  private proc: ChildProcessWithoutNullStreams;
  private buffer = '';
  private waiter: { token: string; resolve: (out: string) => void } | null = null;

  constructor() {
    this.proc = spawn(process.execPath, [enginePath]);
    this.proc.stdout.on('data', (chunk) => {
      this.buffer += chunk;
      if (this.waiter && this.buffer.includes(this.waiter.token)) {
        const out = this.buffer;
        this.buffer = '';
        const { resolve } = this.waiter;
        this.waiter = null;
        resolve(out);
      }
    });
  }

  send(cmd: string, token: string): Promise<string> {
    return new Promise((resolve) => {
      this.waiter = { token, resolve };
      this.proc.stdin.write(`${cmd}\n`);
    });
  }

  async init() {
    await this.send('uci', 'uciok');
    await this.send('setoption name Hash value 64\nsetoption name MultiPV value 2\nisready', 'readyok');
  }

  /** Returns the evaluation from White's point of view plus the best move in UCI. */
  async evaluate(fen: string) {
    await this.send(`position fen ${fen}\nisready`, 'readyok');
    const out = await this.send(`go depth ${DEPTH}`, 'bestmove');
    const lines = out.split('\n').filter((l) => l.startsWith('info depth') && l.includes(' score '));
    const sign = fen.split(' ')[1] === 'w' ? 1 : -1;
    const score = (pv: number) => {
      const line = lines.filter((l) => l.includes(` multipv ${pv} `)).at(-1) ?? (pv === 1 ? lines.at(-1) ?? '' : '');
      const cp = line.match(/score cp (-?\d+)/);
      const mate = line.match(/score mate (-?\d+)/);
      return { ...(cp ? { cp: sign * Number(cp[1]) } : {}), ...(mate ? { mate: sign * Number(mate[1]) } : {}) };
    };
    const best = out.match(/bestmove (\S+)/)?.[1];
    const alt = score(2);
    return {
      ...score(1),
      ...(best && best !== '(none)' ? { best } : {}),
      ...(Object.keys(alt).length ? { alt } : {}),
    };
  }

  quit() { this.proc.kill(); }
}

/** Deletes analyses whose game was renumbered, re-sourced or removed, so they get redone. */
function reconcile(dir: string, expected: Map<string, string | undefined>) {
  if (!existsSync(dir)) return;
  const slug = dir.split('/').at(-1);
  for (const file of readdirSync(dir)) {
    const stored = JSON.parse(readFileSync(join(dir, file), 'utf8')).pgnRef;
    if (expected.get(file) !== stored) {
      rmSync(join(dir, file));
      console.log(`- ${slug}/${file}: stale (${stored} -> ${expected.get(file) ?? 'no game'})`);
    }
  }
}

const isOutdated = (out: string) => !existsSync(out) || JSON.parse(readFileSync(out, 'utf8')).version !== ANALYSIS_VERSION;

function collectJobs(): Job[] {
  const jobs: Job[] = [];
  for (const file of readdirSync(MATCHES).filter((f) => f.endsWith('.json'))) {
    const slug = file.replace(/\.json$/, '');
    if (onlySlugs.size && !onlySlugs.has(slug)) continue;
    const doc = JSON.parse(readFileSync(join(MATCHES, file), 'utf8'));
    const games = doc.games as { round: number; pgnRef?: string; plies: number }[];
    reconcile(join(OUT, slug), new Map(games.filter((g) => g.pgnRef && g.plies > 0).map((g) => [`${g.round}.json`, g.pgnRef])));
    for (const g of games) {
      const out = join(OUT, slug, `${g.round}.json`);
      if (g.pgnRef && g.plies > 0 && isOutdated(out)) jobs.push({ slug, round: g.round, pgnRef: g.pgnRef, out });
    }
  }
  // Memorial games: one file per champion, games keyed by their id.
  for (const file of existsSync(CHAMPIONS) ? readdirSync(CHAMPIONS).filter((f) => f.endsWith('.json')) : []) {
    const id = file.replace(/\.json$/, '');
    if (onlySlugs.size && !onlySlugs.has(id)) continue;
    const games = JSON.parse(readFileSync(join(CHAMPIONS, file), 'utf8')).games as { id: string; pgnRef: string }[];
    reconcile(join(MEMORIAL_OUT, id), new Map(games.map((g) => [`${g.id}.json`, g.pgnRef])));
    for (const g of games) {
      const out = join(MEMORIAL_OUT, id, `${g.id}.json`);
      if (isOutdated(out)) jobs.push({ slug: id, round: 0, pgnRef: g.pgnRef, out });
    }
  }
  return jobs;
}

async function analyze(engine: Engine, job: Job) {
  const [file, index] = job.pgnRef.split('#') as [string, string];
  const pgn = readPgnFile(file)[Number(index)];
  if (!pgn) throw new Error(`${job.slug} #${job.round}: ${job.pgnRef} not found`);
  const history = replay(pgn, `${job.slug} #${job.round}`).history({ verbose: true });
  await engine.send('ucinewgame\nisready', 'readyok');
  const board = new Chess();
  const positions = [];
  const sacrifices = new Map<number, number>();
  for (let i = 0; i <= history.length; i++) {
    const fen = board.fen();
    const evaluation = board.isGameOver() ? {} : await engine.evaluate(fen);
    let bestSan: string | undefined;
    if (evaluation.best) {
      const probe = new Chess(fen);
      bestSan = probe.move({ from: evaluation.best.slice(0, 2), to: evaluation.best.slice(2, 4), promotion: evaluation.best[4] })?.san;
    }
    positions.push({ fen, ...evaluation, ...(bestSan ? { bestSan } : {}) });
    const move = history[i];
    if (move) {
      board.move(move.san);
      const offered = materialOffered(fen, board, move.color, move.captured);
      if (offered >= 2) sacrifices.set(i, offered);
    }
  }
  mkdirSync(dirname(job.out), { recursive: true });
  writeFileSync(job.out, JSON.stringify({
    version: ANALYSIS_VERSION,
    pgnRef: job.pgnRef,
    engine: ENGINE_VERSION,
    depth: DEPTH,
    moves: history.map((m, i) => ({ san: m.san, from: m.from, to: m.to, ...(sacrifices.has(i) ? { offered: sacrifices.get(i) } : {}) })),
    positions,
    openings: openingMarks(positions.map((p) => p.fen)),
  }));
}

const jobs = collectJobs();
console.log(`${jobs.length} games to analyze with ${WORKERS} workers at depth ${DEPTH}`);
let done = 0;
const started = Date.now();
await Promise.all(Array.from({ length: Math.min(WORKERS, jobs.length) }, async () => {
  const engine = new Engine();
  await engine.init();
  for (let job = jobs.shift(); job; job = jobs.shift()) {
    try {
      await analyze(engine, job);
    } catch (error) {
      console.error(`x ${job.slug} #${job.round}: ${(error as Error).message}`);
    }
    done += 1;
    if (done % 25 === 0) console.log(`${done} done, ${((Date.now() - started) / 60000).toFixed(1)} min`);
  }
  engine.quit();
}));
console.log(`finished ${done} games in ${((Date.now() - started) / 60000).toFixed(1)} min`);
