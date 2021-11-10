import { ComponentConfig, Slide } from './components/Carousel/types';
import { parse as parseSimple } from './components/Simple/utils';
import { parse as parseQuote } from './components/Quote/utils';

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

export const parseSlides = (el: Element) =>
  getChunks(el).reduce<Slide[]>((slides, chunk) => {
    const slide: Slide = [];

    chunk.forEach(el => {
      let config: ComponentConfig | null;

      if (!el.hasAttribute('data-component')) {
        if (el.textContent && el.textContent.trim().length > 0) {
          config = parseSimple(el);
        } else {
          config = null;
        }
      } else {
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
      }

      if (config) {
        slide.push(config);
      }
    });

    if (slide.length) {
      slides.push(slide);
    }

    return slides;
  }, []);
