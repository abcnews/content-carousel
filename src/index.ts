import { proxy } from '@abcnews/dev-proxy';
import { requestDOMPermit } from '@abcnews/env-utils';
import QuoteCarousel from './components/QuoteCarousel/QuoteCarousel.svelte';
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

  new QuoteCarousel({
    target: decoyEl,
    props: {
      quotes
    }
  });
};

(async () => {
  await proxy('quote-carousel');
  await requestDOMPermit('quotecarousel');

  Array.from(document.querySelectorAll('[data-key="quotecarousel"]')).forEach((decoyEl: Element) =>
    createAppFromDecoy(decoyEl)
  );
})();

if (process.env.NODE_ENV === 'development') {
  console.debug(`[Quote Carousel] public path: ${__webpack_public_path__}`);
}
