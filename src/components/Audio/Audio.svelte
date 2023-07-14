<script lang="ts">
  // Props
  export let cmid: string | null;

  // Imports
  import { fetchOne } from '@abcnews/terminus-fetch';
  import wrap from 'await-to-js';

  // Components
  import AudioIcon from './ico/AudioIcon.svelte';

  // State
  let tapped = false;

  type Audio = {
    duration: number;
    media: {
      audio: {
        renditions: {
          files: {
            MIMEType: string;
            url: string;
          }[];
        };
      };
    };
  };

  const fetchAudio = async () => {
    const [error, result] = await wrap(fetchOne({ id: cmid || undefined, type: 'audio' }));
    if (error) throw error;

    const audio: Audio = result as Audio;
    const file = audio.media.audio.renditions.files[0];

    return { file: file, duration: audio.duration };
  };
</script>

{#await fetchAudio()}
  <div>Fetching audio...</div>
{:then audio}
  {#if !tapped}
    <button class="tap-to-play" on:click={() => (tapped = true)}>
      <span class="listen-icon">
        <AudioIcon />
      </span>
      <span class="duration-text">
        <span class="listen-text">Listen</span>
        {audio.duration}s
      </span>
    </button>
  {:else}
    <audio controls>
      <source src={audio.file.url} type={audio.file.MIMEType} />
      <!-- Fallback -->
      Download <a href={audio.file.url}>audio</a>.
    </audio>
  {/if}
{:catch error}
  <div>{error.message}</div>
{/await}

<style lang="scss">
  audio {
    width: 100%;
    height: 54px;
    background-color: #f2f2f2;
    border: 1px solid #ccc;
    padding: 10px;
    -webkit-overflow-scrolling: touch;
  }

  .tap-to-play {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0;
    background-color: black;
    color: white;
    border: none;
    height: 3.25rem;
    font-family: var(--dls-font-stack-sans, 'abcsans');
    font-weight: var(--typography-font-weight, bold);
    letter-spacing: 2px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
      background-color: #2bd6e3;
      color: black;

      .listen-icon {
        filter: invert(1);
      }
    }

    .listen-icon {
      transition: all 0.2s ease-in-out;
      margin-inline-start: 16px;
    }

    .duration-text {
      flex: 1;
    }

    .listen-text {
      text-transform: uppercase;
      margin-right: 15px;
    }
  }
</style>
