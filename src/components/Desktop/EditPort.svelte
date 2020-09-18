<script lang="ts">
  import { onMount } from "svelte";
  import TextButton from '../UI/TextButton.svelte'
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let port: number = 0
  
  let inputting: number = 0
  onMount(() => {
    console.log(port)
    inputting = port
  })
  const validate = (
    event: Event & { target: EventTarget & HTMLInputElement; }
  ) => {
    if (event.target.valueAsNumber < 0) {
      inputting = 0
    }
    console.log(event.target.valueAsNumber)
  }
  const reset = () => {
    dispatch('reset');
    setTimeout(() => {
      inputting = port
    }, 100);
  }
  const confirm = () => {
    dispatch('confirm', {
      newPort: inputting
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
  <input
    class="item"
    type="number"
    bind:value="{inputting}"
    on:input="{validate}"
    min="{0}"
  />
</div>

<div class="flexContainer">
  <TextButton label="リセット" on:click="{reset}" color="rgb(255, 0, 0)" />
  <TextButton label="確定" on:click="{confirm}" color="rgb(0, 80, 160)" />
</div>
