<script lang="ts">
  import { onMount } from 'svelte';
  import SelectWindowDialogItem from './SelectWindowDialogItem.svelte'
  import { getSources, decideWindow } from '../../renderLogic'

  let candidates: { id: string, name: string, url: string }[] = []
  const select = (e: CustomEvent<{ id: string, name: string }>) => {
    decideWindow(e.detail.id, e.detail.name)
  }
  onMount(() => {
    getSources((e) => candidates = e)
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
    <div>head</div>
    {#each candidates as candidate}
      <SelectWindowDialogItem on:select="{select}" {candidate} />
      <div>divisions</div>
    {/each}
  </div>
{/if}
