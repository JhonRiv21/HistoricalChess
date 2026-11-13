// Analyze one PGN game with Stockfish (WASM, UCI over stdio) and emit per-ply evaluations.
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { Chess } from 'chess.js';

const [pgnPath, round, outPath, depth = '16'] = process.argv.slice(2);
const games = readFileSync(pgnPath, 'utf8').split(/\n(?=\[Event )/);
const pgn = games.find((g) => g.includes(`[Round "${round}"]`));
const game = new Chess();
game.loadPgn(pgn);
const history = game.history({ verbose: true });

const engine = spawn('node', [new URL('./node_modules/stockfish/src/stockfish-17.1-lite-51f59da.js', import.meta.url).pathname]);
let buffer = '';
let waiter = null;
engine.stdout.on('data', (chunk) => {
  buffer += chunk;
  if (waiter && buffer.includes(waiter.token)) {
    const out = buffer; buffer = ''; const w = waiter; waiter = null; w.resolve(out);
  }
});
const send = (cmd, token) => new Promise((resolve) => { waiter = { token, resolve }; engine.stdin.write(cmd + '\n'); });

function parseInfo(out, whiteToMove) {
  const lines = out.split('\n').filter((l) => l.startsWith('info depth') && l.includes(' score '));
  const last = lines.at(-1) ?? '';
  const cp = last.match(/score cp (-?\d+)/);
  const mate = last.match(/score mate (-?\d+)/);
  const sign = whiteToMove ? 1 : -1;
  const best = out.match(/bestmove (\S+)/)?.[1];
  return { cp: cp ? sign * Number(cp[1]) : null, mate: mate ? sign * Number(mate[1]) : null, best };
}

await send('uci', 'uciok');
await send('setoption name Hash value 64\nisready', 'readyok');
const board = new Chess();
const positions = [];
for (let i = 0; i <= history.length; i++) {
  const fen = board.fen();
  await send(`position fen ${fen}\nisready`, 'readyok');
  const out = await send(`go depth ${depth}`, 'bestmove');
  const info = parseInfo(out, board.turn() === 'w');
  let bestSan = null;
  if (info.best && info.best !== '(none)') {
    const probe = new Chess(fen);
    bestSan = probe.move({ from: info.best.slice(0, 2), to: info.best.slice(2, 4), promotion: info.best[4] })?.san ?? null;
  }
  positions.push({ fen, cp: info.cp, mate: info.mate, best: info.best, bestSan });
  if (i < history.length) board.move(history[i].san);
  process.stderr.write(`\r${i}/${history.length}`);
}
engine.kill();
const headers = game.getHeaders();
writeFileSync(outPath, JSON.stringify({ headers, moves: history.map((m) => ({ san: m.san, from: m.from, to: m.to })), positions }));
process.stderr.write('\ndone\n');
