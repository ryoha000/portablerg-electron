<script lang="ts">
  import { onMount } from 'svelte';
  import useWebRTC from '../../lib/webRTC'
  import useSetting, { controlStyles, ControlType, windowStyle } from './useSetting'
  import TabletControl from './TabletControl.svelte'
  import { get } from 'svelte/store';
  import Icon from '../UI/Icon.svelte'
  import { store } from '../../store';
  // @ts-ignore
  import { link } from 'svelte-spa-router'

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
  const stop = (e: MouseEvent) => {
    e.stopPropagation()
  }
  const openSetting = (e: MouseEvent) => {
    console.log('open')
    isOpenToggleSetting = false
    stop(e)
  }
  const openToggleSetting = (e: MouseEvent) => {
    isOpenToggleSetting = true
    stop(e)
  }
  const closeSetting = () => {
    isOpenToggleSetting = false
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
    display: flex;
    flex-direction: column;
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
  {#if ws && !isOpenToggleSetting}
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
      <a href="/client/setting/layout" class="settingItem" use:link>レイアウトの設定を開く</a>
      <a href="/client/setting/template" class="settingItem" use:link>コントロールのテンプレートを作る</a>
      <a href="/client/setting/sort" class="settingItem" use:link>コントロールのテンプレートを並び替える</a>
    </div>
  {/if}
</div>
