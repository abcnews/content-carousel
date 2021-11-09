import { proxy } from '@abcnews/dev-proxy';
import { requestDOMPermit } from '@abcnews/env-utils';
import Carousel from './components/Carousel/Carousel.svelte';
import type { QuoteContent } from './components/Quote/types';

const createAppFromDecoy = (decoyEl: Element) => {
  const quotes: QuoteContent[] = [];

  Array.from(decoyEl.querySelectorAll('blockquote')).forEach((blockquoteEl: Element) => {
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

    quotes.push({
      kind: blockquoteEl.hasAttribute('data-component') ? 'blockquote' : 'pullquote',
      contentEls,
      attributionNodes
    });
  });

  decoyEl.innerHTML = '';

  new Carousel({
    target: decoyEl,
    props: {
      quotes
    }
  });
};

(async () => {
  await proxy('content-carousel');
  await requestDOMPermit('carousel');

  Array.from(document.querySelectorAll('[data-key="carousel"]')).forEach((decoyEl: Element) =>
    createAppFromDecoy(decoyEl)
  );
})();

if (process.env.NODE_ENV === 'development') {
  console.debug(`[Content Carousel] public path: ${__webpack_public_path__}`);
}
