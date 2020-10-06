<script>
	import { onMount } from 'svelte';
	import Router from 'svelte-spa-router'
	import Desktop from './components/Desktop/Desktop.svelte'
	import Select from './components/Desktop/SelectWindowDialog.svelte'

	const routes = {
		'/': Desktop,
		'/select': Select,
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
