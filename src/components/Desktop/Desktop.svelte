<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import ColumnTemplate from './ColumnTemplate.svelte'
	import useWebRTC from '../../lib/webRTC'
	import TextButton from '../UI/TextButton.svelte'
	import { openDialog, listenID, mouseDispose, mouseInit } from '../../renderLogic'
	import useWindow from "./useWindow";
	import { store } from "../../store";
	import { get } from "svelte/store";

	let localVideo: HTMLVideoElement
	// let id: string
	let name: string

	let id = ""
	store.me.subscribe(v => id = v)

	const {
		setupWS,
		setStreamByID,
		connect,
		reset
	} = useWebRTC()

  store.ws.subscribe(v => {
    if (!v) {
      setTimeout(() => {
        if (!get(store.ws)) {
          console.log('reconnecting to websocket server')
          setupWS()
        }
      }, 1000)
    }
	})

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
		.desktopContainer {
			padding: 1rem;
		}
		.flexContainer {
			display: flex;
			flex-wrap: wrap;
		}
		.description {
			margin-top: 1rem;
			display: flex;
			flex-wrap: wrap;
		}
	</style>
	<div class="desktopContainer">
		<ColumnTemplate label="Windowの選択">
			<video bind:this="{localVideo}" autoplay muted="{true}" style="width: 160px; height: 120px; border: 1px solid black;"></video>
			<div>現在: {name ?? '未選択'}</div>
			<div class="flexContainer">
				<TextButton label="リセット" on:click="{() => reset(localVideo)}" color="rgb(255, 0, 0)" />
				<TextButton label="変更" on:click="{select}" color="rgb(0, 80, 160)" />
			</div>
		</ColumnTemplate>
		<div class="description"><div>操作したい端末で</div><div>portablerg.ryoha.moe</div><div>を開いてください。</div></div>
	</div>
</div>
