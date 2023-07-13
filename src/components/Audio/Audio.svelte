<script lang="ts">
  export let cmid: string | null;

  import { fetchOne } from '@abcnews/terminus-fetch';

  type Audio = {
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
    const audio: Audio = (await fetchOne({ id: cmid || undefined, type: 'audio' })) as Audio;
    console.log(audio);
    const file = audio.media.audio.renditions.files[0];
    return file;
  };
</script>

{#await fetchAudio()}
  <div />
{:then file}
  <audio controls>
    <source src={file.url} type={file.MIMEType} />
    Download <a href={file.url}>audio</a>.
  </audio>
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
</style>
