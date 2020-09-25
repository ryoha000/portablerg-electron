<script lang="ts">
  import { onMount } from 'svelte';
  import useWebRTC from '../../lib/webRTC'
  import useSetting, { controlStyles, ControlType, windowStyle } from './useSetting'
  import TabletControl from './TabletControl.svelte'
  import TabletSettingLayout from './TabletSettingLayout.svelte'
  import TabletSettingTemplate from './TabletSettingTemplate.svelte'
  import { get } from 'svelte/store';

  let remoteVideo: HTMLVideoElement
  let ws: WebSocket
  let isOpenLayoutSetting = false
  let isOpenTemplateSetting = false
  let id = 0

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
  const openSetting = (type: 'layout' | 'template') => {
    isOpenTemplateSetting = false
    isOpenLayoutSetting = false
    if (type === 'layout') {
      isOpenLayoutSetting = true
    }
    if (type === 'template') {
      isOpenTemplateSetting = true
    }
  }
  const closeSetting = () => {
    isOpenTemplateSetting = false
    isOpenLayoutSetting = false
  }
  const setID = async (e: CustomEvent<{ num: 1 | -1}>) => {
    const tmp: {
      id: number
      controls: {
        type: ControlType
        style: string
      }[]
    }[] = get(controlStyles)
    const nowIndex = tmp.findIndex(v => v.id === id)
    if (nowIndex === -1) {
      if (tmp.length === 0) {
        alert('コントロールが登録されていません')
        return
      }
      id = tmp[0].id
      return
    }
    // 右端の時
    if (nowIndex + 1 === tmp.length) {
      if (e.detail.num === 1) {
        id = tmp[0].id
        return
      }
    }
    // 左端の時
    if (nowIndex === 0) {
      if (e.detail.num === -1) {
        id = tmp[tmp.length - 1].id
        return
      }
    }
    id = tmp[nowIndex + e.detail.num].id
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
    <button type="button" on:click="{() => openSetting('layout')}">open layout setting</button>
    <button type="button" on:click="{() => openSetting('template')}">open template setting</button>
  </div>
  {#if isOpenLayoutSetting}
    <div class="setting" on:click="{stop}">
      <TabletSettingLayout on:close="{closeSetting}" />
    </div>
  {/if}
  {#if isOpenTemplateSetting}
    <div class="setting" on:click="{stop}">
      <TabletSettingTemplate on:close="{closeSetting}" />
    </div>
  {/if}
  {#if ws && !isOpenLayoutSetting && !isOpenTemplateSetting}
    {#each $controlStyles as controlStyle}
      {#if controlStyle.id === id}
        <TabletControl {ws} {controlStyle} on:trans="{setID}" />
      {/if}
    {/each}
    <!-- svelte-ignore a11y-media-has-caption -->
    <video bind:this="{remoteVideo}" autoplay style="{$windowStyle}" class="window"></video>
  {/if}
</div>
