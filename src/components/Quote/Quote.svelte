<script lang="ts">
  import { onMount } from 'svelte';

  export let kind: 'blockquote' | 'pullquote';
  export let contentEls: Element[];
  export let attributionNodes: Node[];

  let blockquoteEl: HTMLElement;
  let figcaptionEl: HTMLElement;

  onMount(() => {
    contentEls.forEach(contentEl => blockquoteEl.appendChild(contentEl));

    if (attributionNodes) {
      attributionNodes.forEach(attributionNode => figcaptionEl.appendChild(attributionNode));
    }

    return () => {
      contentEls.forEach(contentEl => blockquoteEl.removeChild(contentEl));

      if (attributionNodes) {
        attributionNodes.forEach(attributionNode => figcaptionEl.removeChild(attributionNode));
      }
    };
  });
</script>

<figure data-kind={kind}>
  <blockquote bind:this={blockquoteEl} />
  {#if attributionNodes}
    <figcaption bind:this={figcaptionEl} />
  {/if}
</figure>

<style>
  figure {
    margin: 0;
  }

  figure:first-child {
    margin-top: auto;
  }

  figure:last-child {
    margin-bottom: auto;
  }

  blockquote {
    margin: 0;
  }

  blockquote > :global(*) {
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
