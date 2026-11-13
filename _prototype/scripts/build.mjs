// Bundles the modular prototype into one self-contained HTML file for the artifact.
import { build } from 'esbuild';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const tmp = `${root}dist/.bundle`;

await build({
  entryPoints: [`${root}src/app/main.js`],
  bundle: true,
  format: 'iife',
  minify: true,
  target: 'es2022',
  outdir: tmp,
  loader: { '.jpg': 'dataurl', '.svg': 'text', '.json': 'json' },
  logLevel: 'warning',
});

const js = readFileSync(`${tmp}/main.js`, 'utf8').replaceAll('</script', '<\\/script');
const css = readFileSync(`${tmp}/main.css`, 'utf8');
const html = readFileSync(`${root}src/template.html`, 'utf8')
  .replace('/*__CSS__*/', () => css)
  .replace('/*__JS__*/', () => js);
writeFileSync(`${root}dist/historical-chess.html`, html);
rmSync(tmp, { recursive: true, force: true });
console.log(`dist/historical-chess.html ${(html.length / 1024).toFixed(0)} KB`);
