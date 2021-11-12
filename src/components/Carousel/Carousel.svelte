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

  const MAX_X_BLEED = 64;
  const SLIDE_GAP = 16;
  const TRANSLATION_PIXELS_PER_SECOND = 2500;
</script>

<script lang="ts">
  import { swipeable } from '../../actions/swipeable';
  import type { Slide } from './types';

  export let slides: Slide[] = [];

  let randomID = `content-carousel-${Math.floor(Math.random() * 1e3)}`;
  let baseWidth: number = 0;
  let xPct: number = 0;
  let activeIndex: number = 0;
  let swipeOffset = 0;
  let lastSwipeThresholdTime = 0;

  const goToIndex = (index: number) => {
    if (index > -1 && index < slides.length) {
      activeIndex = index;
    }
  };
  const goInDirection = (direction: number) => goToIndex(activeIndex + direction);
  const handleSlideNav = (index: number) => {
    if (Date.now() - lastSwipeThresholdTime > 500) {
      goToIndex(index);
    }
  };
  const handleSwipeMove = (event: CustomEvent) => (swipeOffset = event.detail.dx);
  const handleSwipeEnd = () => {
    swipeOffset = 0;
  };
  const handleSwipeThreshold = (event: CustomEvent) => {
    lastSwipeThresholdTime = Date.now();
    goInDirection(event.detail.direction * -1);
  };

  $: widthDiff = (document.documentElement.clientWidth || window.innerWidth) - baseWidth;
  $: isInMultiColumnLayout = widthDiff > 300; // rough width estimate of PL's sidebar + layout margin
  $: xBleed = baseWidth ? Math.floor(Math.max(0, Math.min(MAX_X_BLEED, widthDiff / 2))) : 0;
  $: maskGradientPct = (xBleed / (baseWidth + xBleed * 2)) * 100;
  $: xPct = (activeIndex + (activeIndex * SLIDE_GAP) / baseWidth) * -100;
  $: styleProps = `
    --cc-base-width: ${baseWidth}px;
    --cc-x-bleed: ${xBleed}px;
    --cc-mask-image: linear-gradient(
      to right,
      hsl(0deg 0% 0% / 0),
      hsl(0deg 0% 0% / 1) ${maskGradientPct.toFixed(2)}% ,
      hsl(0deg 0% 0% / 1) ${(100 - maskGradientPct).toFixed(2)}%,
      hsl(0deg 0% 0% / 0)
    );
    --cc-swipe-offset: ${swipeOffset}px;
    --cc-x-offset: calc(${xPct}% + var(--cc-swipe-offset));
    --cc-slide-gap: ${SLIDE_GAP}px;
    --cc-slide-padding: ${isInMultiColumnLayout ? 32 : 20}px;
    --cc-snap-duration: ${swipeOffset !== 0 ? 0 : baseWidth / TRANSLATION_PIXELS_PER_SECOND}s;
    --cc-controls-justify: ${isInMultiColumnLayout ? 'flex-end' : 'center'}; 
  `;
</script>

<div class="base" bind:clientWidth={baseWidth} style={styleProps}>
  {#if !Number.isNaN(xBleed)}
    <section class="layout" role="region" aria-roledescription="carousel" aria-label="Slides">
      <div
        id={`${randomID}_slides`}
        class="slides"
        aria-live="polite"
        use:swipeable={{
          minDistancePx: isInMultiColumnLayout ? 2 : undefined,
          thresholdDistancePx: Math.min(100, baseWidth / 4)
        }}
        on:swipemove={handleSwipeMove}
        on:swipeend={handleSwipeEnd}
        on:swipethreshold={handleSwipeThreshold}
      >
        {#each slides as slide, index}
          <div
            class="slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
            class:is-active={activeIndex === index}
            on:click={() => handleSlideNav(index)}
          >
            {#each slide as { component, props }}
              <svelte:component this={component} {...props} />
            {/each}
          </div>
        {/each}
      </div>
      <div class="controls">
        <button
          aria-controls={`${randomID}_slides`}
          aria-label="Previous slide"
          disabled={activeIndex === 0}
          on:click={() => goInDirection(-1)}
        >
          <svg role="presentation" viewBox="0 0 40 40">
            <polyline stroke="currentColor" stroke-width="2" fill="none" points="22.25 12.938 16 19.969 22.25 27" />
          </svg>
        </button>
        <div aria-hidden="true">{`${activeIndex + 1} / ${slides.length}`}</div>
        <button
          aria-controls={`${randomID}_slides`}
          aria-label="Next slide"
          disabled={activeIndex === slides.length - 1}
          on:click={() => goInDirection(1)}
        >
          <svg role="presentation" viewBox="0 0 40 40">
            <polyline stroke="currentColor" stroke-width="2" fill="none" points="22.25 12.938 16 19.969 22.25 27" />
          </svg>
        </button>
      </div>
    </section>
  {/if}
</div>

<style>
  .base {
    --cc-controls-height: 40px;
    position: relative;
    box-sizing: border-box;
    margin-bottom: 1.5rem;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-user-drag: none;
  }

  .layout {
    width: calc(100% + var(--cc-x-bleed) * 2);
    padding: 0 var(--cc-x-bleed);
    margin: 0 calc(var(--cc-x-bleed) * -1);
    overflow: hidden;
    -webkit-mask-image: var(--cc-mask-image);
    mask-image: var(--cc-mask-image);
  }

  .slides {
    transform: translate3d(var(--cc-x-offset), 0, 0);
    display: flex;
    gap: var(--cc-slide-gap);
    transition: transform var(--cc-snap-duration) ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .slides {
      transition-duration: 0s;
    }
  }

  .slide {
    flex: 0 0 100%;
    margin: 0;
    padding: var(--cc-slide-padding);
    min-height: 256px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: var(--cc-theme-slide-bg, var(--tint-6));
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

  .slide > :global(*):not(:last-child) {
    margin-bottom: 1.5rem;
  }

  .controls {
    margin-top: 4px;
    display: flex;
    gap: 8px;
    justify-content: var(--cc-controls-justify);
    align-items: center;
    color: var(--cc-theme-controls-fg);
    font-size: 1rem;
    font-weight: bold;
  }

  .controls div {
    min-width: 3rem;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02rem;
    text-align: center;
  }

  .controls button {
    display: block;
    padding: 0;
    border: 0;
    outline-offset: -2px;
    border-radius: 3px;
    background-color: transparent;
    color: inherit;
  }

  .controls button[disabled] {
    opacity: 0.2;
  }

  .controls button:not([disabled]):focus,
  .controls button:not([disabled]):hover {
    color: var(--cc-theme-controls-fg-focus);
    background-color: var(--cc-theme-controls-bg-focus, var(--tint-5));
    cursor: pointer;
  }

  .controls svg {
    width: var(--cc-controls-height);
    height: var(--cc-controls-height);
    vertical-align: bottom;
  }

  .controls :last-child > svg {
    transform: scaleX(-1);
  }
</style>
