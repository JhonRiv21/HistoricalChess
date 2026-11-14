// Cookieless analytics (Umami). Every call is a no-op when the script is not loaded: local development,
// a missing PUBLIC_UMAMI_WEBSITE_ID, blockers, or readers with Do Not Track on.
type EventData = Record<string, string | number | boolean>;

declare global {
  interface Window { umami?: { track: (event: string, data?: EventData) => void } }
}

export function track(event: string, data?: EventData) {
  if (typeof window === 'undefined' || !window.umami) return;
  try {
    window.umami.track(event, data);
  } catch (error) {
    console.warn('Analytics event not sent', event, error);
  }
}
