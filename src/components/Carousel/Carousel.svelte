<script context="module" lang="ts">
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
  const PIPS_GAP_PX = 9;
  const PIP_SIZE_PX = 8;
</script>

<script lang="ts">
  import type { SvelteComponentTyped } from 'svelte';
  import { swipeable } from '../../actions/swipeable';
  import Image from '../Image/Image.svelte';
  import type { Slide } from './types';

  export let slides: Slide[] = [];

  let id = `content-carousel-${Math.floor(Math.random() * 1e3)}`;
  let baseWidthPx: number = 0;
  let slidesActiveIndex: number = 0;
  let slidesActiveIndexOffsetPct: number = 0;
  let slidesSwipeOffsetPx = 0;

  const goToIndex = (index: number) => {
    if (index > -1 && index < slides.length) {
      slidesActiveIndex = index;
    }
  };
  const goInDirection = (direction: number) => goToIndex(slidesActiveIndex + direction);
  const handleSlidesSwipeMove = (event: CustomEvent) => (slidesSwipeOffsetPx = event.detail.dx);
  const handleSlidesSwipeThreshold = (event: CustomEvent) => goInDirection(event.detail.direction * -1);
  const handleSlidesSwipeEnd = () => (slidesSwipeOffsetPx = 0);

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
    --cc-hint-color: hsl(0deg 0% ${doesActiveSlideStartWithImage ? 90 : 75}%);
    --cc-hint-mix-blend-mode: ${doesActiveSlideStartWithImage ? 'luminocity' : 'initial'};
  `;
</script>

<div class="base" bind:clientWidth={baseWidthPx} style={baseStyle}>
  <section class="layout" role="region" aria-roledescription="carousel" aria-label="Slides">
    <div
      id={`${id}_slides`}
      class="slides"
      aria-live="polite"
      use:swipeable={{
        minDistancePx: isInMultiColumnLayout ? 2 : undefined,
        thresholdDistancePx: Math.min(150, baseWidthPx / 2)
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
        aria-controls={`${id}_slides`}
        aria-label="Previous slide"
        aria-disabled={slidesActiveIndex === 0}
        on:click={() => goInDirection(-1)}
      >
        <svg role="presentation" viewBox="0 0 12 20">
          <path d="M10 1L2 10L10 19" fill="none" stroke="currentColor" stroke-width={slidesActiveIndex === 0 ? 2 : 3} />
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
        aria-controls={`${id}_slides`}
        aria-label="Next slide"
        aria-disabled={slidesActiveIndex === slides.length - 1}
        on:click={() => goInDirection(1)}
      >
        <svg role="presentation" viewBox="0 0 12 20">
          <path
            d="M2 1L10 10L2 19"
            fill="none"
            stroke="currentColor"
            stroke-width={slidesActiveIndex === slides.length - 1 ? 2 : 3}
          />
        </svg>
      </button>
    </div>
  </section>
  <div class="hint" role="none" title={`This is a group of ${slides.length} slides`}>
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
    pointer-events: none;
  }

  @media (pointer: fine) {
    .controls button {
      pointer-events: revert;
      cursor: pointer;
    }
  }

  .controls button[aria-disabled='false']:focus {
    background-color: var(--cc-theme-control-focus-background-color, var(--tint-5));
  }

  .controls svg {
    opacity: 0;
    width: 12px;
    height: 20px;
    vertical-align: bottom;
  }

  .controls button[aria-disabled='true']:focus svg {
    opacity: 0.25;
  }

  @media (pointer: fine) {
    .controls button[aria-disabled='true'] svg {
      opacity: 0.25;
    }
  }

  .controls button[aria-disabled='false']:focus svg {
    opacity: 1;
  }

  @media (pointer: fine) {
    .controls button[aria-disabled='false'] svg {
      opacity: 1;
    }
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
    border: 1.5px solid currentColor;
    width: 8px;
    height: 8px;
    background-color: transparent;
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
