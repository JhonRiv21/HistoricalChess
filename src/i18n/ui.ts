// Interface strings. Content (summaries, facts, captions) lives in the content collections.
export const LANGS = ['es', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export interface Localized { es: string; en: string }
export const pick = (value: Localized, lang: Lang) => value[lang];

const ui = {
  'site.name': { es: 'Historical Chess', en: 'Historical Chess' },
  'site.tagline': {
    es: 'Todos los campeonatos del mundo de ajedrez, partida por partida.',
    en: 'Every World Chess Championship, game by game.',
  },
  'nav.championships': { es: 'Campeonatos', en: 'Championships' },
  'nav.about': { es: 'Sobre el sitio', en: 'About' },
  'nav.language': { es: 'English', en: 'Español' },
  'nav.languageLabel': { es: 'Ver en inglés', en: 'Ver en español' },
  'a11y.open': { es: 'Accesibilidad', en: 'Accessibility' },
  'skip': { es: 'Saltar al contenido', en: 'Skip to content' },

  'home.title': { es: 'Todos los campeonatos del mundo', en: 'Every world championship' },
  'home.lede': {
    es: 'Desde Steinitz contra Zukertort en 1886 hasta Gukesh contra Sindarov en Ginebra. Desliza la línea de tiempo y abre cualquier match para repasar sus partidas.',
    en: 'From Steinitz versus Zukertort in 1886 to Gukesh versus Sindarov in Geneva. Scroll the timeline and open any match to replay its games.',
  },
  'hero.label': { es: 'Campeones del mundo', en: 'World champions' },
  'hero.choose': { es: 'Elegir campeón', en: 'Choose a champion' },
  'hero.champion': { es: 'Campeón', en: 'Champion' },
  'hero.openMatch': { es: 'Ver el match de', en: 'See the match of' },
  'hero.pause': { es: 'Pausar el cambio automático', en: 'Pause autoplay' },
  'hero.play': { es: 'Reanudar el cambio automático', en: 'Resume autoplay' },

  'era.classic': { es: 'Antes de la FIDE', en: 'Before FIDE' },
  'era.fide': { es: 'Era FIDE', en: 'FIDE era' },
  'era.split': { es: 'Título dividido', en: 'Split title' },
  'era.unified': { es: 'Título reunificado', en: 'Reunified title' },
  'timeline.label': { es: 'Línea de tiempo de los campeonatos, desplazable', en: 'Scrollable championship timeline' },
  'timeline.beats': { es: 'vence a', en: 'beats' },
  'timeline.rapid': { es: 'rápidas', en: 'rapid' },
  'kind.tournament': { es: 'Torneo', en: 'Tournament' },
  'kind.forfeit': { es: 'Sin match', en: 'No match' },
  'kind.knockout': { es: 'Eliminatorio', en: 'Knockout' },
  'kind.upcoming': { es: 'Próximo', en: 'Upcoming' },
  'title.pca': { es: 'PCA', en: 'PCA' },
  'title.fide': { es: 'FIDE', en: 'FIDE' },
  'title.classical': { es: 'Clásico', en: 'Classical' },

  'match.crumbs': { es: 'Todos los campeonatos', en: 'All championships' },
  'match.wins': { es: 'gana el título', en: 'wins the title' },
  'match.retains': { es: 'retiene el título', en: 'keeps the title' },
  'match.noWinner': { es: 'Sin ganador', en: 'No winner' },
  'match.progress': { es: 'Partida a partida', en: 'Game by game' },
  'match.games': { es: 'Todas las partidas', en: 'All games' },
  'match.moments': { es: 'Los momentos del match', en: 'Moments of the match' },
  'match.photos': { es: 'Galería', en: 'Gallery' },
  'match.videos': { es: 'Videos', en: 'Videos' },
  'match.facts': { es: 'Para contar en la sobremesa', en: 'Worth retelling' },
  'match.sources': { es: 'Fuentes', en: 'Sources' },
  'match.tiebreak': { es: 'Desempate', en: 'Tiebreak' },
  'match.draw': { es: 'Tablas', en: 'Draw' },
  'match.winsGame': { es: 'Gana', en: 'Win for' },
  'match.forfeit': { es: 'No presentado', en: 'Forfeit' },
  'match.featured': { es: 'Partida destacada', en: 'Featured game' },
  'match.round': { es: 'Partida', en: 'Game' },
  'match.white': { es: 'Blancas', en: 'White' },
  'match.black': { es: 'Negras', en: 'Black' },
  'match.result': { es: 'Resultado', en: 'Result' },
  'match.opening': { es: 'Apertura', en: 'Opening' },
  'match.moves': { es: 'Jugadas', en: 'Moves' },
  'role.champion': { es: 'Campeón', en: 'Champion' },
  'role.challenger': { es: 'Retador', en: 'Challenger' },
  'role.contender': { es: 'Aspirante', en: 'Contender' },

  'viewer.nav': { es: 'Navegar la partida', en: 'Navigate the game' },
  'viewer.first': { es: 'Ir al inicio', en: 'Go to start' },
  'viewer.prev': { es: 'Jugada anterior', en: 'Previous move' },
  'viewer.next': { es: 'Jugada siguiente', en: 'Next move' },
  'viewer.last': { es: 'Ir al final', en: 'Go to end' },
  'viewer.start': { es: 'Inicio', en: 'Start' },
  'viewer.engineToggle': { es: 'Mostrar el análisis del motor', en: 'Show engine analysis' },
  'viewer.best': { es: 'Mejor jugada aquí', en: 'Best move here' },
  'viewer.end': { es: 'Fin de la partida', en: 'End of the game' },
  'viewer.accuracy': { es: 'Precisión en la partida', en: 'Accuracy in this game' },
  'viewer.accuracyNote': {
    es: 'Compara cada jugada con la del motor. En partidas antiguas sirve de referencia, no de nota: los jugadores no tenían motores para preparar.',
    en: 'Compares each move with the engine’s choice. For older games it is a reference, not a grade: players had no engines to prepare with.',
  },
  'viewer.graph': { es: 'Quién iba ganando, jugada a jugada', en: 'Who was winning, move by move' },
  'viewer.graphLabel': { es: 'Probabilidad de ganar de las blancas a lo largo de la partida', en: 'White’s winning chances throughout the game' },
  'viewer.moves': { es: 'Jugadas de la partida', en: 'Game moves' },
  'viewer.loading': { es: 'Cargando la partida…', en: 'Loading the game…' },
  'viewer.error': { es: 'No se pudo cargar la partida. Revisa tu conexión y recarga la página.', en: 'The game could not be loaded. Check your connection and reload the page.' },
  'viewer.keys': { es: 'Usa las flechas del teclado para avanzar y retroceder.', en: 'Use the arrow keys to step through the moves.' },
  'viewer.initial': { es: 'Posición inicial', en: 'Starting position' },
  'viewer.after': { es: 'Posición tras', en: 'Position after' },
  'viewer.was': { es: 'fue', en: 'was' },
  'eval.label': { es: 'Evaluación', en: 'Evaluation' },
  'class.inaccuracy': { es: 'Imprecisión', en: 'Inaccuracy' },
  'class.mistake': { es: 'Error', en: 'Mistake' },
  'class.blunder': { es: 'Error grave', en: 'Blunder' },

  'video.play': { es: 'Reproducir', en: 'Play' },
  'video.notice': { es: 'El reproductor de YouTube se carga solo al darle reproducir.', en: 'The YouTube player loads only when you press play.' },
  'gallery.open': { es: 'Ampliar', en: 'Enlarge' },
  'gallery.close': { es: 'Cerrar foto', en: 'Close photo' },
  'gallery.fallback': {
    es: 'No hay fotos de este match con licencia libre. Mostramos a los jugadores en esa época.',
    en: 'There are no freely licensed photos of this match. These show the players around that time.',
  },

  'footer.credits': {
    es: 'Partidas: pgnmentor.com y Lichess. Fotos: Wikimedia Commons (Nationaal Archief / Anefo y otros), con su licencia en cada imagen. Piezas: Cburnett, CC BY-SA 3.0. Análisis: Stockfish.',
    en: 'Games: pgnmentor.com and Lichess. Photos: Wikimedia Commons (Nationaal Archief / Anefo and others), licensed as shown on each image. Pieces: Cburnett, CC BY-SA 3.0. Analysis: Stockfish.',
  },
} satisfies Record<string, Localized>;

export type UiKey = keyof typeof ui;
export const t = (lang: Lang, key: UiKey) => ui[key][lang];
export const tFor = (lang: Lang) => (key: UiKey) => ui[key][lang];
