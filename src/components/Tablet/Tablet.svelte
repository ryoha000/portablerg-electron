<script lang="ts">
  import { onMount } from 'svelte';
  import useWebRTC from '../../lib/webRTC'
  import useSetting, { controlStyles, ControlType, windowStyle } from './useSetting'
  import TabletControl from './TabletControl.svelte'
  import TabletSettingLayout from './TabletSettingLayout.svelte'
  import TabletSettingTemplate from './TabletSettingTemplate.svelte'
  import TabletSettingSort from './TabletSettingSort.svelte'
  import { get } from 'svelte/store';
  import Icon from '../UI/Icon.svelte'

  let remoteVideo: HTMLVideoElement
  let ws: WebSocket
  let isOpenToggleSetting = false
  let isOpenLayoutSetting = false
  let isOpenTemplateSetting = false
  let isOpenSortSetting = false
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
    // document.documentElement.requestFullscreen()
  })
  const stop = (e: MouseEvent) => {
    e.stopPropagation()
  }
  const openSetting = (type: 'layout' | 'template' | 'sort', e: MouseEvent) => {
    console.log('open')
    isOpenToggleSetting = false
    isOpenTemplateSetting = false
    isOpenLayoutSetting = false
    if (type === 'layout') {
      isOpenLayoutSetting = true
    }
    if (type === 'template') {
      isOpenTemplateSetting = true
    }
    if (type === 'sort') {
      isOpenSortSetting = true
    }
    stop(e)
  }
  const openToggleSetting = (e: MouseEvent) => {
    isOpenToggleSetting = true
    stop(e)
  }
  const closeSetting = () => {
    isOpenToggleSetting = false
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
    console.log(e)
    console.log(tmp)
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
    console.log(tmp[nowIndex + e.detail.num])
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
  .settingButton {
    padding: 16px;
    position: absolute;
    top: 1rem;
    right: 1rem;
    color: rgba(0, 0, 0, 0.2);
  }
  .settingContainer {
    background-color: white;
    position: absolute;
    top: 2rem;
    right: 2rem;
    z-index: 999999;
    border: rgba(0, 0, 0, 0.7) solid 1px;
  }
  .settingItem {
    border-bottom: rgba(0, 0, 0, 0.7) solid 1px;
    padding: 1rem;
  }
  .settingItem:last-of-type {
    border-bottom: 0;
  }
</style>


<div class="container" on:click="{closeSetting}">
  <div class="btnContainer">
    <button type="button" on:click="{connectHost}">Connect</button>
    <button type="button" on:click="{() => hangUp(remoteVideo)}">Hang Up</button>
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
  {#if isOpenSortSetting}
    <div class="setting" on:click="{stop}">
      <TabletSettingSort on:close="{closeSetting}" />
    </div>
  {/if}
  {#if ws && !isOpenLayoutSetting && !isOpenTemplateSetting && !isOpenToggleSetting}
    {#each $controlStyles as controlStyle}
      {#if controlStyle.id === id}
        <TabletControl {ws} {controlStyle} on:trans="{setID}" />
      {/if}
    {/each}
    <!-- svelte-ignore a11y-media-has-caption -->
    <video bind:this="{remoteVideo}" autoplay style="{$windowStyle}" class="window"></video>
  {/if}
  <div class="settingButton" on:click="{openToggleSetting}">
    <Icon name="cog" size="{48}" />
  </div>
  {#if isOpenToggleSetting}
    <div class="settingContainer">
      <div class="settingItem" on:click="{(e) => openSetting('layout', e)}">レイアウトの設定を開く</div>
      <div class="settingItem" on:click="{(e) => openSetting('template', e)}">コントロールのテンプレートを作る</div>
      <div class="settingItem" on:click="{(e) => openSetting('sort', e)}">コントロールのテンプレートを並び替える</div>
    </div>
  {/if}
</div>
