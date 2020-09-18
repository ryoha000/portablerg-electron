<script lang="ts">
  export let label: string
</script>

<style>
  .label {
    margin-bottom: 4px;
  }
  .item {
    padding-left: 16px;
  }
</style>

<div>
  <h3 class="label">
    {label}
  </h3>
  <div class="item">
    <slot></slot>
  </div>
</div>
