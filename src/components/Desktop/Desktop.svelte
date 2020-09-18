<script lang="ts">
	import { onMount } from "svelte";
	import ColumnTemplate from './ColumnTemplate.svelte'
	import useWebRTC from '../../lib/webRTC'
	import Icon from '../UI/Icon.svelte'
	import TextButton from '../UI/TextButton.svelte'
	import { openDialog, listenID, getSetting, updateSetting, resetSetting, copy } from '../../renderLogic'
	import EditIp from "./EditIP.svelte";
	import EditPort from './EditPort.svelte'
	import type { Setting } from '../../@types/Original'

	let localVideo: HTMLVideoElement
	let remoteVideo: HTMLVideoElement
	let id: string
	let name: string
	let setting: Setting | null = null
	onMount(async () => {
		try {
			listenID((i: string, n: string) => { id = i; name = n })
			setting = await getSetting()
			setupWS(setting)
		} catch (e) {
			console.error(e)
		}
	})
	const {
		setupWS,
		setStreamByID,
		connect,
		hangUp
	} = useWebRTC()
	const setStream = () => {
		setStreamByID(id, localVideo)
	}

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
		<div class="flexContainer">
			<div class="clickable" on:click="{() => copy(`http://${setting?.privateIP}:${setting?.browserPort}/#/client`)}">
				<Icon name="content-copy" />
			</div>
			<div>http://192.164.0.4:5000/#/client</div>
		</div>
	</ColumnTemplate>
	<ColumnTemplate label="Windowの選択">
		<div>現在: {name ?? '未選択'}</div>
		<div class="flexContainer">
			<TextButton label="リセット" color="rgb(255, 0, 0)" />
			<TextButton label="変更" on:click="{openDialog}" color="rgb(0, 80, 160)" />
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
  <button type="button" on:click="{setStream}">Start Video</button>
  <button type="button" on:click="{connect}">Connect</button>
  <button type="button" on:click="{hangUp}">Hang Up</button>
  <div>
    <video bind:this="{localVideo}" autoplay muted="{true}" style="width: 160px; height: 120px; border: 1px solid black;"></video>
    <video bind:this="{remoteVideo}" autoplay style="width: 160px; height: 120px; border: 1px solid black;"></video>
	</div>
</div>
