<script lang="ts">
import { onMount } from 'svelte';

	import useWebRTC from '../../lib/webRTC'

	let remoteVideo: HTMLVideoElement
  const {
    hangUp,
    setupWS,
    playRemoteVideo,
    sendMouseMove,
    connect
  } = useWebRTC()
  onMount(() => {
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      setupWS({ privateIP: location.hostname, browserPort: Number(location.port) })
    } else {
      setupWS({ privateIP: location.hostname, browserPort: 2401 })
    }
  })
</script>

<style></style>

<!-- svelte-ignore a11y-media-has-caption -->
<div>
  <button type="button" on:click="{connect}">Connect</button>
  <button type="button" on:click="{hangUp}">Hang Up</button>
  <button type="button" on:click="{() => playRemoteVideo(remoteVideo)}">startRemote video</button>
  <button type="button" on:click="{() => sendMouseMove({x: 0, y: -99})}">send data by data channel</button>
  <div>
    <video bind:this="{remoteVideo}" autoplay style="width: 160px; height: 120px; border: 1px solid black;"></video>
	</div>
</div>
