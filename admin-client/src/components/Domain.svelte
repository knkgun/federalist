<script>
  import { createEventDispatcher } from 'svelte';
  import { fetchDomain, fetchDomainDns, provisionDomain } from '../lib/api';
  import Await from './Await.svelte';
  import LabeledItem from './LabeledItem.svelte';
  import Tag from './Tag.svelte';

  export let domain;

  const dispatch = createEventDispatcher();

  $: dnsPromise = fetchDomainDns(domain.id);

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

  function refreshDns() {
    dnsPromise = fetchDomainDns(domain.id);
  }

  async function refreshDomain() {
    domain = await fetchDomain(domain.id);
  }

  function canProvision() {
    return domain.state === 'dns_confirmed';
  }

  function isProvisioning() {
    return domain.state === 'provisioning';
  }

  async function provision() {
    domain = await provisionDomain(domain.id);
  }

  async function destroy() {
    dispatch('destroy', { id: domain.id });
  }
</script>

<div class="usa-collection__body">
  <div class="display-flex flex-justify flex-align-center">
    <h3 class="usa-collection__heading margin-top-0">{domain.names}</h3>
    <span>
      <Tag state={mapState(domain.state)}>{domain.state}</Tag>
      {#if isProvisioning()}
        <button
          class="usa-button usa-button--unstyled margin-right-0"
          on:click={refreshDomain}
        >
          Refresh
        </button>
      {/if}
    </span>
  </div>
  <LabeledItem label="branch" value={domain.branch} />
  <LabeledItem label="origin" value={domain.origin} />
  <LabeledItem label="path" value={domain.path} />
  <LabeledItem label="service" value={domain.serviceName} />
  <div class="display-flex flex-justify flex-align-center">
    <h4>DNS</h4>
    <button
      class="usa-button usa-button--unstyled margin-right-0"
      on:click={refreshDns}
    >
      Refresh
    </button>
  </div>
  <ul class="usa-collection__meta margin-bottom-2">
    <Await on={dnsPromise} let:response={dns}>
      {#each dns as record}
        <li class="usa-collection__meta-item">
          <span class="display-flex flex-justify">
            <code>{record.type} {record.name}</code>
            <Tag state={dnsState(record)}>{record.state}</Tag>
          </span>

          {#if record.message}
            <div class="usa-alert usa-alert--error usa-alert--slim">
              <div class="usa-alert__body">
                <p class="usa-alert__text">{record.message}</p>
              </div>
            </div>
          {/if}

          {#if record.state === 'pending'}
            <div class="usa-alert usa-alert--info usa-alert--slim" >
              <div class="usa-alert__body">
                <p class="usa-alert__text">
                  <code>{record.name}.external-domains-production.cloud.gov</code>
                </p>
              </div>
            </div>
          {/if}
        </li>
      {/each}
    </Await>
  </ul>
  <ul class="usa-button-group">
    {#if canProvision()}
      <li class="usa-button-group__item">
        <button
          class="usa-button usa-button--primary margin-right-0"
          on:click|preventDefault={provision}
        >
          Provision
        </button>
      </li>
    {/if}
    <li class="usa-button-group__item">
      <button
        class="usa-button usa-button--secondary margin-right-0"
        on:click|preventDefault={destroy}
      >
        Destroy
      </button>
    </li>
  </ul>
</div>