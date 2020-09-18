<script lang="ts">
import { onMount } from 'svelte';

	import useWebRTC from '../../lib/webRTC'

	let remoteVideo: HTMLMediaElement
  // const a = async () => {
  //   console.log(remoteVideo)
  //   await playRemoteVideo(remoteVideo)
  // }
  onMount(() => {
    const {
      hangUp,
      setupWS,
      connect
    } = useWebRTC(remoteVideo)
    hu = hangUp
    con = connect
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      setupWS({ privateIP: location.hostname, browserPort: Number(location.port) })
    } else {
      setupWS({ privateIP: location.hostname, browserPort: 2401 })
    }
  })
  let hu: () => void
  let con: () => void
</script>

<style></style>

<!-- svelte-ignore a11y-media-has-caption -->
<div>
  <button type="button" on:click="{con}">connect</button>
  <button type="button" on:click="{hu}">Hang Up</button>
  <div>
    <video bind:this="{remoteVideo}" autoplay style="width: 160px; height: 120px; border: 1px solid black;"></video>
	</div>
</div>
