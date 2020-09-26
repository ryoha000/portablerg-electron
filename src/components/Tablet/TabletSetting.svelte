<script>
  import { link } from 'svelte-spa-router'
  import Icon from '../UI/Icon.svelte'

  let isOpenToggleSetting = false
  const stop = (e) => {
    e.stopPropagation()
  }
  const openToggleSetting = (e) => {
    isOpenToggleSetting = true
    stop(e)
  }
  const closeToggleSetting = (e) => {
    isOpenToggleSetting = false
    stop(e)
  }
</script>

<style>
  .layer {
    width: 100%;
    height: 100%;
    position: absolute;
  }
  .settingButton {
    padding: 16px;
    position: absolute;
    top: 1rem;
    right: 1rem;
    color: rgba(0, 0, 0, 0.2);
    cursor: pointer;
    z-index: 200;
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

<div class="settingButton" on:click="{openToggleSetting}">
  <Icon name="cog" size="{48}" />
</div>
{#if isOpenToggleSetting}
  <div class="layer" on:click="{closeToggleSetting}"></div>
  <div class="settingContainer" on:click="{stop}">
    <a href="/client/setting/layout" class="settingItem" use:link>レイアウトの設定を開く</a>
    <a href="/client/setting/template" class="settingItem" use:link>コントロールのテンプレートを作る</a>
    <a href="/client/setting/sort" class="settingItem" use:link>コントロールのテンプレートを並び替える</a>
  </div>
{/if}
