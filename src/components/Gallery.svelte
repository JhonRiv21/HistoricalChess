<script lang="ts">
  // Photo grid with a lightbox that always shows author and license. The lightbox keeps a fixed image
  // stage, so its height never jumps between photos, and shows a loader until each image arrives.
  import { track } from '../lib/analytics';
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
  let index: number | null = $state(null);
  let loading = $state(false);
  const current = $derived(index == null ? null : photos[index]!);

  function show(i: number) {
    const next = (i + photos.length) % photos.length;
    if (next === index) return;
    loading = true;
    index = next;
    if (!dialog.open) { dialog.showModal(); track('photo_open', { photo: photos[next]!.id }); }
  }

  function onkeydown(event: KeyboardEvent) {
    if (index == null || photos.length < 2) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
  }

  const copy = {
    es: { prev: 'Foto anterior', next: 'Foto siguiente', loading: 'Cargando la foto…', of: 'de' },
    en: { prev: 'Previous photo', next: 'Next photo', loading: 'Loading the photo…', of: 'of' },
  }[lang];
</script>

<div class="gallery">
  {#if note}<p class="gallery-note">{note}</p>{/if}
  <ul class="gallery-grid">
    {#each photos as photo, i (photo.id)}
      <li class="gallery-item">
        <button type="button" class="gallery-open" aria-label={`${t(lang, 'gallery.open')}: ${photo.caption}`} onclick={() => show(i)}>
          <img src={photo.thumb.src} srcset={photo.thumb.srcset} sizes="(max-width: 600px) 90vw, 260px" alt={photo.alt} style={`object-position:${photo.focus}`} loading="lazy" decoding="async" />
        </button>
        <p class="gallery-caption">{photo.caption}</p>
      </li>
    {/each}
  </ul>

  <dialog
    bind:this={dialog}
    class="lightbox"
    aria-label={current?.caption}
    {onkeydown}
    onclose={() => (index = null)}
    onclick={(event) => event.target === dialog && dialog.close()}
  >
    <div class="lightbox-bar">
      {#if photos.length > 1 && index != null}<span class="lightbox-count">{index + 1} {copy.of} {photos.length}</span>{/if}
      <button type="button" class="icon-btn" aria-label={t(lang, 'gallery.close')} onclick={() => dialog.close()}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
    <div class="lightbox-stage" aria-busy={loading}>
      {#if current}
        {#key current.id}
          <img
            class="lightbox-img"
            class:is-loaded={!loading}
            src={current.full}
            alt={current.alt}
            onload={() => (loading = false)}
            onerror={() => (loading = false)}
          />
        {/key}
      {/if}
      {#if loading}<span class="lightbox-loader" role="status"><span class="visually-hidden">{copy.loading}</span></span>{/if}
      {#if photos.length > 1}
        <button type="button" class="icon-btn lightbox-nav is-prev" aria-label={copy.prev} onclick={() => index != null && show(index - 1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-7 6 7 6" /></svg>
        </button>
        <button type="button" class="icon-btn lightbox-nav is-next" aria-label={copy.next} onclick={() => index != null && show(index + 1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l7 6-7 6" /></svg>
        </button>
      {/if}
    </div>
    {#if current}
      <div class="lightbox-text">
        <p class="lightbox-caption">{current.caption}</p>
        <p class="lightbox-credit">{current.credit} · <a href={current.sourceUrl} target="_blank" rel="noopener">Wikimedia Commons</a></p>
      </div>
    {/if}
  </dialog>
</div>
