// Opening names along a game: which opening White chose and which defense Black answered with, from the
// Lichess names stored per game (scripts/lib/openings.ts). Spanish names come from a family glossary plus
// rules for the variation words; proper names (Najdorf, Breyer) stay as they are.
import type { Lang } from '../i18n/ui';

export interface OpeningMark { ply: number; eco: string; name: string }
export interface OpeningState { eco: string; name: string; white: string; black: string }

// Families that name Black's choice; everything else (Game, Opening, Attack, Gambit, System, Ruy Lopez) is White's.
const BLACK_FAMILY = /Defen[cs]e|Accepted|Declined|Indian(?! Attack)|Benoni|Countergambit/;
const BLACK_SEGMENT = /Defen[cs]e|Countergambit|Counterattack|Accepted|Declined/;
// Names that only say which pawn moved first: White's part reads as the move itself ("1.e4").
const FIRST_MOVE_ONLY = new Set(["King's Pawn Game", "Queen's Pawn Game", "King's Pawn Opening", "Queen's Pawn Opening"]);

/** Opening state after `ply`: the full name of the last named position and each side's part of it. */
export function openingAt(marks: OpeningMark[], ply: number, firstMoves: { white?: string; black?: string }): OpeningState | null {
  let white = firstMoves.white ? `1.${firstMoves.white}` : '';
  let black = firstMoves.black ? `1...${firstMoves.black}` : '';
  let last: OpeningMark | null = null;
  for (const mark of marks) {
    if (mark.ply > ply) break;
    last = mark;
    const [family, variation = ''] = mark.name.split(': ');
    if (BLACK_FAMILY.test(family!)) {
      black = mark.name;
      continue;
    }
    const segments = variation ? variation.split(', ') : [];
    const cut = segments.findIndex((s) => BLACK_SEGMENT.test(s));
    const own = cut < 0 ? segments : segments.slice(0, cut);
    if (own.length) white = `${family}: ${own.join(', ')}`;
    else if (!FIRST_MOVE_ONLY.has(family!)) white = family!;
    if (cut >= 0) black = segments.slice(cut).join(', ');
  }
  if (!last) return null;
  if (ply < 2) black = '';
  return { eco: last.eco, name: last.name, white, black };
}

// ---------- Spanish ----------

const FAMILY_ES: Record<string, string> = {
  "Queen's Pawn Game": 'Apertura de peón de dama',
  "King's Pawn Game": 'Apertura de peón de rey',
  'Indian Defense': 'Defensa india',
  "King's Knight Opening": 'Apertura del caballo de rey',
  "Queen's Gambit Declined": 'Gambito de dama rehusado',
  "Queen's Gambit": 'Gambito de dama',
  'Ruy Lopez': 'Apertura española',
  'English Opening': 'Apertura inglesa',
  'Sicilian Defense': 'Defensa siciliana',
  'Slav Defense': 'Defensa eslava',
  "King's Indian Defense": 'Defensa india de rey',
  'Zukertort Opening': 'Apertura Zukertort',
  'Nimzo-Indian Defense': 'Defensa nimzoindia',
  'Semi-Slav Defense': 'Defensa semieslava',
  'French Defense': 'Defensa francesa',
  'Caro-Kann Defense': 'Defensa Caro-Kann',
  'Grünfeld Defense': 'Defensa Grünfeld',
  "Queen's Indian Defense": 'Defensa india de dama',
  'Italian Game': 'Apertura italiana',
  "Petrov's Defense": 'Defensa Petrov',
  "Queen's Gambit Accepted": 'Gambito de dama aceptado',
  'Catalan Opening': 'Apertura catalana',
  'Tarrasch Defense': 'Defensa Tarrasch',
  'Horwitz Defense': 'Defensa Horwitz',
  "King's Indian Attack": 'Ataque indio de rey',
  'Dutch Defense': 'Defensa holandesa',
  'Neo-Grünfeld Defense': 'Defensa neogrünfeld',
  'Scotch Game': 'Apertura escocesa',
  'Benoni Defense': 'Defensa Benoni',
  'Pirc Defense': 'Defensa Pirc',
  'Réti Opening': 'Apertura Réti',
  'Four Knights Game': 'Partida de los cuatro caballos',
  'Slav Indian': 'India eslava',
  "King's Gambit": 'Gambito de rey',
  "King's Gambit Accepted": 'Gambito de rey aceptado',
  "King's Gambit Declined": 'Gambito de rey rehusado',
  'Yusupov-Rubinstein System': 'Sistema Yusupov-Rubinstein',
  'Modern Defense': 'Defensa moderna',
  'Semi-Slav Defense Accepted': 'Defensa semieslava aceptada',
  'Scandinavian Defense': 'Defensa escandinava',
  'Torre Attack': 'Ataque Torre',
  'Bogo-Indian Defense': 'Defensa bogoindia',
  'Vienna Game': 'Partida vienesa',
  'Vienna Gambit, with Max Lange Defense': 'Gambito vienés con la defensa Max Lange',
  'Three Knights Opening': 'Apertura de los tres caballos',
  'Alekhine Defense': 'Defensa Alekhine',
  'Hungarian Opening': 'Apertura húngara',
  "Pseudo Queen's Indian Defense": 'Seudo india de dama',
  'Old Indian Defense': 'Defensa india antigua',
  'Rubinstein Opening': 'Apertura Rubinstein',
  'Nimzo-Larsen Attack': 'Ataque Nimzo-Larsen',
  'Bird Opening': 'Apertura Bird',
  "Queen's Indian Defense, with e3": 'Defensa india de dama con e3',
  'Polish Defense': 'Defensa polaca',
  'Van Geet Opening': 'Apertura Van Geet',
  'Philidor Defense': 'Defensa Philidor',
  'Pterodactyl Defense': 'Defensa Pterodáctilo',
  "Bishop's Opening": 'Apertura de alfil',
  'Marienbad System': 'Sistema Marienbad',
  'Trompowsky Attack': 'Ataque Trompowsky',
  "King's Indian Attack, with e6": 'Ataque indio de rey con e6',
  "Queen's Indian Accelerated": 'India de dama acelerada',
  'Center Game': 'Partida central',
  'Petrov': 'Petrov',
  'Two Knights Defense': 'Defensa de los dos caballos',
  'Berlin Defense': 'Defensa berlinesa',
  'Giuoco Piano': 'Giuoco piano',
  'Giuoco Pianissimo': 'Giuoco pianissimo',
};

