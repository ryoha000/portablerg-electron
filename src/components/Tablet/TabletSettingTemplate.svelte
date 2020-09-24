<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { get } from 'svelte/store';
  import useSetting, { getStyleFromRect, ControlType } from './useSetting'
  import useTemplate, { controls, init } from './useTemplate'

  let container: HTMLElement
  let elements: any = {
    '0': null,
    '1': null,
    '2': null,
    '3': null,
    '4': null
  }
  let button :HTMLElement

  let width: number
  const RATIO = 16 / 9
  let containerHeight = window.innerWidth / RATIO

  init()

  const { update } = useSetting()
  const dispatch = createEventDispatcher();
  onMount(() => {
    const { setupHandler, addControl, setButton } = useTemplate(container)
    console.log(width)
    console.log(containerHeight)
    console.log(get(controls))
    for (const type of Object.values(ControlType)) {
      console.log(elements[`${type}`])
      if (elements[`${type}`] !== null) {
        setupHandler(elements[`${type}`], type)
      }
    }
    const confirm = async () => {
      addControl()
      await update()
      dispatch('close');
    }
    setButton(button, confirm)
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
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .headerItem {
    background-color: rgba(0, 0, 0, 0.1);
    position: absolute;
    z-index: 10;
  }
  .controls {
    z-index: 7;
    width: 100%;
    margin-top: 160px;
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

<svelte:window bind:innerWidth="{width}" />

<div class="container" bind:this="{container}">
  {#each $controls as control}
    <div
      class="center headerItem"
      style="{getStyleFromRect(control.rect)}"
      bind:this="{elements[`${control.type}`]}"
    >
      <span>{getKeyName(control.type)}</span>
    </div>
  {/each}
  <div style="height: {containerHeight}px;" class="controls center"><span>コントロール</span></div>
  <div class="confirm" bind:this="{button}">確定</div>
</div>
