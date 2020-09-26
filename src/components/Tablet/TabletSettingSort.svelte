<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { controlStyles, setting } from './useSetting';
  import useSort, { overIndex } from './useSort'
  import { push } from 'svelte-spa-router'
  import SettingToggleButton from '../UI/SettingToggleButton.svelte'

  let container: HTMLElement
  const set = get(setting)
  let elements: any = set.controlTemplates.map(() => null)
  onMount(() => {
    const { init, setupElements } = useSort(container)
    init()
    console.log(elements)
    for (const [i, ele] of Object.values(elements).entries()) {
      setupElements((ele as HTMLElement), i)
    }
  })
  const close = () => {
    push('/client')
  }
</script>

<style>
  .container {
    width: 100%;
    height: 100%;
  }
  .thumbnail {
    width: 80%;
    height: 64px;
    padding: 16px;
    background-color: rgba(0, 0, 0, 0.5);
  }
  .thumbnail:first-of-type {
    background-color: rgba(0, 0, 0, 0);
  }
  .over {
    border: black solid 1px;
  }
  .controlContainer {
    position: relative;
    height: 100%;
    width: 70%;
    background-color: rgba(255, 0, 0, 0.5);
  }
</style>

<div class="container" bind:this="{container}">
  <SettingToggleButton iconName="close" />
  <div>
    <div class="thumbnail"></div>
    {#each $controlStyles as controlStyle, i}
      <div
        class="thumbnail {$overIndex === i ? 'over' : ''}"
        bind:this="{elements[i]}"
      >
        <div class="controlContainer">
          {#each controlStyle.controls as control}
            <div style="{control.style}" />
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