// Head noun of a variation segment and its gender, for adjective agreement.
const HEADS: Record<string, [string, 'f' | 'm']> = {
  Variation: ['variante', 'f'], Variations: ['variantes', 'f'], Line: ['línea', 'f'], Attack: ['ataque', 'm'],
  Gambit: ['gambito', 'm'], Defense: ['defensa', 'f'], Defence: ['defensa', 'f'], System: ['sistema', 'm'],
  Counterattack: ['contraataque', 'm'], Countergambit: ['contragambito', 'm'], Formation: ['formación', 'f'], Trap: ['trampa', 'f'], Invitation: ['invitación', 'f'],
};

// Adjectives: [feminine, masculine]. Nouns used as modifiers get "del" / "de".
const ADJ: Record<string, [string, string]> = {
  Classical: ['clásica', 'clásico'], Modern: ['moderna', 'moderno'], Main: ['principal', 'principal'], Closed: ['cerrada', 'cerrado'],
  Open: ['abierta', 'abierto'], Accelerated: ['acelerada', 'acelerado'], Hyperaccelerated: ['hiperacelerada', 'hiperacelerado'],
  Reversed: ['invertida', 'invertido'], Old: ['antigua', 'antiguo'], Normal: ['normal', 'normal'], Symmetrical: ['simétrica', 'simétrico'],
  Quiet: ['tranquila', 'tranquilo'], Delayed: ['diferida', 'diferido'], Deferred: ['diferida', 'diferido'], Traditional: ['tradicional', 'tradicional'],
  Early: ['temprana', 'temprano'], Rare: ['rara', 'raro'], Immediate: ['inmediata', 'inmediato'], Double: ['doble', 'doble'],
  Declined: ['rehusada', 'rehusado'], Accepted: ['aceptada', 'aceptado'], Central: ['central', 'central'], Positional: ['posicional', 'posicional'],
  Fianchetto: ['del fianchetto', 'del fianchetto'], Exchange: ['del cambio', 'del cambio'], Advance: ['del avance', 'del avance'],
  Dragon: ['del Dragón', 'del Dragón'], Hedgehog: ['del erizo', 'del erizo'], Kingside: ['de flanco de rey', 'de flanco de rey'],
  Queenside: ['de flanco de dama', 'de flanco de dama'], Knight: ['de caballo', 'de caballo'], Bishop: ['de alfil', 'de alfil'],
  Pawn: ['de peón', 'de peón'], Spanish: ['española', 'español'], Sicilian: ['siciliana', 'siciliano'], Indian: ['india', 'indio'],
  English: ['inglesa', 'inglés'], French: ['francesa', 'francés'], Slav: ['eslava', 'eslavo'], Catalan: ['catalana', 'catalán'],
  Berlin: ['berlinesa', 'berlinés'], Dutch: ['holandesa', 'holandés'], Swiss: ['suiza', 'suizo'], Hungarian: ['húngara', 'húngaro'],
  Scotch: ['escocesa', 'escocés'], Italian: ['italiana', 'italiano'], Russian: ['rusa', 'ruso'],
  Orthodox: ['ortodoxa', 'ortodoxo'], 'Neo-Orthodox': ['neoortodoxa', 'neoortodoxo'], Ukrainian: ['ucraniana', 'ucraniano'],
  Austrian: ['austriaca', 'austriaco'], Yugoslav: ['yugoslava', 'yugoslavo'], Czech: ['checa', 'checo'], Sharp: ['aguda', 'agudo'],
  Center: ['central', 'central'], Vienna: ['vienesa', 'vienés'], Polish: ['polaca', 'polaco'],
  Swedish: ['sueca', 'sueco'], Romanian: ['rumana', 'rumano'],
};
// Complements that follow the adjectives: "King's Indian System" is "sistema indio de rey".
const AFTER: Record<string, string> = {
  "King's": 'de rey', "Queen's": 'de dama', 'Two Knights': 'de los dos caballos', 'Three Knights': 'de los tres caballos',
  'Four Knights': 'de los cuatro caballos', Knights: 'de los caballos', Check: 'del jaque', London: 'Londres',
};
const WHOLE: Record<string, string> = {
  'Main Line': 'línea principal', 'Accelerated Move Order': 'orden de jugadas acelerado', 'Early Deviations': 'desvíos tempranos',
  'Modern Variations': 'variantes modernas', 'Rare Defenses': 'defensas poco comunes', 'Three Knights': 'tres caballos',
  'Accelerated Dragon': 'Dragón acelerado', 'Hyperaccelerated Dragon': 'Dragón hiperacelerado', 'Reversed Dragon': 'Dragón invertido',
  'Maróczy Bind': 'cerrojo Maróczy', 'Berlin Wall': 'muro de Berlín', 'Giuoco Piano': 'giuoco piano', 'Giuoco Pianissimo': 'giuoco pianissimo',
  'Double Fianchetto': 'doble fianchetto', 'Classical Fianchetto': 'fianchetto clásico', 'Kingside Fianchetto': 'fianchetto de rey',
  'Immediate Fianchetto': 'fianchetto inmediato', 'Delayed Fianchetto': 'fianchetto diferido', 'Delayed Exchange': 'cambio diferido',
  'Reversed Sicilian': 'siciliana invertida', 'Reversed Closed Sicilian': 'siciliana cerrada invertida', 'Reversed Alekhine': 'Alekhine invertida',
  'Reversed Grünfeld': 'Grünfeld invertida', 'Old Sicilian': 'siciliana antigua', 'Sicilian Invitation': 'invitación siciliana',
};

