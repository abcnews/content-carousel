import { SvelteComponentTyped } from 'svelte';
import Audio from './Audio.svelte';


// Returns the last digits in a string, or null if there are none.
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
