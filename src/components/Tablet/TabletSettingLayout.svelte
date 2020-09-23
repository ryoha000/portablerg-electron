<script lang="ts">
  import { onMount } from 'svelte';
  import useSetting, { windowStyle, controlsStyle } from './useSetting'
  import useLayout from './useLayout'

  let windowElement: HTMLElement
  let controlsElement: HTMLElement

  onMount(() => {
    useLayout(windowElement)
    useLayout(controlsElement)
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
</style>


<div class="container">
  <div style="{$controlsStyle}" class="controls" bind:this="{controlsElement}" />
  <div style="{$windowStyle}" class="window" bind:this="{windowElement}" />
</div>
