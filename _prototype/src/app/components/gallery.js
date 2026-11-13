// Photo gallery with a lightbox that always shows author and license.
import { h } from '../lib/dom.js';
import { PHOTOS } from '../../content/photos.js';

export const credit = (photo) => `${photo.author}, ${photo.year}. ${photo.license}`;

export function photoImg(id, extra = {}) {
  const photo = PHOTOS[id];
  return h('img', { src: photo.src, alt: photo.caption, style: `object-position:${photo.focus}`, loading: 'lazy', decoding: 'async', ...extra });
}

export function createGallery(ids, note) {
  const image = h('img', { class: 'lightbox-img', alt: '' });
  const caption = h('p', { class: 'lightbox-caption' });
  const meta = h('p', { class: 'lightbox-credit' });
  const close = h('button', { type: 'button', class: 'icon-btn lightbox-close', 'aria-label': 'Cerrar foto' });
  close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const dialog = h('dialog', { class: 'lightbox', 'aria-label': 'Foto ampliada' }, close, image, caption, meta);
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

  const open = (id) => {
    const photo = PHOTOS[id];
    image.src = photo.src;
    image.alt = photo.caption;
    caption.textContent = photo.caption;
    meta.textContent = credit(photo);
    dialog.showModal();
  };

  const items = ids.map((id, i) => h('li', { class: `gallery-item g-${i}` },
    h('button', { type: 'button', class: 'gallery-open', 'aria-label': `Ampliar: ${PHOTOS[id].caption}`, onClick: () => open(id) }, photoImg(id)),
    h('p', { class: 'gallery-caption', text: PHOTOS[id].caption })));

  return h('div', { class: 'gallery' }, note ? h('p', { class: 'gallery-note', text: note }) : null, h('ul', { class: 'gallery-grid' }, items), dialog);
}
