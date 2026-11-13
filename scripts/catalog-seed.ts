// Seed catalog: the facts needed to generate each match skeleton from its PGN.
// Curators verify and enrich the generated JSON in src/content/matches; this file is only the starting point.
export interface SeedPlayer {
  name: string;
  short: string;
  country: { es: string; en: string };
}

export const PLAYERS: Record<string, SeedPlayer> = {
  steinitz: { name: 'Wilhelm Steinitz', short: 'Steinitz', country: { es: 'Austria / Estados Unidos', en: 'Austria / United States' } },
  zukertort: { name: 'Johannes Zukertort', short: 'Zukertort', country: { es: 'Polonia / Reino Unido', en: 'Poland / United Kingdom' } },
  chigorin: { name: 'Mikhail Chigorin', short: 'Chigorin', country: { es: 'Rusia', en: 'Russia' } },
  gunsberg: { name: 'Isidor Gunsberg', short: 'Gunsberg', country: { es: 'Hungría / Reino Unido', en: 'Hungary / United Kingdom' } },
  lasker: { name: 'Emanuel Lasker', short: 'Lasker', country: { es: 'Alemania', en: 'Germany' } },
  marshall: { name: 'Frank Marshall', short: 'Marshall', country: { es: 'Estados Unidos', en: 'United States' } },
  tarrasch: { name: 'Siegbert Tarrasch', short: 'Tarrasch', country: { es: 'Alemania', en: 'Germany' } },
  schlechter: { name: 'Carl Schlechter', short: 'Schlechter', country: { es: 'Austria', en: 'Austria' } },
  janowski: { name: 'Dawid Janowski', short: 'Janowski', country: { es: 'Francia', en: 'France' } },
  capablanca: { name: 'José Raúl Capablanca', short: 'Capablanca', country: { es: 'Cuba', en: 'Cuba' } },
  alekhine: { name: 'Alexander Alekhine', short: 'Alekhine', country: { es: 'Rusia / Francia', en: 'Russia / France' } },
  bogoljubov: { name: 'Efim Bogoljubov', short: 'Bogoljubov', country: { es: 'Alemania', en: 'Germany' } },
  euwe: { name: 'Max Euwe', short: 'Euwe', country: { es: 'Países Bajos', en: 'Netherlands' } },
  botvinnik: { name: 'Mikhail Botvinnik', short: 'Botvinnik', country: { es: 'URSS', en: 'Soviet Union' } },
  bronstein: { name: 'David Bronstein', short: 'Bronstein', country: { es: 'URSS', en: 'Soviet Union' } },
  smyslov: { name: 'Vasily Smyslov', short: 'Smyslov', country: { es: 'URSS', en: 'Soviet Union' } },
  tal: { name: 'Mikhail Tal', short: 'Tal', country: { es: 'URSS (Letonia)', en: 'Soviet Union (Latvia)' } },
  petrosian: { name: 'Tigran Petrosian', short: 'Petrosian', country: { es: 'URSS (Armenia)', en: 'Soviet Union (Armenia)' } },
  spassky: { name: 'Boris Spassky', short: 'Spassky', country: { es: 'URSS', en: 'Soviet Union' } },
  fischer: { name: 'Bobby Fischer', short: 'Fischer', country: { es: 'Estados Unidos', en: 'United States' } },
  karpov: { name: 'Anatoly Karpov', short: 'Karpov', country: { es: 'URSS / Rusia', en: 'Soviet Union / Russia' } },
  korchnoi: { name: 'Viktor Korchnoi', short: 'Korchnoi', country: { es: 'Apátrida / Suiza', en: 'Stateless / Switzerland' } },
  kasparov: { name: 'Garry Kasparov', short: 'Kasparov', country: { es: 'URSS / Rusia', en: 'Soviet Union / Russia' } },
  short: { name: 'Nigel Short', short: 'Short', country: { es: 'Inglaterra', en: 'England' } },
  timman: { name: 'Jan Timman', short: 'Timman', country: { es: 'Países Bajos', en: 'Netherlands' } },
  anand: { name: 'Viswanathan Anand', short: 'Anand', country: { es: 'India', en: 'India' } },
  kamsky: { name: 'Gata Kamsky', short: 'Kamsky', country: { es: 'Estados Unidos', en: 'United States' } },
  kramnik: { name: 'Vladimir Kramnik', short: 'Kramnik', country: { es: 'Rusia', en: 'Russia' } },
  leko: { name: 'Peter Leko', short: 'Leko', country: { es: 'Hungría', en: 'Hungary' } },
  topalov: { name: 'Veselin Topalov', short: 'Topalov', country: { es: 'Bulgaria', en: 'Bulgaria' } },
  gelfand: { name: 'Boris Gelfand', short: 'Gelfand', country: { es: 'Israel', en: 'Israel' } },
  carlsen: { name: 'Magnus Carlsen', short: 'Carlsen', country: { es: 'Noruega', en: 'Norway' } },
  karjakin: { name: 'Sergey Karjakin', short: 'Karjakin', country: { es: 'Rusia', en: 'Russia' } },
  caruana: { name: 'Fabiano Caruana', short: 'Caruana', country: { es: 'Estados Unidos', en: 'United States' } },
  nepomniachtchi: { name: 'Ian Nepomniachtchi', short: 'Nepomniachtchi', country: { es: 'Rusia', en: 'Russia' } },
  ding: { name: 'Ding Liren', short: 'Ding', country: { es: 'China', en: 'China' } },
  gukesh: { name: 'Gukesh Dommaraju', short: 'Gukesh', country: { es: 'India', en: 'India' } },
  sindarov: { name: 'Javokhir Sindarov', short: 'Sindarov', country: { es: 'Uzbekistán', en: 'Uzbekistan' } },
};

