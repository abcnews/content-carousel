import { SvelteComponentTyped } from 'svelte';
import Image from './Image.svelte';

export const parse = (el: Element) => {
  const imgEl = el.querySelector('img') as HTMLImageElement;

  return {
    component: Image as unknown as SvelteComponentTyped,
    props: {
      alt: imgEl.getAttribute('alt'),
      src: imgEl.getAttribute('data-src') || imgEl.getAttribute('src')
    }
  };
};
