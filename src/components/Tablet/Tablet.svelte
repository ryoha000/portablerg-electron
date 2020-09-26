<script lang="ts">
  import { onMount } from 'svelte';
  import useWebRTC from '../../lib/webRTC'
  import useSetting, { controlStyles, windowStyle } from './useSetting'
  import TabletControl from './TabletControl.svelte'
  import { store } from '../../store';
  import TabletSetting from './TabletSetting.svelte'
  import { getNextID } from './useControl'

  let remoteVideo: HTMLMediaElement
  let ws: WebSocket
  let isOpenToggleSetting = false
  let id = 0

  const {
    hangUp,
    setupWS,
    connectHost,
  } = useWebRTC()
  const { init } = useSetting()
  onMount(async () => {
    store.remoteVideoElement.set(remoteVideo)
    await init()
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      ws = setupWS({ privateIP: location.hostname, browserPort: Number(location.port) })
    } else {
      ws = setupWS({ privateIP: location.hostname, browserPort: 2401 })
    }
    // document.documentElement.requestFullscreen()
  })
  const closeSetting = () => {
    isOpenToggleSetting = false
  }
  const setID = async (e: CustomEvent<{ num: 1 | -1}>) => {
    const next = getNextID(id, e.detail.num)
    if (next) {
      id = next
    }
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
  .btnContainer {
    display: flex;
    position: absolute;
    z-index: 5;
  }
</style>

<div class="container" on:click="{closeSetting}">
  <div class="btnContainer">
    <button type="button" on:click="{connectHost}">Connect</button>
    <button type="button" on:click="{() => hangUp(remoteVideo)}">Hang Up</button>
  </div>
  {#if ws}
  <!-- {#if ws && !isOpenToggleSetting} -->
    {#each $controlStyles as controlStyle}
      {#if controlStyle.id === id}
        <TabletControl {ws} {controlStyle} on:trans="{setID}" />
      {/if}
    {/each}
    <!-- svelte-ignore a11y-media-has-caption -->
    <video bind:this="{remoteVideo}" autoplay style="{$windowStyle}" class="window"></video>
  {/if}
  <TabletSetting />
</div>
