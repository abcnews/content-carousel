import { proxy } from '@abcnews/dev-proxy';
import { requestDOMPermit } from '@abcnews/env-utils';
const { url2cmid } = require('@abcnews/url2cmid');

import Carousel from './components/Carousel/Carousel.svelte';
import { getTrackFn } from './behaviour';
import { parseSlides } from './utils';

const CMID = url2cmid(window.location.href);
const WYSIWYG_TEASER_ONLY_CHILD_SELECTOR = '[data-component="LegacyWysiwyg"]:first-child:last-child';

const createAppFromDecoy = (decoyEl: Element, index: number, _decoyEls: Element[]) => {
  // The #startcarousel and #endcarousel markers can either be wrapped around the bare content,
  // or a single embedded WYSIWYG teaser document that contains the content. Either way, we are
  // going to replace the entire decoy contents with the carousel.
  const contentRootEl = decoyEl.querySelector(WYSIWYG_TEASER_ONLY_CHILD_SELECTOR) || decoyEl;

  const slides = parseSlides(contentRootEl);

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
