<script lang="ts">
  import mdi from '../../assets/mdi'
  export let size: number = 24;
  export let name: string;
  const path = () => mdi.get(name)
</script>


<svg
width="{size}"
height="{size}"
viewBox="0 0 24 24"
role="img"
class="icon"
on:click
>
  <style>
  .icon {
    contain: strict;
  }
  </style>
  <path d="{path()}" fill="currentColor" />
</svg>