function segmentEs(segment: string): string {
  if (WHOLE[segment]) return WHOLE[segment]!;
  if (segment.startsWith('with ')) return `con ${segment.slice(5)}`;
  // Two-word complements are joined first so they read as one word.
  const words = segment.replace(/(Two|Three|Four) Knights/g, (m) => m.replace(' ', '_')).split(' ').map((w) => w.replace('_', ' '));
  // The head noun is the last one that names a kind of line ("Rio Gambit Accepted": gambito).
  const at = words.findLastIndex((w) => HEADS[w]);
  const head = at >= 0 ? HEADS[words[at]!]! : null;
  const gender = head?.[1] ?? 'f';
  const names: string[] = [];
  const adjectives: string[] = [];
  const after: string[] = [];
  words.forEach((word, i) => {
    if (i === at) return;
    const adj = ADJ[word];
    if (AFTER[word]) after.push(AFTER[word]!);
    else if (adj) adjectives.push(gender === 'f' ? adj[0] : adj[1]);
    else names.push(word);
  });
  return [head?.[0], ...names, ...adjectives, ...after].filter(Boolean).join(' ');
}

const capital = (text: string) => text.replace(/^./, (c) => c.toUpperCase());

/** Opening name in the reader's language. */
export function openingName(name: string, lang: Lang): string {
  if (lang === 'en' || !name || name.startsWith('1.')) return name;
  const [family = '', variation] = name.split(': ');
  const [first = '', ...rest] = FAMILY_ES[family] ? [family] : family.split(', ');
  const head = [capital(FAMILY_ES[first] ?? segmentEs(first)), ...rest.map(segmentEs)].join(', ');
  return variation ? `${head}: ${variation.split(', ').map(segmentEs).join(', ')}` : head;
}
