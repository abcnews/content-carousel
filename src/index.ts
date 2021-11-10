import { proxy } from '@abcnews/dev-proxy';
import { requestDOMPermit } from '@abcnews/env-utils';
import Carousel from './components/Carousel/Carousel.svelte';
import { parseSlides } from './utils';

const createAppFromDecoy = (decoyEl: Element) => {
  const slides = parseSlides(decoyEl);
  console.debug(slides);

  decoyEl.innerHTML = '';

  new Carousel({
    target: decoyEl,
    props: {
      slides
    }
  });
};

(async () => {
  await proxy('content-carousel');
  await requestDOMPermit('carousel');

  Array.from(document.querySelectorAll('[data-key="carousel"]')).forEach(decoyEl => createAppFromDecoy(decoyEl));
})();

if (process.env.NODE_ENV === 'development') {
  console.debug(`[Content Carousel] public path: ${__webpack_public_path__}`);
}
