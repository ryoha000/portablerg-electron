<script>
	import { onMount } from 'svelte';
	import Router, { push } from 'svelte-spa-router'
	import Desktop from './components/Desktop/Desktop.svelte'
	import Login from './components/Desktop/Login.svelte';
	import Select from './components/Desktop/SelectWindowDialog.svelte'
	import { getSources } from './renderLogic';
	import { store } from './store';

	const routes = {
		'/top': Desktop,
		'/': Login,
		'/select': Select,
	}

	onMount(() => {
		getSources((e) => {
			store.candidates.set(e)
			push('/select')
		})
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
