<script lang="ts">
  import { onMount } from 'svelte';
  import useSetting, { windowStyle, controlsStyle, getStyleFromRect, ControlType } from './useSetting'
  import useTemplate, { controls } from './useTemplate'

  let elements: any = {
    '0': null,
    '1': null,
    '2': null,
    '3': null,
    '4': null
  }

  let width: number
  let containerHeight = 0
  let style = ''

  const { update } = useSetting()
  const { init, setupHandler } = useTemplate()
  init()
  onMount(() => {
    const RATIO = 16 / 9
    containerHeight = width / RATIO
    for (const type of Object.values(ControlType)) {
      if (elements[`${type}`] !== null) {
        setupHandler(elements[`${type}`], type)
      }
    }
  })
  const getKeyName = (type: ControlType) => {
    switch (type) {
      case 0:
        return 'Panel'
      case 1:
        return 'Scroll'
      case 2:
        return 'Enter'
      case 3:
        return 'Up'
      case 4:
        return 'Down'
    }
  }
</script>

<style>
  .container {
    position: relative;
    user-select: none;
    width: 100%;
    height: 100%;
    background-color: white;
  }
  .headerContainer {
    display: flex;
    width: 100%;
    height: 5rem;
  }
  .headerItem {
    background-color: rgba(0, 0, 0, 0.1);
    position: absolute;
    z-index: 10;
  }
  .controls {
    z-index: 7;
    width: 100%;
    background-color: rgba(255, 0, 0, 0.5);
  }
  .center {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
  }
  .confirm {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
</style>

<svelte:window bind:innerWidth="{width}" />

<div class="container">
  {#each $controls as control}
    <div
      class="center headerItem"
      style="{getStyleFromRect(control.rect)}"
      bind:this="{elements[`${control.type}`]}"
    >
      <span>{getKeyName(control.type)}</span>
    </div>
  {/each}
  <div style="height: {containerHeight};" class="controls center"><span>コントロール</span></div>
  <button type="button" on:click="{update}" class="confirm">確定</button>
</div>
