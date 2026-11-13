// Reading preferences shared by every island: theme, contrast, text size, spacing, board, notation, motion.
// Applied as attributes on <html> so CSS tokens do the rest; persisted per viewer.
// The inline script in BaseLayout applies the same keys before first paint to avoid a flash.
import type { Notation } from './format';

export const STORAGE_KEY = 'historical-chess.reading';
export const TEXT_SCALES = [0.875, 1, 1.125, 1.25, 1.375, 1.5] as const;

export interface Settings {
  mode: 'dark' | 'light' | 'system';
  contrast: 'normal' | 'high';
  scale: (typeof TEXT_SCALES)[number];
  spacing: 'normal' | 'wide';
  board: 'green' | 'blue';
  notation: Notation;
  motion: 'normal' | 'reduced';
}

export const DEFAULT_SETTINGS: Settings = {
  mode: 'dark', contrast: 'normal', scale: 1, spacing: 'normal', board: 'green', notation: 'figurine', motion: 'normal',
};

function load(): Settings {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') };
  } catch (error) {
    console.warn('Reading preferences unavailable, using defaults', error);
    return { ...DEFAULT_SETTINGS };
  }
}

export const settings = $state<Settings>(load());

function apply() {
  const root = document.documentElement;
  const dark = settings.mode === 'system' ? matchMedia('(prefers-color-scheme: dark)').matches : settings.mode === 'dark';
  root.dataset.mode = dark ? 'dark' : 'light';
  root.dataset.contrast = settings.contrast;
  root.dataset.board = settings.board;
  root.dataset.spacing = settings.spacing;
  root.dataset.motion = settings.motion;
  root.style.setProperty('--text-scale', String(settings.scale));
}

export function updateSettings(patch: Partial<Settings>) {
  Object.assign(settings, patch);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Could not save reading preferences', error);
  }
  apply();
}

export const reducedMotion = () =>
  settings.motion === 'reduced' || (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);

if (typeof window !== 'undefined') {
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => settings.mode === 'system' && apply());
}
