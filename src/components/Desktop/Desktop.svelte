<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import ColumnTemplate from './ColumnTemplate.svelte'
	import useWebRTC from '../../lib/webRTC'
	import Icon from '../UI/Icon.svelte'
	import TextButton from '../UI/TextButton.svelte'
	import { openDialog, listenID, getSetting, updateSetting, resetSetting, copy, mouseDispose } from '../../renderLogic'
	import EditIp from "./EditIP.svelte";
	import EditPort from './EditPort.svelte'
	import type { Setting } from '../../@types/Original'
	import { mouseInit } from '../../renderLogic'
	import useWindow from "./useWindow";

	let localVideo: HTMLVideoElement
	// let id: string
	let name: string
	let setting: Setting | null = null

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
			setting = await getSetting()
			setupWS(setting)
			mouseInit()
		} catch (e) {
			console.error(e)
		}
	})
	onDestroy(() => {
		mouseDispose()
	})

	const confirmPrivateIP = async (e: CustomEvent<{ newIP: string}>) => {
		if (setting) {
			await updateSetting({ ...setting, privateIP: e.detail.newIP })
		}
	}
	const confirmBrowserPort = async (e: CustomEvent<{ newPort: number}>) => {
		if (setting) {
			await updateSetting({ ...setting, browserPort: e.detail.newPort })
		}
	}
	const reset = async () => {
		await resetSetting()
		setting = await getSetting()
	}
	const select = async () => {
		const sources = await useWindow()
		console.log(sources)
		await openDialog(sources)
	}
</script>

<style>
	.flexContainer {
		display: flex;
	}
	.clickable {
		cursor: pointer;
	}
</style>

<!-- svelte-ignore a11y-media-has-caption -->
<div>
	<ColumnTemplate label="端末側URL">
		{#if setting}
			<div class="flexContainer">
				<div class="clickable" on:click="{() => copy(`http://${setting?.privateIP}:${setting?.browserPort}/#/client`)}">
					<Icon name="content-copy" />
				</div>
				<div>{`http://${setting?.privateIP}:${setting?.browserPort}/#/client`}</div>
			</div>
		{/if}
	</ColumnTemplate>
	<ColumnTemplate label="Windowの選択">
    <video bind:this="{localVideo}" autoplay muted="{true}" style="width: 160px; height: 120px; border: 1px solid black;"></video>
		<div>現在: {name ?? '未選択'}</div>
		<div class="flexContainer">
			<TextButton label="リセット" color="rgb(255, 0, 0)" />
			<TextButton label="変更" on:click="{select}" color="rgb(0, 80, 160)" />
		</div>
	</ColumnTemplate>
	<ColumnTemplate label="このPCのPrivateIP">
		{#if setting}
			<EditIp ip="{setting.privateIP}" on:confirm="{confirmPrivateIP}" on:reset="{reset}" />
		{/if}
	</ColumnTemplate>
	<ColumnTemplate label="解放ポート番号(Browser用)">
		{#if setting}
			<EditPort port="{setting.browserPort}" on:confirm="{confirmBrowserPort}" on:reset="{reset}" />
		{/if}
	</ColumnTemplate>
</div>
