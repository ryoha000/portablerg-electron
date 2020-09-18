<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let candidate: Electron.DesktopCapturerSource

  const dispatch = createEventDispatcher();

  const select = () => {
    dispatch('select', {
      id: candidate.id,
      name: candidate.name
    });
  }
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 200px;
    height: 160px;
    cursor: pointer;
    position: relative;
    margin-right: 24px;
    margin-bottom: 24px;
    box-sizing: content-box;
  }
  img {
    width: 100%;
    object-fit: contain;
  }
  .text {
    width: 100%;
    font-size: 1.15rem;
    position: absolute;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .container:hover {
    border: black solid 2px;
  }
</style>

<div on:click="{select}" class="container">
  <img src="{candidate.thumbnail.toDataURL()}" alt="{candidate.name}" />
  <div class="text">{candidate.name}</div>
</div>
