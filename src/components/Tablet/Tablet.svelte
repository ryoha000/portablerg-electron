<script lang="ts">
  import { onMount } from 'svelte';
  import useWebRTC from '../../lib/webRTC'
  import TouchPad from './TouchPad.svelte'

  let remoteVideo: HTMLVideoElement
  let ws: WebSocket
  const {
    hangUp,
    setupWS,
    playVideo,
    sendMouseMove,
    connectHost,
  } = useWebRTC(async (s) => {
    await playVideo(remoteVideo, s)
  })
  onMount(() => {
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      ws = setupWS({ privateIP: location.hostname, browserPort: Number(location.port) })
    } else {
      ws = setupWS({ privateIP: location.hostname, browserPort: 2401 })
    }
  })
</script>

<style>
  .window {
    width: 10%;
    height: 10%;
    border: 1px solid black;
  }
</style>

<div>

  {#if ws}
    <TouchPad {ws} />
  {/if}
  <!-- svelte-ignore a11y-media-has-caption -->
  <div>
    <button type="button" on:click="{connectHost}">Connect</button>
    <button type="button" on:click="{hangUp}">Hang Up</button>
    <button type="button" on:click="{() => sendMouseMove({x: 0, y: -99})}">send data by data channel</button>
    <div>
      <video class="window" bind:this="{remoteVideo}" autoplay></video>
    </div>
  </div>
</div>
