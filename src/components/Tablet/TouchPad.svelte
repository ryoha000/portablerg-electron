<script lang="ts">
  import { onMount } from 'svelte';
  import useTouch, { message } from './useTouch'

  let container: HTMLDivElement
  export let ws: WebSocket

  onMount(() => {
    const { init } = useTouch(ws)
    init(container)
  })
</script>

<style>
  .container {
    user-select: none;
    background-color: red;
    width: 500px;
    height: 300px;
  }
</style>

<!-- svelte-ignore a11y-media-has-caption -->
<div bind:this="{container}" class="container">
</div>

<div>{$message}</div>
