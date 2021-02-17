<script>
  import LabeledItem from './LabeledItem.svelte';
  import Tag from './Tag.svelte';

  export let domains;

  function mapState(state) {
    return {
      dns_pending: 'warning',
      dns_confirmed: 'info',
      provisioning: 'warning',
      failed: 'error',
      created: 'success',
    }[state];
  }

  function dnsState(dns) {
    return dns.state === 'pending' ? 'warning' : dns.state;
  }
</script>

<div>
  {#each domains as domain}
    <div class="margin-bottom-2">
      <h2 class="display-flex flex-justify">
        {domain.names}
        <Tag state={mapState(domain.state)}>{domain.state}</Tag>
      </h2>
      <LabeledItem label="branch" value={domain.branch} />
      <LabeledItem label="origin" value={domain.origin} />
      <LabeledItem label="path" value={domain.path} />
      <LabeledItem label="service" value={domain.serviceName} />
    </div>
    <h4>DNS</h4>
    <ul class="add-list-reset">
      {#each domain.dns as dns}
        <li class="margin-bottom-1">
          <span class="display-flex flex-justify">
            <code>{dns.type} {dns.name}</code>
            <Tag state={dnsState(dns)}>{dns.state}</Tag>
          </span>
          {#if dns.message}
            <div class="usa-alert usa-alert--error usa-alert--slim">
              <div class="usa-alert__body">
                <p class="usa-alert__text">{dns.message}</p>
              </div>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/each}
</div>
