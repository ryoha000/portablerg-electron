<script lang="ts">
	import { onMount } from "svelte";
  import useWebRTC from '../lib/webRTC'

	let localVideo: HTMLVideoElement
	let remoteVideo: HTMLVideoElement
	let textForSendSdp: HTMLTextAreaElement
	let textForReceiveSdp: HTMLTextAreaElement
	onMount(() => {
		try {
			navigator.mediaDevices.getUserMedia({video: true, audio: true})
		} catch (err) {
			console.error(err)
		}
		const {
			startVideo,
			connect,
			hangUp,
			onSdpText,
			playRemoteVideo
		} = useWebRTC(
			localVideo,
			remoteVideo,
			textForSendSdp,
			textForReceiveSdp
		)
		startVideo1 = startVideo
		connect1 = connect
		hangUp1 = hangUp
		onSdpText1 = onSdpText
		playVideo1 = playRemoteVideo
	})
	let startVideo1: () => void
	let connect1: () => void
	let hangUp1: () => void
	let onSdpText1: () => void
  let playVideo1: () => void
</script>

<div>
  <button type="button" on:click="{startVideo1}">Start Video</button>
  <button type="button" on:click="{connect1}">Connect</button>
  <button type="button" on:click="{hangUp1}">Hang Up</button>
  <button type="button" on:click="{playVideo1}">startRemote video</button>
  <div>
    <video bind:this="{localVideo}" autoplay muted="{true}" style="width: 160px; height: 120px; border: 1px solid black;"></video>
    <video bind:this="{remoteVideo}" autoplay style="width: 160px; height: 120px; border: 1px solid black;"></video>
  </div>
  <p>SDP to send:<br />
    <textarea bind:this="{textForSendSdp}" rows="5" cols="60" readonly="{true}">SDP to send</textarea>
  </p>
  <p>SDP to receive:
    <button type="button" on:click="{onSdpText1}">Receive remote SDP</button><br />
    <textarea bind:this="{textForReceiveSdp}" rows="5" cols="60"></textarea>
  </p>
</div>
