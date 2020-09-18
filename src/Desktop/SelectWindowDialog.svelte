<script lang="ts">
  import { onMount } from 'svelte';
  import SelectWindowDialogItem from './SelectWindowDialogItem.svelte'
  import useWindow from './useWindow'
  import { decideWindow } from '../renderLogic'

  let candidates: Electron.DesktopCapturerSource[] = []
  let selected: string = ''
  const select = (e: CustomEvent<{ id: string, name: string }>) => {
    console.log(e.detail.id)
    selected = e.detail.id
    decideWindow(e.detail.id, e.detail.name)
  }
  onMount(async () => {
    const { sources } = await useWindow()
    candidates = sources
  })
</script>

<style>
  .container {
    display: flex;
    flex-wrap: wrap;
    padding: 24px;
  }
</style>

{#if candidates.length !== 0}
  <div class="container">
    {#each candidates as candidate}
      <SelectWindowDialogItem on:select="{select}" {candidate} />
    {/each}
  </div>
{/if}
