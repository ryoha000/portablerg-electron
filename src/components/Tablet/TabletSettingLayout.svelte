<script lang="ts">
  import { onMount } from 'svelte';
  import useSetting, { windowStyle, controlsStyle, setting } from './useSetting'
  import useLayout from './useLayout'

  let windowElement: HTMLElement
  let controlsElement: HTMLElement

  const { update } = useSetting()
  onMount(() => {
    useLayout(windowElement, 'window')
    useLayout(controlsElement, 'controls')
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
    background-color: rgba(0, 0, 0, 0.5);
  }
  .controls {
    z-index: 1;
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

<div class="container">
  <div style="{$windowStyle}" class="window center" bind:this="{windowElement}"><span>Window</span></div>
  <div style="{$controlsStyle}" class="controls center" bind:this="{controlsElement}"><span>コントロール</span></div>
  <button type="button" on:click="{update}" class="confirm">確定</button>
</div>
