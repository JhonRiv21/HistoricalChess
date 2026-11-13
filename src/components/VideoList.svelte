<script lang="ts">
  // YouTube videos behind a click-to-load poster: the player (and its cookies) loads only when the reader presses play.
  import { t, type Lang } from '../i18n/ui';

  export interface VideoItem { youtubeId: string; title: string; channel: string; kindLabel: string; language: string }
  let { lang, videos }: { lang: Lang; videos: VideoItem[] } = $props();
  let playing: Record<string, boolean> = $state({});
</script>

<p class="video-notice">{t(lang, 'video.notice')}</p>
<ul class="video-list">
  {#each videos as video (video.youtubeId)}
    <li class="video-card">
      <div class="video-frame">
        {#if playing[video.youtubeId]}
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
        {:else}
          <button type="button" class="video-poster" aria-label={`${t(lang, 'video.play')}: ${video.title}`} onclick={() => (playing[video.youtubeId] = true)}>
            <img src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
            <span class="video-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" /></svg></span>
          </button>
        {/if}
      </div>
      <strong>{video.title}</strong>
      <span class="video-meta"><span class="video-kind">{video.kindLabel}</span> · {video.channel}{video.language !== lang ? ` · ${video.language.toUpperCase()}` : ''}</span>
    </li>
  {/each}
</ul>
