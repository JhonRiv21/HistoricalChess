// Read helpers and URLs for the memorial (src/content/champions).
import { getCollection, type CollectionEntry } from 'astro:content';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Lang } from '../i18n/ui';

export type Champion = CollectionEntry<'champions'>;
export type MemorialGame = Champion['data']['games'][number];

export async function getChampions() {
  return (await getCollection('champions')).sort((a, b) => a.data.order - b.data.order);
}

const base = (lang: Lang) => (lang === 'es' ? 'campeones' : 'champions');
export const championsUrl = (lang: Lang) => `/${lang}/${base(lang)}/`;
export const championUrl = (lang: Lang, id: string) => `/${lang}/${base(lang)}/${id}/`;
export const memorialGameUrl = (lang: Lang, id: string, gameId: string) => `/${lang}/${base(lang)}/${id}/${gameId}/`;
export const memorialAnalysisPath = (id: string, gameId: string) => `/data/memorial/${id}/${gameId}.json`;
export const hasMemorialAnalysis = (id: string, gameId: string) =>
  existsSync(join(process.cwd(), 'public', memorialAnalysisPath(id, gameId)));

export const resultText = (result: MemorialGame['result']) => result.replace('1/2-1/2', '½–½');

/** getStaticPaths helpers shared by the /es/campeones and /en/champions page files. */
export async function championPaths() {
  return (await getChampions()).map((champion) => ({ params: { id: champion.id }, props: { champion } }));
}

export async function memorialGamePaths() {
  return (await getChampions()).flatMap((champion) => champion.data.games
    .filter((game) => hasMemorialAnalysis(champion.id, game.id))
    .map((game) => ({ params: { id: champion.id, game: game.id }, props: { champion, game } })));
}
