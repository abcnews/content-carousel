<script context="module" lang="ts">
  import type { TrackFn } from '../../behaviour';

  type Position = {
    x: number;
    y: number;
  };

  type PositionDiff = Position & {
    dx: number;
    dy: number;
  };

  declare namespace svelte.JSX {
    interface HTMLAttributes<T> {
      swipestart?: (event: CustomEvent<Position> & { target: EventTarget & T }) => any;
      swipemove?: (event: CustomEvent<PositionDiff> & { target: EventTarget & T }) => any;
      swipeend?: (event: CustomEvent<Position> & { target: EventTarget & T }) => any;
      swipethreshold?: (event: CustomEvent<{ direction: -1 | 1 }> & { target: EventTarget & T }) => any;
    }
  }

  const SLIDES_GAP_PX = 8;
  const SLIDES_TRANSLATION_PX_S = 2500;
  const PRESENTATION_LAYER_SIDEBAR_ESTIMATED_WIDTH_PX = 300;
  const NOOP_TRACK_FN: TrackFn = (name: string, value: string) => {};
</script>

<script lang="ts">
  import { onMount, SvelteComponentTyped } from 'svelte';
  import { swipeable } from '../../actions/swipeable';
  import Image from '../Image/Image.svelte';
  import type { Slide } from './types';

  export let slides: Slide[] = [];
  export let track: TrackFn = NOOP_TRACK_FN;

  let id = `content-carousel-${Math.floor(Math.random() * 1e3)}`;
  let baseWidthPx: number = 0;
  let slidesActiveIndex: number = 0;
  let slidesActiveIndexOffsetPct: number = 0;
  let slidesSwipeOffsetPx = 0;
  let farthestIndexReached = 0;
  let buttonPrevEl: HTMLButtonElement;
  let buttonNextEl: HTMLButtonElement;
  let triedToClickHint = false;

  const goToIndex = (index: number) => {
    if (index > -1 && index < slides.length) {
      slidesActiveIndex = index;

      return true;
    }

    return false;
  };
  const goInDirection = (direction: number, interactionMethod: string) => {
    if (goToIndex(slidesActiveIndex + direction)) {
      track('directional-navigation', `${interactionMethod}-${direction === -1 ? 'prev' : 'next'}`);
    }
  };
  const handleButtonPrev = (event: KeyboardEvent | CustomEvent) =>
    goInDirection(-1, event.detail === 1 ? 'mouse' : 'keyboard');
  const handleButtonNext = (event: KeyboardEvent | CustomEvent) =>
    goInDirection(1, event.detail === 1 ? 'mouse' : 'keyboard');
  const handleButtonKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        handleButtonPrev(event);
        buttonPrevEl.focus();
        break;
      case 'ArrowRight':
        handleButtonNext(event);
        buttonNextEl.focus();
        break;
      default:
        break;
    }
  };
  const handleSlidesSwipeMove = (event: CustomEvent) => (slidesSwipeOffsetPx = event.detail.dx);
  const handleSlidesSwipeThreshold = (event: CustomEvent) => goInDirection(event.detail.direction * -1, 'swipe');
  const handleSlidesSwipeEnd = () => (slidesSwipeOffsetPx = 0);
  const handleHintClick = () => (triedToClickHint = true);

  $: farthestIndexReached = Math.max(slidesActiveIndex, farthestIndexReached);
  $: viewportBaseWidthDiffPx = (document.documentElement.clientWidth || window.innerWidth) - baseWidthPx;
  $: isInMultiColumnLayout = viewportBaseWidthDiffPx > PRESENTATION_LAYER_SIDEBAR_ESTIMATED_WIDTH_PX;
  $: slidesActiveIndexOffsetPct = (slidesActiveIndex + (slidesActiveIndex * SLIDES_GAP_PX) / baseWidthPx) * -100;
  $: doesActiveSlideStartWithImage =
    slides[slidesActiveIndex][0].component === (Image as unknown as SvelteComponentTyped);
  $: baseStyle = `
    --cc-base-width: ${baseWidthPx}px;
    --cc-slides-gap: ${SLIDES_GAP_PX}px;
    --cc-slides-translate-x: calc(${slidesActiveIndexOffsetPct}% + ${slidesSwipeOffsetPx}px);
    --cc-slides-transition-duration: ${slidesSwipeOffsetPx !== 0 ? 0 : baseWidthPx / SLIDES_TRANSLATION_PX_S}s;
    --cc-slide-padding-vertical: ${isInMultiColumnLayout ? 24 : 16}px;
    --cc-slide-padding-horizontal: ${isInMultiColumnLayout ? 32 : 20}px;
    --cc-hint-color: hsl(0deg 0% ${doesActiveSlideStartWithImage ? 90 : 80}%);
    --cc-hint-mix-blend-mode: ${doesActiveSlideStartWithImage ? 'luminocity' : 'initial'};
  `;

  onMount(() => {
    const listener = (event: Event) => {
      if (event.type === 'pagehide' || document.visibilityState === 'hidden') {
        stopListening();
        track('number-slides-seen', String(farthestIndexReached + 1));
        track('percentage-slides-seen', String(Math.round(((farthestIndexReached + 1) / slides.length) * 100)));
        track('tried-to-click-hint', triedToClickHint ? 'yes' : 'no');
      }
    };

    const stopListening = () => {
      document.removeEventListener('visibilitychange', listener);
      document.removeEventListener('pagehide', listener);
    };

    document.addEventListener('visibilitychange', listener);
    document.addEventListener('pagehide', listener);

    return () => {
      stopListening();
    };
  });
