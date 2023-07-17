<script lang="ts">
  // Props
  export let cmid: string;
  export let slidesActiveIndex: number | null;

  // Imports
  import { fetchOne } from "@abcnews/terminus-fetch";
  import wrap from "await-to-js";
  import { match, P } from "ts-pattern";

  // Components
  import AudioIcon from "./ico/AudioIcon.svelte";

  // Refs
  let audioRef: HTMLAudioElement;

  // State
  let tapped = false;
  let playingOnSlideIndex: number | null = null;
  let showCaption: boolean = false;

  type Audio = {
    byLine: {
      plain: string;
    };
    duration: number;
    title: string;
    sourceSystem: string;
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

  const fetchAudio = async (cmid: string) => {
    const [error, result] = await wrap(
      fetchOne({ id: cmid || undefined, type: "audio" })
    );
    if (error) throw error;

    const audio: Audio = result as Audio;
    console.log(audio);
    const file = audio.media.audio.renditions.files[0];
    const byLine = audio?.byLine?.plain;
    const showCaption = audio?.sourceSystem === "showcaption";

    return {
      file: file,
      duration: audio.duration,
      title: audio.title,
      byLine: byLine,
      showCaption: showCaption
    };
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
        audioRef.addEventListener("canplay", () => {
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
  {#await fetchAudio(cmid)}
    <div class="fetching-audio-message">Fetching audio...</div>
  {:then audio}
    {#if !tapped}
      <button
        class="tap-to-play"
        on:click={handleClick}
        title={audio.byLine ? `${audio.title} by ${audio.byLine}` : `${audio.title}`}
        aria-label="Play Audio. Duration: {audio.duration} seconds"
      >
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

    {#if audio.showCaption}
      <div class="audio-title">
        <span>{audio.title}</span>{#if audio.byLine}<span class="audio-byline"
            >({audio.byLine})</span
          >{/if}
      </div>
    {/if}
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
    font-family: var(--dls-font-stack-sans, "abcsans");
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
    font-family: var(--dls-font-stack-sans, "abcsans");
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

  .audio-byline {
    padding-inline-start: 4px;
  }
</style>
