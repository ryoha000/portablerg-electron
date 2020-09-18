<script lang="ts">
  import { onMount } from "svelte";
  import TextButton from '../UI/TextButton.svelte'
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let ip: string = '192.168.0.4'
  
  let splited: string[] = []
  onMount(() => {
    console.log(ip)
    splited = ip.split('.')
  })
  const validate = (
    event: Event & { target: EventTarget & HTMLInputElement; },
    index: number
  ) => {
    if (event.target.valueAsNumber > 255) {
      splited[index] = '255'
    }
    if (event.target.valueAsNumber < 0) {
      splited[index] = '0'
    }
    console.log(event.target.valueAsNumber)
  }
  const reset = () => {
    dispatch('reset');
    setTimeout(() => {
      splited = ip.split('.')
    }, 100);
  }
  const confirm = () => {
    dispatch('confirm', {
      newIP: splited.join('.')
    })
  }
</script>

<style>
  .container {
    display: flex;
    padding: 4px 0;
  }
  .item {
    width: 4rem;
    height: 1.5rem;
    margin-bottom: 0;
  }
  .flexContainer {
    display: flex;
  }
</style>

<div class="container">
  {#each splited as num, i}
    {#if 2 > i}
      <div class="item">{num}</div>
    {:else}
      <input
        class="item"
        type="number"
        bind:value="{num}"
        on:input="{(e) => validate(e, i)}"
        max="{255}"
        min="{0}"
      />
    {/if}
  {/each}
</div>

<div class="flexContainer">
  <TextButton label="リセット" on:click="{reset}" color="rgb(255, 0, 0)" />
  <TextButton label="確定" on:click="{confirm}" color="rgb(0, 80, 160)" />
</div>