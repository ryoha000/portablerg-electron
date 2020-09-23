<script lang="ts">
  import { onMount } from 'svelte';
  import useWebRTC from '../../lib/webRTC'
  import useSetting, { controlStyles, windowStyle } from './useSetting'
  import TabletControl from './TabletControl.svelte'
  import TabletSettingLayout from './TabletSettingLayout.svelte'

  let remoteVideo: HTMLVideoElement
  let ws: WebSocket
  let isOpenLayoutSetting = false
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
  const stop = (e: MouseEvent) => {
    e.stopPropagation()
  }
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
  .setting {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    position: absolute;
    z-index: 5;
  }
  .btnContainer {
    display: flex;
    position: absolute;
    z-index: 5;
  }
</style>


<div class="container">
  <div class="btnContainer">
    <button type="button" on:click="{connectHost}">Connect</button>
    <button type="button" on:click="{() => hangUp(remoteVideo)}">Hang Up</button>
    <button type="button" on:click="{() => isOpenLayoutSetting = !isOpenLayoutSetting}">open layout setting</button>
  </div>
  {#if isOpenLayoutSetting}
    <div class="setting" on:click="{stop}">
      <TabletSettingLayout />
    </div>
  {/if}
  {#if ws && !isOpenLayoutSetting}
    {#each $controlStyles as controlStyle}
      <TabletControl {ws} {controlStyle} />
    {/each}
    <!-- svelte-ignore a11y-media-has-caption -->
    <video bind:this="{remoteVideo}" autoplay style="{$windowStyle}" class="window"></video>
  {/if}
</div>
