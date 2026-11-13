// Read helpers over the content collections. Pages call these instead of querying collections directly.
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import type { Lang } from '../i18n/ui';

export type Match = CollectionEntry<'matches'>;
export type MatchData = Match['data'];
export type Player = MatchData['players'][number];
export type Game = MatchData['games'][number];
export type Photo = CollectionEntry<'photos'>;

export async function getMatches() {
  const all = await getCollection('matches');
  return all.sort((a, b) => a.data.year - b.data.year || a.id.localeCompare(b.id));
}

export const playerOf = (match: MatchData, id: string | null | undefined) => match.players.find((p) => p.id === id);

export const matchUrl = (lang: Lang, slug: string) => `/${lang}/${slug}/`;
export const gameUrl = (lang: Lang, slug: string, round: number) => `/${lang}/${slug}/${round}/`;

const photoFiles = import.meta.glob<ImageMetadata>('/src/assets/photos/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' });

export function photoAsset(file: string): ImageMetadata {
  const asset = photoFiles[`/src/assets/photos/${file}`];
  if (!asset) throw new Error(`Photo file not found: src/assets/photos/${file}`);
  return asset;
}

export async function getPhotos(ids: { id: string }[]) {
  const entries = await Promise.all(ids.map((ref) => getEntry('photos', ref.id)));
  return entries.filter((p): p is Photo => Boolean(p));
}

/** Points per player for one game from that player's side: 1, 0.5 or 0. */
export function pointsFor(game: Game, playerId: string) {
  if (game.result === '1/2-1/2') return 0.5;
  const whiteWon = game.result === '1-0';
  return (game.white === playerId) === whiteWon ? 1 : 0;
}

export const isTiebreak = (game: Game) => game.kind === 'rapid' || game.kind === 'blitz' || game.kind === 'armageddon';
