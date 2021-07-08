<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let candidate: { id: string; name: string; url: string };

  const dispatch = createEventDispatcher();

  const select = () => {
    dispatch("select", {
      id: candidate.id,
      name: candidate.name,
    });
  };
</script>

<div on:click={select} class="container">
  <img src={candidate.url} alt={candidate.name} />
  <div class="text">{candidate.name}</div>
</div>

<style>
  img {
    height: 10rem;
    width: 100%;
    object-fit: contain;
  }
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    cursor: pointer;
    position: relative;
    padding: 8px;
    transition: 0.5s;
    border-radius: 4px;
  }
  .container:hover {
    background-color: lightgray;
  }
  .text {
    width: 100%;
    font-size: 1.15rem;
    bottom: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
</style>
