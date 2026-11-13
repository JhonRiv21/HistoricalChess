// Per-viewer storage. It can be unavailable (private mode, blocked storage), so every access is guarded.
export function loadPreferences(key, defaults) {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(key) ?? '{}') };
  } catch (error) {
    console.warn('Preferences unavailable, using defaults', error);
    return { ...defaults };
  }
}

export function savePreferences(key, prefs) {
  try {
    localStorage.setItem(key, JSON.stringify(prefs));
  } catch (error) {
    console.warn('Could not save preferences', error);
  }
}
