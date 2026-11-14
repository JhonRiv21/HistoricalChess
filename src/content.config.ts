// Content contract for the whole site. Scripts and curators write JSON that must satisfy these schemas;
// `astro check` / `astro build` fail on any violation.
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const localized = z.object({ es: z.string().min(1), en: z.string().min(1) });
const source = z.object({ label: z.string(), url: z.url() });

const player = z.object({
  id: z.string(), // stable slug, e.g. "fischer"
  name: z.string(), // full name as commonly written in English
  short: z.string(), // surname used in scores
  country: localized,
  role: z.enum(['champion', 'challenger', 'contender']),
});

const game = z.object({
  round: z.number().int().positive(),
  kind: z.enum(['classical', 'rapid', 'blitz', 'armageddon', 'forfeit']),
  white: z.string(), // player id
  black: z.string(),
  result: z.enum(['1-0', '0-1', '1/2-1/2']),
  date: z.iso.date().optional(),
  eco: z.string().optional(),
  plies: z.number().int().nonnegative(),
  pgnRef: z.string().optional(), // "<file>#<index>" in data/pgn, for traceability
  note: localized.optional(),
});

const moment = z.object({
  id: z.string(),
  title: localized,
  text: localized,
  round: z.number().int().positive().optional(),
  ply: z.number().int().nonnegative().optional(),
  photo: z.string().optional(), // photo id
});

const video = z.object({
  youtubeId: z.string().regex(/^[\w-]{11}$/),
  kind: z.enum(['archival', 'recap', 'documentary']),
  title: localized,
  channel: z.string(),
  round: z.number().int().positive().optional(),
  language: z.string().length(2).default('en'),
  checkedAt: z.iso.date(),
});

const matches = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/matches' }),
  schema: z.object({
    year: z.number().int(),
    kind: z.enum(['match', 'tournament', 'forfeit', 'knockout', 'upcoming']),
    era: z.enum(['classic', 'fide', 'split', 'unified']),
    title: z.enum(['undisputed', 'fide', 'pca', 'classical']),
    players: z.array(player).min(1),
    winner: z.string().nullable(), // player id; null = no winner (1984) or not played yet
    score: z.record(z.string(), z.number()).optional(), // classical score per player id
    tiebreak: z.record(z.string(), z.number()).optional(),
    retainedOnTie: z.boolean().optional(),
    site: localized,
    dates: z.object({ start: z.iso.date().optional(), end: z.iso.date().optional() }),
    summary: localized,
    note: localized.optional(),
    games: z.array(game),
    featuredRounds: z.array(z.number().int()).default([]),
    moments: z.array(moment).default([]),
    facts: z.array(z.object({ text: localized, source })).default([]),
    photos: z.array(reference('photos')).default([]),
    videos: z.array(video).default([]),
    sources: z.array(source).min(1),
  }),
});

const photos = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/photos' }),
  schema: z.object({
    file: z.string(), // file name inside src/assets/photos
    caption: localized,
    alt: localized,
    author: z.string(),
    license: z.enum(['CC0', 'Public domain', 'CC BY 2.0', 'CC BY 3.0', 'CC BY 4.0', 'CC BY-SA 2.0', 'CC BY-SA 3.0', 'CC BY-SA 3.0 NL', 'CC BY-SA 4.0']),
    sourceUrl: z.url(), // Commons file page
    year: z.number().int().optional(),
    focus: z.string().default('50% 35%'), // CSS object-position for crops
    people: z.array(z.string()).default([]), // player ids
  }),
});

// Memorial: each lineal world champion and the best games of their career, inside or outside title matches.
const memorialGame = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), // e.g. "byrne-fischer-1956"
  title: localized, // the name the game is known by, e.g. "La partida del siglo"
  white: z.string(), // full names as commonly written
  black: z.string(),
  event: localized,
  site: localized,
  date: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/), // year, year-month or full date
  result: z.enum(['1-0', '0-1', '1/2-1/2']),
  eco: z.string().optional(),
  plies: z.number().int().positive(),
  pgnRef: z.string(), // "memorial/<champion>.pgn#<index>" in data/pgn
  story: localized, // 2–4 sentences: why this game is remembered
  keyPly: z.number().int().positive().optional(), // half-move of the famous moment, 1 = white's first move
  keyMove: z.string().optional(), // SAN of that move, checked against the PGN
  sources: z.array(source).min(1),
});

const champions = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/champions' }),
  schema: z.object({
    order: z.number().int().positive(), // 1 = Steinitz, the first champion
    name: z.string(),
    short: z.string(),
    country: localized,
    born: z.string().regex(/^\d{4}(-\d{2}-\d{2})?$/),
    died: z.string().regex(/^\d{4}(-\d{2}-\d{2})?$/).optional(),
    reign: localized, // e.g. "1972–1975"
    matches: z.array(z.string()), // match slugs where they won or defended the title
    photo: reference('photos'),
    bio: localized, // 3–5 plain sentences
    style: localized, // one sentence on how they played
    games: z.array(memorialGame).min(3).max(6),
    sources: z.array(source).min(1),
  }),
});

export const collections = { matches, photos, champions };