</script>

<div class="base" bind:clientWidth={baseWidthPx} style={baseStyle}>
  <section class="layout" role="region" aria-roledescription="carousel" aria-label="Slides">
    <div
      id={`${id}_slides`}
      class="slides"
      aria-live="polite"
      use:swipeable={{
        minDistancePx: isInMultiColumnLayout ? 2 : undefined
      }}
      on:swipemove={handleSlidesSwipeMove}
      on:swipeend={handleSlidesSwipeEnd}
      on:swipethreshold={handleSlidesSwipeThreshold}
    >
      {#each slides as slide, index}
        <div
          class="slide"
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${slides.length}`}
          class:is-active={slidesActiveIndex === index}
        >
          {#each slide as { component, props }}
            <svelte:component this={component} {...props} />
          {/each}
        </div>
      {/each}
    </div>
    <div class="controls">
      <button
        bind:this={buttonPrevEl}
        aria-controls={`${id}_slides`}
        aria-label="Previous slide"
        aria-disabled={slidesActiveIndex === 0}
        on:click={handleButtonPrev}
        on:keydown={handleButtonKeydown}
      >
        <svg role="presentation" viewBox="0 0 12 20">
          <path d="M10 1L2 10L10 19" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      </button>
      <div
        class="pips"
        class:crowded={slides.length > 10 && !isInMultiColumnLayout}
        class:chockers={slides.length > 15 && !isInMultiColumnLayout}
      >
        {#each slides as _, index}
          <div class="pip" class:current={slidesActiveIndex === index} />
        {/each}
      </div>
      <button
        bind:this={buttonNextEl}
        aria-controls={`${id}_slides`}
        aria-label="Next slide"
        aria-disabled={slidesActiveIndex === slides.length - 1}
        on:click={handleButtonNext}
        on:keydown={handleButtonKeydown}
      >
        <svg role="presentation" viewBox="0 0 12 20">
          <path d="M2 1L10 10L2 19" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      </button>
    </div>
  </section>
  <div class="hint" role="none" title={`This is a group of ${slides.length} slides`} on:click={handleHintClick}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 233.22 180.12">
      <rect fill="currentColor" x="53.14" y="32.76" width="96.09" height="96.09" />
      <polygon
        fill="currentColor"
        points="169.43 50.51 158.37 50.51 158.37 137.09 71.79 137.09 71.79 148.63 168.95 148.63 168.95 148.15 169.43 148.15 169.43 50.51"
      />
    </svg>
  </div>
</div>

<style>
  .base {
    --cc-controls-height: 40px;
    position: relative;
    box-sizing: border-box;
    margin-bottom: 1.5rem;
    background-color: var(--cc-theme-base-background-color, var(--tint-6));
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-user-drag: none;
  }

  .layout {
    overflow: hidden;
  }

  .slides {
    transform: translate3d(var(--cc-slides-translate-x), 0, 0);
    display: flex;
    gap: var(--cc-slides-gap);
    transition: transform var(--cc-slides-transition-duration) ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .slides {
      transition-duration: 0s;
    }
  }

  .slide {
    flex: 0 0 100%;
    margin: 0;
    padding: var(--cc-slide-padding-vertical) var(--cc-slide-padding-horizontal);
    min-height: 256px;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    overflow: hidden;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-user-drag: none;
    cursor: pointer;
  }

  .slide.is-active {
    cursor: grab;
  }

  .controls {
    position: relative;
    margin-top: calc(var(--cc-slide-padding-vertical) / -2);
    padding: 0 calc(var(--cc-slide-padding-horizontal) / 3 * 2) calc(var(--cc-slide-padding-vertical) / 2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--cc-theme-controls-color, var(--tint-1));
    font-size: 1rem;
    font-weight: bold;
  }

  .controls button {
    flex: 0 0 var(--cc-controls-height);
    display: block;
    padding: 0;
    border: 0;
    width: var(--cc-controls-height);
    height: var(--cc-controls-height);
    outline-offset: -2px;
    background-color: transparent;
    color: inherit;
  }

  .controls button[aria-disabled='false'] {
    cursor: pointer;
  }

  .controls button[aria-disabled='false']:focus {
    background-color: var(--cc-theme-control-focus-background-color, var(--tint-5));
  }

  .controls svg {
    width: 12px;
    height: 20px;
    vertical-align: bottom;
    transition: opacity var(--cc-slides-transition-duration) ease-out;
  }

  .controls button[aria-disabled='true'] svg {
    opacity: 0.2;
  }

  .pips {
    display: flex;
    gap: 9px;
  }

  .pips.crowded {
    gap: 6px;
  }

  .pips.chockers {
    gap: 3px;
  }

  .pip {
    color: inherit;
    border-radius: 50%;
    border: 1px solid currentColor;
    width: 8px;
    height: 8px;
    background-color: var(--cc-theme-base-background-color, var(--tint-6));
    transition: background-color var(--cc-slides-transition-duration) ease-out;
  }

  .pip.current {
    background-color: currentColor;
  }

  .hint {
    position: absolute;
    top: 2px;
    right: 0;
    color: var(--cc-hint-color);
    mix-blend-mode: var(--cc-hint-mix-blend-mode);
    transition: color var(--cc-slides-transition-duration) ease-out;
  }

  .hint svg {
    width: 40px;
    height: 40px;
  }
</style>
