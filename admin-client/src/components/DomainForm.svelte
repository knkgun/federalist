<script>
  import { afterUpdate, createEventDispatcher } from 'svelte';

  export let siteId;
  export let meta;

  const dispatch = createEventDispatcher();

  let submitting = false;

  function handleSubmit(event) {
    submitting = true;
    const { branch, name, environment } = event.target.elements;

    dispatch('create', {
      branch: branch.value,
      environment: environment.value,
      name: name.value,
      siteId,
    });
  }

  afterUpdate(() => { submitting = false; });
</script>

<div class="grid-row">
  <form class="usa-form grid-offset-4" on:submit|preventDefault={handleSubmit}>
    <fieldset class="usa-fieldset">
      <legend class="usa-legend usa-sr-only">Create a Domain</legend>
      <label class="usa-label" for="name">Name</label>
      <input type="text" class="usa-input" id="name" name="name" required>
      <label class="usa-label" for="branch">Branch</label>
      <input type="text" class="usa-input" id="branch" name="branch" required>
      <label class="usa-label" for="environment">Environment</label>
      {#each meta.environments as env}
        <div class="usa-radio">
          <input class="usa-radio__input usa-radio__input--tile" id={env} type="radio" name="environment" value={env}>
          <label class="usa-radio__label usa-radio__input--tile" for={env}>{env}</label>
        </div>
      {/each}
      <ul class="usa-button-group">
        <li class="usa-button-group__item">
          <button class="usa-button" type="submit" disabled={submitting}>Create</button>
        </li>
        <li class="usa-button-group__item">
          <button class="usa-button usa-button--outline" type="cancel">Cancel</button>
        </li>
      </ul>
    </fieldset>
  </form>
</div>