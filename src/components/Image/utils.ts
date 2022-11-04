import { SvelteComponentTyped } from 'svelte';
import Image from './Image.svelte';

const EMPTY_NODE = document.createTextNode('');

const getText = (el: Element, selector: string) =>
  ((el.querySelector(selector) ?? EMPTY_NODE).textContent ?? '').trim();

export const parse = (el: Element) => {
  const imgEl = el.tagName === 'IMG' ? el : (el.querySelector('img') as HTMLImageElement);
  const caption = getText(el, 'figcaption');
  const cite = getText(el, 'figcaption cite');
  const byline = getText(el, 'figcaption cite :first-child');
  const title = caption.slice(0, caption.indexOf(cite));

  return {
    component: Image as unknown as SvelteComponentTyped,
    props: {
      alt: imgEl.getAttribute('alt'),
      byline,
      src: imgEl.getAttribute('data-src') || imgEl.getAttribute('src'),
      title
    }
  };
};
