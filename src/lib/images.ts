// Optimized image URLs for Svelte islands, which cannot use Astro's <Image> component.
import { getImage } from 'astro:assets';
import { photoAsset, type Photo } from './content';
import { pick, type Lang } from '../i18n/ui';

export async function responsive(file: string, widths: number[]) {
  const asset = photoAsset(file);
  const usable = widths.filter((w) => w <= asset.width);
  const sizes = usable.length ? usable : [asset.width];
  const images = await Promise.all(sizes.map((width) => getImage({ src: asset, width, format: 'webp' })));
  return {
    src: images.at(-1)!.src,
    srcset: images.map((img, i) => `${img.src} ${sizes[i]}w`).join(', '),
  };
}

export const credit = (photo: Photo) => `${photo.data.author}${photo.data.year ? `, ${photo.data.year}` : ''}. ${photo.data.license}`;

export async function galleryPhoto(photo: Photo, lang: Lang) {
  const full = await getImage({ src: photoAsset(photo.data.file), width: 1400, format: 'webp' });
  return {
    id: photo.id,
    thumb: await responsive(photo.data.file, [320, 520, 800]),
    full: full.src,
    alt: pick(photo.data.alt, lang),
    caption: pick(photo.data.caption, lang),
    credit: credit(photo),
    sourceUrl: photo.data.sourceUrl,
    focus: photo.data.focus,
  };
}
