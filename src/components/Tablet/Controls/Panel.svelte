<script lang="ts">
  import { onMount } from 'svelte';
  import useTouch from '../useTouch'

  export let style: string
  export let ws: WebSocket
  let container: HTMLElement

  onMount(() => {
    const { init } = useTouch(ws)
    init(container)
  })
</script>

<div style="{style}" bind:this="{container}" />
