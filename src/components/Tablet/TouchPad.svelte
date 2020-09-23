<script lang="ts">
  import { onMount } from 'svelte';
  import useWebRTC from '../../lib/webRTC'
  import useSetting, { controlStyles, windowStyle } from './useSetting'
  import TabletControl from './TabletControl.svelte'

  let remoteVideo: HTMLVideoElement
  let ws: WebSocket
  const {
    hangUp,
    setupWS,
    playVideo,
    connectHost,
  } = useWebRTC(async (s) => {
    await playVideo(remoteVideo, s)
  })
  const { init } = useSetting()
  onMount(() => {
    init()
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      ws = setupWS({ privateIP: location.hostname, browserPort: Number(location.port) })
    } else {
      ws = setupWS({ privateIP: location.hostname, browserPort: 2401 })
    }
  })
</script>

<style>
  .container {
    position: relative;
    user-select: none;
    width: 100%;
    height: 100%;
  }
  .window {
    z-index: -1;
  }
</style>


<div class="container">
  <div class="btnContainer">
    <button type="button" on:click="{connectHost}">Connect</button>
    <button type="button" on:click="{() => hangUp(remoteVideo)}">Hang Up</button>
  </div>
  {#if ws}
    {#each $controlStyles as controlStyle}
      <TabletControl {ws} {controlStyle} />
    {/each}
  {/if}
  <!-- svelte-ignore a11y-media-has-caption -->
  <video bind:this="{remoteVideo}" autoplay style="{$windowStyle}" class="window"></video>
</div>
