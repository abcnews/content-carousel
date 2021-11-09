<script context="module" lang="ts">
  const MAX_X_BLEED = 64;
  const SLIDE_GAP = 16;
</script>

<script lang="ts">
  import Quote from '../Quote/Quote.svelte';
  import type { QuoteContent } from '../Quote/types';

  export let quotes: QuoteContent[] = [];

  let randomID = `content-carousel-${Math.floor(Math.random() * 1e3)}`;
  let baseWidth: number = 0;
  let xPct: number = 0;
  let activeIndex: number = 0;

  const goToIndex = (index: number) => (activeIndex = index);

  $: widthDiff = (document.documentElement.clientWidth || window.innerWidth) - baseWidth;
  $: isInMultiColumnLayout = widthDiff > 300; // rough width estimate of PL's sidebar + layout margin
  $: xBleed = baseWidth ? Math.floor(Math.max(0, Math.min(MAX_X_BLEED, widthDiff / 2))) : 0;
  $: maskGradientPct = (xBleed / (baseWidth + xBleed * 2)) * 100;
  $: xPct = (activeIndex + (activeIndex * SLIDE_GAP) / baseWidth) * -100;
  $: styleProps = `
    --qc-base-width: ${baseWidth}px;
    --qc-x-bleed: ${xBleed}px;
    --qc-mask-image: linear-gradient(
      to right,
      hsl(0deg 0% 0% / 0),
      hsl(0deg 0% 0% / 1) ${maskGradientPct.toFixed(2)}% ,
      hsl(0deg 0% 0% / 1) ${(100 - maskGradientPct).toFixed(2)}%,
      hsl(0deg 0% 0% / 0)
    );
    --qc-x-offset: ${xPct}%;
    --qc-slide-gap: ${SLIDE_GAP}px;
    --qc-snap-duration: ${isInMultiColumnLayout ? 0.25 : 0.125}s;
    --qc-controls-justify: ${isInMultiColumnLayout ? 'flex-end' : 'center'}; 
  `;
</script>

<div class="base" bind:clientWidth={baseWidth} style={styleProps}>
  {#if !Number.isNaN(xBleed)}
    <section class="layout" role="region" aria-roledescription="carousel" aria-label="Slides">
      <div id={`${randomID}_slides`} class="slides" aria-live="polite">
        {#each quotes as quote, index}
          <div
            class="slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${quotes.length}`}
            class:is-active={activeIndex === index}
            on:click={() => goToIndex(index)}
          >
            <Quote {quote} />
          </div>
        {/each}
      </div>
      <div class="controls">
        <button
          aria-controls={`${randomID}_slides`}
          aria-label="Previous slide"
          disabled={activeIndex === 0}
          on:click={() => goToIndex(activeIndex - 1)}
        >
          <svg role="presentation" viewBox="0 0 40 40">
            <polyline stroke="currentColor" stroke-width="2" fill="none" points="22.25 12.938 16 19.969 22.25 27" />
          </svg>
        </button>
        <div aria-hidden="true">{`${activeIndex + 1} / ${quotes.length}`}</div>
        <button
          aria-controls={`${randomID}_slides`}
          aria-label="Next slide"
          disabled={activeIndex === quotes.length - 1}
          on:click={() => goToIndex(activeIndex + 1)}
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
    width: calc(100% + var(--qc-x-bleed) * 2);
    padding: 0 var(--qc-x-bleed);
    margin: 0 calc(var(--qc-x-bleed) * -1);
    overflow: hidden;
    -webkit-mask-image: var(--qc-mask-image);
    mask-image: var(--qc-mask-image);
  }

  .slides {
    transform: translate3d(var(--qc-x-offset), 0, 0);
    display: flex;
    gap: var(--qc-slide-gap);
    transition: transform var(--qc-snap-duration) ease-out;
  }

  .slide {
    flex: 0 0 100%;
    min-height: 256px;
    border-radius: 8px;
    background-color: var(--qc-theme-slide-bg, var(--tint-6));
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
    cursor: revert;
  }

  .controls {
    position: absolute;
    bottom: 0;
    width: 100%;
    display: flex;
    gap: 8px;
    justify-content: var(--qc-controls-justify);
    align-items: center;
    color: var(--qc-theme-controls-fg);
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
    color: var(--qc-theme-controls-fg-focus);
    background-color: var(--qc-theme-controls-bg-focus, var(--tint-5));
    cursor: pointer;
  }

  .controls svg {
    width: 40px;
    height: 40px;
    vertical-align: bottom;
  }

  .controls :last-child > svg {
    transform: scaleX(-1);
  }
</style>
