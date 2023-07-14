<script lang="ts">
  // Props
  export let cmid: string | null;
  export let slidesActiveIndex: number | null;

  // Imports
  import { fetchOne } from '@abcnews/terminus-fetch';
  import wrap from 'await-to-js';
  import { match, P } from 'ts-pattern';

  // Components
  import AudioIcon from './ico/AudioIcon.svelte';

  // Refs
  let audioRef: HTMLAudioElement;

  // State
  let tapped = false;
  let playingOnSlideIndex: number | null = null;

  type Audio = {
    duration: number;
    title: string;
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

    return { file: file, duration: audio.duration, title: audio.title };
  };

  const handleClick = () => {
    // console.log(tapped)
    tapped = true;

    // tick();

    match(audioRef.readyState)
      .when(
        state => state >= 4,
        () => audioRef.play()
      )
      .otherwise(() => {
        audioRef.addEventListener('canplay', () => {
          audioRef.play();
        });
      });

    playingOnSlideIndex = slidesActiveIndex;
  };

  $: if (playingOnSlideIndex !== slidesActiveIndex) {
    tapped = false;
    audioRef?.pause();
  }
</script>

<div style="--audio-display: {tapped ? 'block' : 'none'}">
  <slot />
  {#await fetchAudio()}
    <div class="fetching-audio-message">Fetching audio...</div>
  {:then audio}
    {#if !tapped}
      <button class="tap-to-play" on:click={handleClick}>
        <span class="listen-icon">
          <AudioIcon />
        </span>
        <span class="duration-text">
          <span class="listen-text">Listen</span>
          {audio.duration}s
        </span>
      </button>
    {/if}

    <audio class="audio-element" controls bind:this={audioRef} preload="auto">
      <source src={audio.file.url} type={audio.file.MIMEType} />
      <!-- Fallback -->
      Download <a href={audio.file.url}>audio</a>.
    </audio>

    <div class="audio-title">{audio.title}</div>
  {:catch error}
    <div>{error.message}</div>
  {/await}
</div>

<style lang="scss">
  .audio-element {
    width: 100%;
    height: 3.25rem;
    background-color: #f2f2f2;
    border: 1px solid #ccc;
    padding: 10px;
    display: var(--audio-display, block);
  }

  .fetching-audio-message {
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
      background-color: #01cfff;
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

  .audio-title {
    color: var(--colour-aa, #aaa);
    margin-top: 0.8rem;
    letter-spacing: 0.03125rem;
    font-weight: var(--typography-font-weight, 400);
    line-height: 1.25rem;
    font-size: 0.75rem;
  }
</style>
