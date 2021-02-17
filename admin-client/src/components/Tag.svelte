<script>
  export let state = 'inactive';

  function color(state) {
    return {
      error: 'bg-red',
      inactive: 'bg-gray-30',
      info: 'bg-cyan',
      success: 'bg-mint',
      warning: 'bg-orange',
    }[state || 'inactive'];
  }
</script>

<span class="usa-tag radius-pill {color(state)} display-flex flex-align-center">
  <slot></slot>
</span>