export type Era = 'classic' | 'fide' | 'split' | 'unified';
export type TitleLine = 'undisputed' | 'fide' | 'pca' | 'classical';
export type Kind = 'match' | 'tournament' | 'forfeit' | 'knockout' | 'upcoming';

export interface SeedMatch {
  slug: string;
  year: number;
  kind: Kind;
  era: Era;
  title: TitleLine;
  players: string[]; // champion first when there is one
  winner: string | null;
  pgn?: string; // file in data/pgn/raw or data/pgn/extra
  site: { es: string; en: string };
  wikipedia: string; // English Wikipedia article, verified by curators
  retainedOnTie?: boolean;
}

const wiki = (title: string) => `https://en.wikipedia.org/wiki/${title}`;
const m = (slug: string, players: string[], winner: string | null, site: [string, string], extra: Partial<SeedMatch> = {}): SeedMatch => {
  const year = Number(slug.slice(0, 4));
  const era: Era = year < 1948 ? 'classic' : year < 1993 ? 'fide' : year < 2006 ? 'split' : 'unified';
  return {
    slug, year, kind: 'match', era, title: 'undisputed', players, winner,
    pgn: `WorldChamp${year}.pgn`, site: { es: site[0], en: site[1] },
    wikipedia: wiki(`World_Chess_Championship_${year}`), ...extra,
  };
};

