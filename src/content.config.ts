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

export const collections = { matches, photos };
