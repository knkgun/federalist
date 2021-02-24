<script>
  export let state = 'inactive';

  function color(value) {
    return {
      error: 'bg-red',
      inactive: 'bg-gray-30',
      info: 'bg-cyan',
      success: 'bg-mint',
      warning: 'bg-orange',
    }[value || 'inactive'];
  }
</script>

<span class="usa-tag radius-pill {color(state)} display-inline-flex flex-align-center flex-justify-center">
  <slot></slot>
</span>