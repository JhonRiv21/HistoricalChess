# Historical Chess

[English](#english) · [Español](#español)

## English

Every World Chess Championship, from Steinitz–Zukertort (1886) to Gukesh–Sindarov (2026), game by game. Each match has its score progression, the stories that made it famous, freely licensed photos, archival and recap videos, and every game replayable with a per-move Stockfish analysis.

### What makes it different

- **Checked by hand, not copied.** Every match was checked against Wikipedia, Mark Weeks and Edward Winter. Wrong results in the source PGNs were corrected and annotated (for example, game 7 of Karpov–Korchnoi 1981 was a draw, not a Korchnoi win).
- **Engine analysis precomputed.** About 1,100 games analyzed offline with Stockfish 17.1 at depth 18. Pages load a small JSON per game, with no engine running in the reader's browser.
- **Readable for everyone.** Dark "analysis room" design with a light mode, high contrast, text size from 87.5 % to 150 %, wider spacing, a color-blind friendly board and figurine or letter notation. All color pairs meet WCAG 2.2.
- **No ads, no sign-up, no cookies.** Anonymous, cookieless analytics with Umami (optional, see `.env.example`). YouTube players load only when the reader presses play.

### Stack

Astro 7 (static output) · Svelte 5 islands · TypeScript strict · cm-chessboard · chess.js and Stockfish (WASM) for the data pipeline. Bilingual routes `/es/` and `/en/` with `hreflang`.

### Project layout

```
src/content/matches/   one JSON per championship (schema in src/content.config.ts)
src/content/photos/    photo registry: caption, author, license, Commons source
src/components/        Astro components and Svelte islands (viewer/, HeroLineup, ScoreRace…)
src/lib/               evaluation math, formatting, reading settings, view models
public/data/games/     precomputed engine analysis, one file per game
scripts/               data pipeline (PGN → match skeletons → analysis → validation)
data/pgn/              source PGNs (raw from pgnmentor.com, extra from Lichess studies)
```

### Commands

Requires Node 22.23.4 or newer (`.node-version` pins it).

```bash
npm install
npm run dev              # local site
npm run build            # astro check + static build into dist/
npm run data:skeleton    # create match JSON from the seed catalog and PGNs
npm run data:analyze     # Stockfish analysis, incremental (-- --workers 8 --depth 18)
npm run data:validate    # placeholders, score consistency, cross references
```

### Credits

Games: pgnmentor.com and Lichess studies. Photos: Wikimedia Commons (Nationaal Archief / Anefo, Agence Rol and others), each with its license on the About page. Pieces: Cburnett, CC BY-SA 3.0, via cm-chessboard. Analysis: Stockfish.

### Rights and contact

© 2026 Jhon Rivero. All rights reserved: the code and the site's texts may not be reused without permission. Photos and chess pieces keep the license shown for each one. Questions or corrections: jhonrivero21@gmail.com.

## Español

Todos los campeonatos del mundo de ajedrez, de Steinitz–Zukertort (1886) a Gukesh–Sindarov (2026), partida por partida. Cada match tiene la evolución del marcador, las historias que lo hicieron famoso, fotos con licencia libre, videos de archivo y resúmenes, y todas las partidas para reproducir con el análisis de Stockfish jugada por jugada.

### Qué lo hace distinto

- **Revisado a mano, no copiado.** Cada match se revisó contra Wikipedia, Mark Weeks y Edward Winter. Los resultados equivocados de los PGN de origen se corrigieron y quedaron anotados (por ejemplo, la partida 7 de Karpov–Korchnoi 1981 fue tablas, no victoria de Korchnoi).
- **Análisis de motor precalculado.** Unas 1.100 partidas analizadas con Stockfish 17.1 a profundidad 18. Cada página carga un JSON pequeño por partida; el navegador del lector no corre ningún motor.
- **Legible para todos.** Diseño oscuro de «sala de análisis» con modo claro, alto contraste, tamaño de texto de 87,5 % a 150 %, espaciado amplio, tablero apto para daltonismo y notación con figuras o letras. Todos los pares de color cumplen WCAG 2.2.
- **Sin anuncios, registro ni cookies.** Medición anónima y sin cookies con Umami (opcional, ver `.env.example`). El reproductor de YouTube carga solo cuando el lector le da reproducir.

### Tecnología

Astro 7 (salida estática) · islas de Svelte 5 · TypeScript estricto · cm-chessboard · chess.js y Stockfish (WASM) para el procesamiento de datos. Rutas bilingües `/es/` y `/en/` con `hreflang`.

### Estructura

```
src/content/matches/   un JSON por campeonato (esquema en src/content.config.ts)
src/content/photos/    registro de fotos: pie, autor, licencia, fuente en Commons
src/components/        componentes de Astro e islas de Svelte (viewer/, HeroLineup, ScoreRace…)
src/lib/               cálculo de evaluación, formato, preferencias de lectura, modelos de vista
public/data/games/     análisis de motor precalculado, un archivo por partida
scripts/               procesamiento de datos (PGN → esqueletos → análisis → validación)
data/pgn/              PGN de origen (raw de pgnmentor.com, extra de estudios de Lichess)
```

### Comandos

Requiere Node 22.23.4 o superior (lo fija `.node-version`).

```bash
npm install
npm run dev              # sitio local
npm run build            # astro check + build estático en dist/
npm run data:skeleton    # crea los JSON de los matches desde el catálogo semilla y los PGN
npm run data:analyze     # análisis con Stockfish, incremental (-- --workers 8 --depth 18)
npm run data:validate    # marcadores pendientes, coherencia del marcador, referencias cruzadas
```

### Créditos

Partidas: pgnmentor.com y estudios de Lichess. Fotos: Wikimedia Commons (Nationaal Archief / Anefo, Agence Rol y otros), cada una con su licencia en la página «Sobre el sitio». Piezas: Cburnett, CC BY-SA 3.0, vía cm-chessboard. Análisis: Stockfish.

### Derechos y contacto

© 2026 Jhon Rivero. Todos los derechos reservados: el código y los textos del sitio no se pueden reutilizar sin permiso. Las fotos y las piezas conservan la licencia indicada en cada una. Preguntas o correcciones: jhonrivero21@gmail.com.
