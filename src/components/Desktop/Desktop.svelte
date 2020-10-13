<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import ColumnTemplate from './ColumnTemplate.svelte'
	import useWebRTC from '../../lib/webRTC'
	import TextButton from '../UI/TextButton.svelte'
	import { openDialog, listenID, mouseDispose, getWindowRect } from '../../renderLogic'
	import { mouseInit } from '../../renderLogic'
	import useWindow from "./useWindow";
	import { store } from "../../store";

	let localVideo: HTMLVideoElement
	// let id: string
	let name: string

	let id = ""
	store.me.subscribe(v => id = v)

	const {
		setupWS,
		setStreamByID,
		connect
	} = useWebRTC()

	onMount(async () => {
		try {
			listenID(async (i: string, n: string) => {
				// id = i
				name = n
				await setStreamByID(i, localVideo)
				connect()
			})
			const ws = setupWS()
			mouseInit()
			try {
				window.addEventListener('unload', () => {
					ws.send(JSON.stringify({ type: "reset", id: id }))
				})
			} catch (e) {
				console.error(e)
			}
		} catch (e) {
			console.error(e)
		}
	})
	onDestroy(() => {
		mouseDispose()
	})

	const select = async () => {
		const sources = await useWindow()
		await openDialog(sources)
	}
</script>


<!-- svelte-ignore a11y-media-has-caption -->
<div>
	<style>
		.flexContainer {
			display: flex;
		}
	</style>
	<div>id: {id}</div>
	<ColumnTemplate label="Windowの選択">
    <video bind:this="{localVideo}" autoplay muted="{true}" style="width: 160px; height: 120px; border: 1px solid black;"></video>
		<div>現在: {name ?? '未選択'}</div>
		<div class="flexContainer">
			<TextButton label="リセット" color="rgb(255, 0, 0)" />
			<TextButton label="変更" on:click="{select}" color="rgb(0, 80, 160)" />
		</div>
	</ColumnTemplate>
	<button on:click="{getWindowRect}">getWindowRect</button>
</div>
