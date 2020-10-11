<script>
  import { onMount } from 'svelte';
  import { store } from '../../store';
  import { login } from '../../renderLogic'
  import { push } from 'svelte-spa-router'

  onMount(async () => {
    const id = await login()
    store.me.set(id)
    push("/top")
  })
</script>


<div class="container">
  <style>
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: rgba(255, 255, 255);
    }
  </style>
  <h1 class="title">portablerg</h1>
  <h3>
    お使いのブラウザでログインしてください
  </h3>
</div>
