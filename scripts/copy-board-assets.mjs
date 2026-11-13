// Copies cm-chessboard sprites (pieces, arrows, markers) to public/ so the board can load them at runtime.
import { cpSync, rmSync } from 'node:fs';

rmSync('public/cm-chessboard', { recursive: true, force: true });
for (const dir of ['pieces', 'extensions/arrows', 'extensions/markers']) {
  cpSync(`node_modules/cm-chessboard/assets/${dir}`, `public/cm-chessboard/${dir}`, {
    recursive: true,
    filter: (src) => !/\.(scss|map|css)$|staunty/.test(src), // staunty pieces carry a separate license
  });
}
