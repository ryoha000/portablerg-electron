<script>
	import { onMount } from 'svelte';
	import Router from 'svelte-spa-router'
	import Desktop from './components/Desktop/Desktop.svelte'
	import Select from './components/Desktop/SelectWindowDialog.svelte'
	import Tablet from './components/Tablet/Tablet.svelte'
	import TabletSettingLayout from './components/Tablet/TabletSettingLayout.svelte'
	import TabletSettingSort from './components/Tablet/TabletSettingSort.svelte';
	import TabletSettingTemplate from './components/Tablet/TabletSettingTemplate.svelte';

	const routes = {
		'/': Desktop,
		'/select': Select,
		'/client': Tablet,
		'/client/setting/layout': TabletSettingLayout,
		'/client/setting/template': TabletSettingTemplate,
		'/client/setting/sort': TabletSettingSort,
	}
	onMount(() => {
	})
</script>

<main>
	<Router {routes} />
</main>

<style>
	main {
		margin: 0 auto;
		width: 100%;
		height: 100%;
	}
</style>
