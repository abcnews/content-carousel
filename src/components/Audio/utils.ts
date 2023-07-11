import { SvelteComponentTyped } from 'svelte';
import Audio from './Audio.svelte';

function extractDigits(str: string | null) {
  if (str === null) return null;
  const match = str.match(/\d+$/);
  return match ? match[0] : null;
}

export const parse = (el: Element) => {
  return {
    component: Audio as unknown as SvelteComponentTyped,
    props: {
      cmid: extractDigits(el.getAttribute('data-uri'))
    }
  };
};
