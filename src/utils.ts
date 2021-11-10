import { SvelteComponentTyped } from 'svelte';
import { ComponentConfig, Slide } from './components/Carousel/types';
import Quote from './components/Quote/Quote.svelte';
import Simple from './components/Simple/Simple.svelte';

const CHUNKING_SELECTOR = '[data-mount][id^="-"]';

const getChunks = (el: Element) => {
  const children = Array.from(el.children);

  if (el.querySelector(CHUNKING_SELECTOR) === null) {
    return children.map(el => [el]);
  }

  const chunks: Element[][] = [];
  let chunk: Element[] = [];

  const commit = (isLast?: boolean) => {
    if (chunk.length) {
      chunks.push(chunk);
    }

    if (!isLast) {
      chunk = [];
    }
  };

  children.forEach((el: Element) => (el.matches(CHUNKING_SELECTOR) ? commit() : chunk.push(el)));
  commit(true);

  return chunks;
};

export const parseSlides = (el: Element) => {
  const slides: Slide[] = [];

  getChunks(el).forEach(chunk => {
    console.log(chunk);
    const slide: Slide = [];

    chunk.forEach(el => {
      let config: ComponentConfig | null;

      if (el.hasAttribute('data-component')) {
        switch (el.getAttribute('data-component')) {
          case 'Blockquote':
            config = parseQuote(el);
            break;
          case 'Pullquote':
            config = parseQuote(el.querySelector('blockquote') as Element, true);
            break;
          default:
            config = null;
            break;
        }
      } else {
        config = {
          component: Simple as unknown as SvelteComponentTyped,
          props: {
            contentEl: el
          }
        };
      }

      console.log(config);

      if (config) {
        slide.push(config);
      }
    });

    if (slide.length) {
      slides.push(slide);
    }
  });

  return slides;
};

const parseQuote = (blockquoteEl: Element, isPullquote?: boolean) => {
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
