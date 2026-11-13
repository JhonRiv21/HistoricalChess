// Merges curated media lists (data/curation/*-by-match.json) into src/content/matches/<slug>.json.
// Photos: ids that exist in src/content/photos. Videos: entries already checked against YouTube oEmbed.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const read = <T>(path: string, fallback: T): T => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : fallback);

const photosByMatch = read<Record<string, string[]>>(join(ROOT, 'data/curation/photos-by-match.json'), {});
const videosByMatch = read<Record<string, Record<string, unknown>[]>>(join(ROOT, 'data/curation/videos-by-match.json'), {});
const slugs = new Set([...Object.keys(photosByMatch), ...Object.keys(videosByMatch)]);

for (const slug of slugs) {
  const path = join(ROOT, 'src/content/matches', `${slug}.json`);
  if (!existsSync(path)) {
    console.warn(`! unknown match ${slug}`);
    continue;
  }
  const doc = JSON.parse(readFileSync(path, 'utf8'));
  const photos = (photosByMatch[slug] ?? []).filter((id) => {
    const ok = existsSync(join(ROOT, 'src/content/photos', `${id}.json`));
    if (!ok) console.warn(`! ${slug}: photo ${id} has no entry`);
    return ok;
  });
  if (photos.length) doc.photos = [...new Set(photos)];
  const videos = videosByMatch[slug];
  if (videos?.length) doc.videos = videos;
  writeFileSync(path, `${JSON.stringify(doc, null, 2)}\n`);
  console.log(`${slug}: ${doc.photos.length} photos, ${doc.videos.length} videos`);
}
