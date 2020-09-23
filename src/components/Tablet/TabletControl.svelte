<script lang="ts">
  import { controlsStyle, ControlType } from './useSetting'
  import Panel from './Controls/Panel.svelte'

  export let controlStyle: {
  id: number
  controls: {
    type: ControlType
    style: string
  }[]
}
  export let ws: WebSocket
</script>

<style>
  .container {
    position: absolute;
    user-select: none;
  }
  .controls {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .btnContainer {
    display: flex;
    position: absolute;
    top: 100%;
  }
</style>

{#if controlStyle}
  <div class="container" style="{$controlsStyle}">
    <div class="controls">
      {#each controlStyle.controls as control}
        {#if control.type === ControlType.Panel}
          <Panel {ws} style="{control.style}" />
        {/if}
      {/each}
    </div>
    <div class="btnContainer">
      <button type="button">left</button>
      <button type="button">right</button>
    </div>
  </div>
{/if}
