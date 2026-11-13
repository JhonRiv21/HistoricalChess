<script lang="ts">
  // Photo grid with a lightbox that always shows author and license.
  import { t, type Lang } from '../i18n/ui';

  export interface GalleryPhoto {
    id: string;
    thumb: { src: string; srcset: string };
    full: string;
    alt: string;
    caption: string;
    credit: string;
    sourceUrl: string;
    focus: string;
  }
  let { lang, photos, note }: { lang: Lang; photos: GalleryPhoto[]; note?: string } = $props();

  let dialog: HTMLDialogElement;
  let open: GalleryPhoto | null = $state(null);

  function show(photo: GalleryPhoto) {
    open = photo;
    dialog.showModal();
  }
</script>

<div class="gallery">
  {#if note}<p class="gallery-note">{note}</p>{/if}
  <ul class="gallery-grid">
    {#each photos as photo (photo.id)}
      <li class="gallery-item">
        <button type="button" class="gallery-open" aria-label={`${t(lang, 'gallery.open')}: ${photo.caption}`} onclick={() => show(photo)}>
          <img src={photo.thumb.src} srcset={photo.thumb.srcset} sizes="(max-width: 600px) 90vw, 260px" alt={photo.alt} style={`object-position:${photo.focus}`} loading="lazy" decoding="async" />
        </button>
        <p class="gallery-caption">{photo.caption}</p>
      </li>
    {/each}
  </ul>
  <dialog bind:this={dialog} class="lightbox" aria-label={open?.caption} onclick={(event) => event.target === dialog && dialog.close()}>
    <button type="button" class="icon-btn lightbox-close" aria-label={t(lang, 'gallery.close')} onclick={() => dialog.close()}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
    {#if open}
      <img class="lightbox-img" src={open.full} alt={open.alt} />
      <p class="lightbox-caption">{open.caption}</p>
      <p class="lightbox-credit">{open.credit} · <a href={open.sourceUrl} target="_blank" rel="noopener">Wikimedia Commons</a></p>
    {/if}
  </dialog>
</div>