export const SEED: SeedMatch[] = [
  m('1886-steinitz-zukertort', ['steinitz', 'zukertort'], 'steinitz', ['Nueva York, San Luis y Nueva Orleans', 'New York, St. Louis and New Orleans']),
  m('1889-steinitz-chigorin', ['steinitz', 'chigorin'], 'steinitz', ['La Habana', 'Havana']),
  m('1890-steinitz-gunsberg', ['steinitz', 'gunsberg'], 'steinitz', ['Nueva York', 'New York']),
  m('1892-steinitz-chigorin', ['steinitz', 'chigorin'], 'steinitz', ['La Habana', 'Havana']),
  m('1894-lasker-steinitz', ['steinitz', 'lasker'], 'lasker', ['Nueva York, Filadelfia y Montreal', 'New York, Philadelphia and Montreal']),
  m('1896-lasker-steinitz', ['lasker', 'steinitz'], 'lasker', ['Moscú', 'Moscow'], { pgn: 'WorldChamp1896.pgn' }),
  m('1907-lasker-marshall', ['lasker', 'marshall'], 'lasker', ['Estados Unidos', 'United States']),
  m('1908-lasker-tarrasch', ['lasker', 'tarrasch'], 'lasker', ['Düsseldorf y Múnich', 'Düsseldorf and Munich']),
  m('1910-lasker-schlechter', ['lasker', 'schlechter'], 'lasker', ['Viena y Berlín', 'Vienna and Berlin'], { pgn: 'WorldChamp1910a.pgn', retainedOnTie: true, wikipedia: wiki('World_Chess_Championship_1910_(Lasker–Schlechter)') }),
  m('1910-lasker-janowski', ['lasker', 'janowski'], 'lasker', ['Berlín', 'Berlin'], { pgn: 'WorldChamp1910b.pgn', wikipedia: wiki('World_Chess_Championship_1910_(Lasker–Janowski)') }),
  m('1921-capablanca-lasker', ['lasker', 'capablanca'], 'capablanca', ['La Habana', 'Havana']),
  m('1927-alekhine-capablanca', ['capablanca', 'alekhine'], 'alekhine', ['Buenos Aires', 'Buenos Aires']),
  m('1929-alekhine-bogoljubov', ['alekhine', 'bogoljubov'], 'alekhine', ['Alemania y Países Bajos', 'Germany and the Netherlands']),
  m('1934-alekhine-bogoljubov', ['alekhine', 'bogoljubov'], 'alekhine', ['Alemania', 'Germany']),
  m('1935-euwe-alekhine', ['alekhine', 'euwe'], 'euwe', ['Países Bajos', 'Netherlands']),
  m('1937-alekhine-euwe', ['euwe', 'alekhine'], 'alekhine', ['Países Bajos', 'Netherlands']),
  m('1948-botvinnik-tournament', ['botvinnik'], 'botvinnik', ['La Haya y Moscú', 'The Hague and Moscow'], { kind: 'tournament', era: 'fide' }),
  m('1951-botvinnik-bronstein', ['botvinnik', 'bronstein'], 'botvinnik', ['Moscú', 'Moscow'], { retainedOnTie: true }),
  m('1954-botvinnik-smyslov', ['botvinnik', 'smyslov'], 'botvinnik', ['Moscú', 'Moscow'], { retainedOnTie: true }),
  m('1957-smyslov-botvinnik', ['botvinnik', 'smyslov'], 'smyslov', ['Moscú', 'Moscow']),
  m('1958-botvinnik-smyslov', ['smyslov', 'botvinnik'], 'botvinnik', ['Moscú', 'Moscow']),
  m('1960-tal-botvinnik', ['botvinnik', 'tal'], 'tal', ['Moscú', 'Moscow']),
  m('1961-botvinnik-tal', ['tal', 'botvinnik'], 'botvinnik', ['Moscú', 'Moscow']),
  m('1963-petrosian-botvinnik', ['botvinnik', 'petrosian'], 'petrosian', ['Moscú', 'Moscow']),
  m('1966-petrosian-spassky', ['petrosian', 'spassky'], 'petrosian', ['Moscú', 'Moscow']),
  m('1969-spassky-petrosian', ['petrosian', 'spassky'], 'spassky', ['Moscú', 'Moscow']),
  m('1972-fischer-spassky', ['spassky', 'fischer'], 'fischer', ['Reikiavik, Islandia', 'Reykjavík, Iceland']),
  { slug: '1975-karpov-forfeit', year: 1975, kind: 'forfeit', era: 'fide', title: 'undisputed', players: ['fischer', 'karpov'], winner: 'karpov', site: { es: 'Sin match', en: 'No match' }, wikipedia: wiki('World_Chess_Championship_1975') },
  m('1978-karpov-korchnoi', ['karpov', 'korchnoi'], 'karpov', ['Baguio, Filipinas', 'Baguio, Philippines']),
  m('1981-karpov-korchnoi', ['karpov', 'korchnoi'], 'karpov', ['Merano, Italia', 'Merano, Italy']),
  m('1984-karpov-kasparov', ['karpov', 'kasparov'], null, ['Moscú', 'Moscow']),
  m('1985-kasparov-karpov', ['karpov', 'kasparov'], 'kasparov', ['Moscú', 'Moscow']),
  m('1986-kasparov-karpov', ['kasparov', 'karpov'], 'kasparov', ['Londres y Leningrado', 'London and Leningrad']),
  m('1987-kasparov-karpov', ['kasparov', 'karpov'], 'kasparov', ['Sevilla, España', 'Seville, Spain'], { retainedOnTie: true }),
  m('1990-kasparov-karpov', ['kasparov', 'karpov'], 'kasparov', ['Nueva York y Lyon', 'New York and Lyon']),
  m('1993-kasparov-short', ['kasparov', 'short'], 'kasparov', ['Londres', 'London'], { title: 'pca', pgn: 'extra/Kasparov-Short-1993.pgn', wikipedia: wiki('World_Chess_Championship_1993') }),
  m('1993-karpov-timman', ['karpov', 'timman'], 'karpov', ['Países Bajos e Indonesia', 'Netherlands and Indonesia'], { title: 'fide', pgn: 'FideChamp1993.pgn', wikipedia: wiki('World_Chess_Championship_1993') }),
  m('1995-kasparov-anand', ['kasparov', 'anand'], 'kasparov', ['Nueva York', 'New York'], { title: 'pca', pgn: 'extra/Kasparov-Anand-1995.pgn', wikipedia: wiki('Classical_World_Chess_Championship_1995') }),
  m('1996-karpov-kamsky', ['karpov', 'kamsky'], 'karpov', ['Elistá, Rusia', 'Elista, Russia'], { title: 'fide', pgn: 'FideChamp1996.pgn', wikipedia: wiki('FIDE_World_Chess_Championship_1996') }),
  { slug: '1998-fide-knockout', year: 1998, kind: 'knockout', era: 'split', title: 'fide', players: ['karpov', 'anand'], winner: 'karpov', site: { es: 'Groninga y Lausana', en: 'Groningen and Lausanne' }, wikipedia: wiki('FIDE_World_Chess_Championship_1998') },
  m('2000-kramnik-kasparov', ['kasparov', 'kramnik'], 'kramnik', ['Londres', 'London'], { title: 'classical', wikipedia: wiki('Classical_World_Chess_Championship_2000') }),
  m('2004-kramnik-leko', ['kramnik', 'leko'], 'kramnik', ['Brissago, Suiza', 'Brissago, Switzerland'], { title: 'classical', retainedOnTie: true, wikipedia: wiki('Classical_World_Chess_Championship_2004') }),
  m('2005-topalov-tournament', ['topalov'], 'topalov', ['Potrero de los Funes, San Luis (Argentina)', 'Potrero de los Funes, San Luis (Argentina)'], { kind: 'tournament', title: 'fide', pgn: 'FideChamp2005.pgn', wikipedia: wiki('FIDE_World_Chess_Championship_2005') }),
  m('2006-kramnik-topalov', ['topalov', 'kramnik'], 'kramnik', ['Elistá, Rusia', 'Elista, Russia']),
  m('2007-anand-tournament', ['kramnik', 'anand'], 'anand', ['Ciudad de México', 'Mexico City'], { kind: 'tournament' }),
  m('2008-anand-kramnik', ['anand', 'kramnik'], 'anand', ['Bonn, Alemania', 'Bonn, Germany']),
  m('2010-anand-topalov', ['anand', 'topalov'], 'anand', ['Sofía, Bulgaria', 'Sofia, Bulgaria']),
  m('2012-anand-gelfand', ['anand', 'gelfand'], 'anand', ['Moscú', 'Moscow']),
  m('2013-carlsen-anand', ['anand', 'carlsen'], 'carlsen', ['Chennai, India', 'Chennai, India']),
  m('2014-carlsen-anand', ['carlsen', 'anand'], 'carlsen', ['Sochi, Rusia', 'Sochi, Russia']),
  m('2016-carlsen-karjakin', ['carlsen', 'karjakin'], 'carlsen', ['Nueva York', 'New York']),
  m('2018-carlsen-caruana', ['carlsen', 'caruana'], 'carlsen', ['Londres', 'London']),
  m('2021-carlsen-nepomniachtchi', ['carlsen', 'nepomniachtchi'], 'carlsen', ['Dubái', 'Dubai']),
  m('2023-ding-nepomniachtchi', ['nepomniachtchi', 'ding'], 'ding', ['Astaná, Kazajistán', 'Astana, Kazakhstan'], { pgn: 'extra/WorldChamp2023-full.pgn' }),
  m('2024-gukesh-ding', ['ding', 'gukesh'], 'gukesh', ['Singapur', 'Singapore']),
  { slug: '2026-gukesh-sindarov', year: 2026, kind: 'upcoming', era: 'unified', title: 'undisputed', players: ['gukesh', 'sindarov'], winner: null, site: { es: 'Cologny (Ginebra), Suiza', en: 'Cologny (Geneva), Switzerland' }, wikipedia: wiki('World_Chess_Championship_2026') },
];
