// Reading preferences (theme, contrast, text size, spacing, board, notation, motion).
// Applied as attributes on <html> so CSS tokens do the rest; persisted per viewer.
import { loadPreferences, savePreferences } from './preferences.js';

const KEY = 'historical-chess.reading';
export const TEXT_SCALES = [0.875, 1, 1.125, 1.25, 1.375, 1.5];
export const DEFAULT_SETTINGS = {
  mode: 'dark', // dark | light | system
  contrast: 'normal', // normal | high
  scale: 1,
  spacing: 'normal', // normal | wide
  board: 'green', // green | blue
  notation: 'figurine', // figurine | letters
  motion: 'normal', // normal | reduced
};

const root = document.documentElement;
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
const listeners = new Set();
let current = loadPreferences(KEY, DEFAULT_SETTINGS);

function resolvedMode(mode) {
  if (mode !== 'system') return mode;
  return systemDark.matches ? 'dark' : 'light';
}

function apply() {
  root.dataset.mode = resolvedMode(current.mode);
  root.dataset.contrast = current.contrast;
  root.dataset.board = current.board;
  root.dataset.spacing = current.spacing;
  root.dataset.motion = current.motion;
  root.style.setProperty('--text-scale', String(current.scale));
}

export const getSettings = () => current;

export function updateSettings(patch) {
  current = { ...current, ...patch };
  savePreferences(KEY, current);
  apply();
  listeners.forEach((fn) => fn(current, patch));
}

export function onSettingsChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

systemDark.addEventListener('change', () => { if (current.mode === 'system') apply(); });
apply();
