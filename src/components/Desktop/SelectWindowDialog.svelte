<script lang="ts">
  import { onMount } from "svelte";
  import SelectWindowDialogItem from "./SelectWindowDialogItem.svelte";
  import { getSources, decideWindow } from "../../renderLogic";
  import { store } from "../../store";

  let candidates: { id: string; name: string; url: string }[] = [];
  store.candidates.subscribe((v) => (candidates = v));
  const select = (e: CustomEvent<{ id: string; name: string }>) => {
    decideWindow(e.detail.id, e.detail.name);
  };
  onMount(() => {
    getSources((e) => {
      candidates = e;
    });
  });
</script>

{#if candidates.length !== 0}
  <div>
    <style>
      .rootContainer {
        grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
        padding: 24px;
        gap: 16px;
        display: grid;
      }
    </style>
    <div class="rootContainer">
      {#each candidates as candidate}
        <SelectWindowDialogItem on:select={select} {candidate} />
      {/each}
    </div>
  </div>
{/if}
