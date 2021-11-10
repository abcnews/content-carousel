import { SvelteComponentTyped } from 'svelte';
import Quote from './Quote.svelte';

export const parse = (blockquoteEl: Element, isPullquote?: boolean) => {
  const contentEls = Array.from(blockquoteEl.children);
  let attributionNodes: Node[] | undefined = undefined;

  contentEls.forEach((contentEl: Element) => {
    blockquoteEl.removeChild(contentEl);
    contentEl.removeAttribute('class');
  });

  const lastContentEl = contentEls[contentEls.length - 1];

  if (contentEls.length > 1 && lastContentEl && lastContentEl.textContent && lastContentEl.textContent.length > 0) {
    const lastContentElFirstChildEl = lastContentEl.firstElementChild;

    if (
      lastContentElFirstChildEl &&
      ['EM', 'STRONG'].includes(lastContentElFirstChildEl.tagName) &&
      lastContentElFirstChildEl.textContent &&
      lastContentEl.textContent === lastContentElFirstChildEl.textContent
    ) {
      contentEls.pop();
      attributionNodes = Array.from(lastContentElFirstChildEl.childNodes);
    }
  }

  return {
    component: Quote as unknown as SvelteComponentTyped,
    props: {
      kind: isPullquote ? 'pullquote' : 'blockquote',
      contentEls,
      attributionNodes
    }
  };
};
