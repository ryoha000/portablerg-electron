<script lang="ts">
  import { onMount } from 'svelte';
  import useWebRTC from '../../lib/webRTC'
  import TouchPad from './TouchPad.svelte'

  let remoteVideo: HTMLVideoElement
  const {
    hangUp,
    setupWS,
    playRemoteVideo,
    sendMouseMove,
    connectHost,
    hostID
  } = useWebRTC()
  onMount(() => {
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      setupWS({ privateIP: location.hostname, browserPort: Number(location.port) })
    } else {
      setupWS({ privateIP: location.hostname, browserPort: 2401 })
    }
  })
  const a = async() => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
  }
  const changeHostID = (e: Event & { target: EventTarget & HTMLInputElement; }) => {
    hostID.set(e.target.valueAsNumber)
  }
</script>

<style>
  .window {
    width: 10%;
    height: 10%;
    border: 1px solid black;
  }
</style>

<div>

  <TouchPad />
  <!-- svelte-ignore a11y-media-has-caption -->
  <div>
    <button type="button" on:click="{connectHost}">Connect</button>
    <button type="button" on:click="{hangUp}">Hang Up</button>
    <button type="button" on:click="{() => playRemoteVideo(remoteVideo)}">startRemote video</button>
    <button type="button" on:click="{() => sendMouseMove({x: 0, y: -99})}">send data by data channel</button>
    <button type="button" on:click="{a}">s</button>
    <input on:input="{changeHostID}" type="number" />
    <div>
      <video class="window" bind:this="{remoteVideo}" autoplay></video>
    </div>
  </div>
</div>
