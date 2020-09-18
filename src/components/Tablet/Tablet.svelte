<script lang="ts">
import { onMount } from 'svelte';

	import useWebRTC from '../../lib/webRTC'

	let remoteVideo: HTMLVideoElement
  const {
    hangUp,
    setupWS,
    playRemoteVideo
  } = useWebRTC()
  onMount(() => {
    setupWS({ privateIP: location.hostname, browserPort: Number(location.port) })
  })
</script>

<style></style>

<!-- svelte-ignore a11y-media-has-caption -->
<div>
  <button type="button" on:click="{hangUp}">Hang Up</button>
  <button type="button" on:click="{() => playRemoteVideo(remoteVideo)}">startRemote video</button>
  <div>
    <video bind:this="{remoteVideo}" autoplay style="width: 160px; height: 120px; border: 1px solid black;"></video>
	</div>
</div>
