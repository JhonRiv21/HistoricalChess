// Page change for the Astro router: the old page fades out, the new one fades in rising a few pixels.
// Keyframes live in base.css; reduced motion turns them off there.
import type { TransitionDirectionalAnimations } from 'astro';

const out = { name: 'hc-page-out', duration: '140ms', easing: 'ease-in', fillMode: 'both' };
const enter = { name: 'hc-page-in', duration: '260ms', delay: '40ms', easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', fillMode: 'both' };

export const pageTransition: TransitionDirectionalAnimations = {
  forwards: { old: out, new: enter },
  backwards: { old: out, new: enter },
};
