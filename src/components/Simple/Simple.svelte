<script lang="ts">
  import { onMount } from 'svelte';

  export let contentEl: Element;

  let baseEl: HTMLElement;

  onMount(() => {
    baseEl.appendChild(contentEl);

    return () => baseEl.removeChild(contentEl);
  });
</script>

<div bind:this={baseEl} />

<style>
  div,
  div > :global(*) {
    margin: 0;
  }
</style>
