<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import useSetting, { windowStyle, controlsStyle } from './useSetting'
  import useLayout, { LayoutType } from './useLayout'

  let container: HTMLElement
  let windowElement: HTMLElement
  let controlsElement: HTMLElement
  let button: HTMLElement

  const { update } = useSetting()
  onMount(() => {
    const { init, setupHandler, setButton } = useLayout(container)
    init()
    setupHandler(windowElement, LayoutType.window)
    setupHandler(controlsElement, LayoutType.control)
    setButton(button, confirm)
  })
  const dispatch = createEventDispatcher();
  const confirm = async () => {
    console.log('confirm layout')
    await update()
    dispatch('close');
  }
</script>

<style>
  .container {
    position: relative;
    user-select: none;
    width: 100%;
    height: 100%;
    background-color: white;
    z-index: 5;
    display: flex;
    justify-content: center;
  }
  .window {
    z-index: 6;
    background-color: rgba(0, 0, 0, 0.5);
  }
  .controls {
    z-index: 7;
    background-color: rgba(255, 0, 0, 0.5);
  }
  .center {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
  }
  .confirm {
    margin-top: auto;
    margin-bottom: 8rem;
    z-index: 999999;
    width: 8rem;
    height: 2rem;
    line-height: 2rem;
    border-radius: 1rem;
    border: black solid 1px;
    text-align: center;
    font-size: 1.8rem;
  }
</style>

<div class="container" bind:this="{container}">
  <div style="{$windowStyle}" class="window center" bind:this="{windowElement}"><span>Window</span></div>
  <div style="{$controlsStyle}" class="controls center" bind:this="{controlsElement}"><span>コントロール</span></div>
  <div class="confirm" on:click="{confirm}" bind:this="{button}">確定</div>
</div>
