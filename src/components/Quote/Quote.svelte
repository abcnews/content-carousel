<script lang="ts">
  import { onMount } from 'svelte';
  import type { QuoteContent } from './types';

  export let quote: QuoteContent;

  let blockquoteEl: HTMLElement;
  let figcaptionEl: HTMLElement;

  onMount(() => {
    quote.contentEls.forEach(contentEl => blockquoteEl.appendChild(contentEl));

    if (quote.attributionNodes) {
      quote.attributionNodes.forEach(attributionNode => figcaptionEl.appendChild(attributionNode));
    }

    return () => {
      quote.contentEls.forEach(contentEl => blockquoteEl.removeChild(contentEl));

      if (quote.attributionNodes) {
        quote.attributionNodes.forEach(attributionNode => figcaptionEl.removeChild(attributionNode));
      }
    };
  });
</script>

<figure data-kind={quote.kind}>
  <blockquote bind:this={blockquoteEl} />
  {#if quote.attributionNodes}
    <figcaption bind:this={figcaptionEl} />
  {/if}
</figure>

<style>
  figure {
    height: 100%;
    padding: 64px 24px;
    margin: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  blockquote {
    margin: 0;
  }

  figure blockquote > :global(*) {
    line-height: 1.5;
  }

  figure[data-kind='blockquote'] blockquote > :global(*) {
    font-size: 1rem;
  }

  figure[data-kind='pullquote'] blockquote > :global(*) {
    font-size: 1.25rem;
    text-align: center;
  }

  blockquote > :global(:first-child) {
    margin-top: 0;
  }

  blockquote > :global(:last-child) {
    margin-bottom: 0;
  }

  figcaption {
    margin: 16px 0 0;
    padding: 0;
    font-weight: bold;
    font-style: italic;
  }

  figure[data-kind='blockquote'] figcaption {
    font-size: 0.875rem;
  }

  figure[data-kind='pullquote'] figcaption {
    text-align: center;
  }
</style>
