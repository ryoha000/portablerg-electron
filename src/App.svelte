<script>
	import { onMount } from 'svelte';
	import Router, { link, push } from 'svelte-spa-router'
	import Desktop from './components/Desktop/Desktop.svelte'
	import Select from './components/Desktop/SelectWindowDialog.svelte'
	import Tablet from './components/Tablet/Tablet.svelte'
	import TabletSettingLayout from './components/Tablet/TabletSettingLayout.svelte'

	const routes = {
		'/': Desktop,
		'/select': Select,
		'/client': Tablet,
		'/clientSettingLayout': TabletSettingLayout
	}
	onMount(() => {
		if (window.innerWidth === 800) {
			push('/select')
		}
	})
</script>

<main>
	<!-- <a href="/" use:link>desktop</a>
	<a href="/client" use:link>client</a>
	<a href="/select" use:link>select</a> -->
	<Router {routes} />
</main>

<style>
	main {
		margin: 0 auto;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
</style>