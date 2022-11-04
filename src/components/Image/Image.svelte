<script lang="ts">
  export let alt: string;
  export let byline: string;
  export let src: string;
  export let title: string;

  $: [, width] = src.match(/cropW=(\d+)/) || [];
  $: [, height] = src.match(/cropH=(\d+)/) || [];
  $: styleProps = `
    --cc-image-aspect-ratio: ${width} / ${height};
  `;
  $: caption = `${title}${byline ? ` (${byline})` : ''}`;
</script>

<figure style={styleProps}>
  <img {alt} {src} title={caption} loading="lazy" />
  <figcaption>{caption}</figcaption>
</figure>

<style>
  figure {
    position: relative;
    margin: 0 calc(var(--cc-slide-padding-horizontal) * -1);
  }

  figure:first-child {
    margin-top: calc(var(--cc-slide-padding-vertical) * -1);
  }

  img {
    width: 100%;
    vertical-align: bottom;
    aspect-ratio: var(--cc-image-aspect-ratio, 16 / 9);
    object-fit: cover;
    -webkit-user-drag: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }

  figcaption {
    display: none;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 8px 12px;
    background-color: var(--cc-theme-caption-bg, var(--tint-4));
    font-size: 0.75em;
    line-height: 1.5;
  }

  /* figure:hover figcaption {
    display: revert;
  } */
</style>
