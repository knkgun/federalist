<script>
  import { notification } from '../stores';
  import { createDomain, destroyDomain, fetchDomains } from '../lib/api';
  import Accordion from './Accordion.svelte';
  import AccordionContent from './AccordionContent.svelte';
  import Await from './Await.svelte';
  import Domain from './Domain.svelte';
  import DomainForm from './DomainForm.svelte';

  export let siteId;

  $: domainsPromise = fetchDomains({ site: siteId });

  async function handleCreate({ detail }) {
    if (await createDomain(detail)) {
      domainsPromise = fetchDomains({ site: siteId });
      notification.setSuccess('Domain created successfully');
    }
  }

  async function handleDestroy({ detail }) {
    if (await destroyDomain(detail.id)) {
      domainsPromise = fetchDomains({ site: siteId });
      notification.setSuccess('Domain destroyed successfully');
    }
  }
</script>

<Await on={domainsPromise} let:response={domains}>
  <Accordion>
    <AccordionContent title="Create a Domain">
      <DomainForm {siteId} meta={domains.meta} on:create={handleCreate}/>
    </AccordionContent>
  </Accordion>
  <ul class="usa-collection">
    {#each domains.data as domain}
    <li class="usa-collection__item maxw-none">
      <Domain {domain} on:destroy={handleDestroy}/>
    </li>
    {/each}
  </ul>
</Await>