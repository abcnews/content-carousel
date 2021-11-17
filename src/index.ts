import { proxy } from '@abcnews/dev-proxy';
import { requestDOMPermit } from '@abcnews/env-utils';
const { url2cmid } = require('@abcnews/url2cmid');

import Carousel from './components/Carousel/Carousel.svelte';
import { getTrackFn } from './behaviour';
import { parseSlides } from './utils';

const CMID = url2cmid(window.location.href);

const createAppFromDecoy = (decoyEl: Element, index: number, _decoyEls: Element[]) => {
  const slides = parseSlides(decoyEl);

  decoyEl.innerHTML = '';

  new Carousel({
    target: decoyEl,
    props: {
      slides,
      track: getTrackFn(`${CMID || 'UNKNOWN'}__${index + 1}`)
    }
  });
};

(async () => {
  await proxy('content-carousel');
  await requestDOMPermit('carousel');

  Array.from(document.querySelectorAll('[data-key="carousel"]')).forEach(createAppFromDecoy);
})();

if (process.env.NODE_ENV === 'development') {
  console.debug(`[Content Carousel] public path: ${__webpack_public_path__}`);
}
