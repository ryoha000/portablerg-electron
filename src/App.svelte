<script lang="ts">
	import Router, { link } from 'svelte-spa-router'
	import Desktop from './Desktop/Desktop.svelte'
	import Tablet from './Tablet/Tablet.svelte'
	const routes = {
    '/desktop': Desktop,
    '/client': Tablet,
	}
</script>

<main>
	<div>aaa</div>
	<a href="/desktop" use:link>desktop</a>
	<Router {routes} />
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>