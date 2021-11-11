<script lang="ts">
  export let alt: string;
  export let src: string;

  $: [, width] = src.match(/width=(\d+)/) || [];
  $: [, height] = src.match(/height=(\d+)/) || [];
  $: styleProps = `
    --cc-image-aspect-ratio: ${width} / ${height};
  `;
</script>

<figure style={styleProps}>
  <img {alt} {src} loading="lazy" />
</figure>

<style>
  figure {
    margin-left: calc(var(--cc-slide-padding) * -1);
    margin-left: calc(var(--cc-slide-padding) * -1);
    width: calc(100% + var(--cc-slide-padding) * 2);
  }

  figure:first-child {
    margin-top: calc(var(--cc-slide-padding) * -1);
    margin-bottom: auto;
  }

  img {
    width: 100%;
    vertical-align: bottom;
    aspect-ratio: var(--cc-image-aspect-ratio);
    -webkit-user-drag: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }
</style>
