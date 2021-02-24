const dns = require('dns').promises;
const { Domain } = require('../models');
const { path, siteViewDomain } = require('../utils/site');
const { ValidationError } = require('../utils/validators');
const CloudFoundryAPIClient = require('../utils/cfApiClient');

const cloudGovDomain = 'external-domains-production.cloud.gov';
const acmePrefix = '_acme-challenge';

function mapState(values, value) {
  if (values.length === 0) {
    return 'pending';
  }

  return values.includes(value) ? 'success' : 'error';
}

async function checkCname(domainName, value) {
  const record = {
    type: 'CNAME',
    name: domainName,
  };

  try {
    const values = await dns.resolveCname(domainName);
    record.state = mapState(values, value);
  } catch (err) {
    if (err.message === `queryCname ENOTFOUND ${domainName}`) {
      record.state = 'pending';
    } else {
      record.state = 'error';
      record.message = err.message;
    }
  }
  return record;
}

function checkDnsRecord(domainName) {
  return Promise.all([
    checkCname(domainName, `${domainName}.${cloudGovDomain}`),
    checkCname(`${acmePrefix}.${domainName}`, `${acmePrefix}.${domainName}.${cloudGovDomain}`),
  ]);
}

function checkDns(domain) {
  return Promise
    .all(domain.names.split(',').map(checkDnsRecord))
    .then(values => values.flat());
}

function createDomain(site, { name, branch, environment }) {
  if (!['site', 'demo'].includes(environment)) {
    throw new ValidationError('Environment value must be \'site\' or \'demo\'.');
  }

  return Domain.create({
    names: name,
    branch,
    origin: siteViewDomain(site),
    path: path(site, environment),
    serviceName: `${name}-ext`,
    siteId: site.id,
  });
}

function dnsReady(records) {
  return records
    .filter(value => value.name.startsWith('_acme-challenge'))
    .every(value => value.status);
}

async function updateDomain(domain, records) {
  if (domain.isDnsPending() && dnsReady(records)) {
    await domain.update({ state: 'dns_confirmed' });
  }
}

async function provisionDomain(domain) {
  if (!domain.isDnsConfirmed()) {
    throw new ValidationError('Cannot provision domain until acme challenge record(s) are present.');
  }

  const cfApi = new CloudFoundryAPIClient();
  await cfApi.createExternalDomain(domain);

  await domain.update({ state: 'provisioning ' });
}

async function checkDnsAndUpdateDomain(domain) {
  const records = await checkDns(domain);
  await updateDomain(domain, records);
  return records;
}

function destroyDomain(domain) {
  // eventually handle deprovisioning as well
  return domain.destroy();
}

async function checkProvisioning(domain) {
  if (!domain.isProvisioning()) {
    return;
  }

  const cfApi = new CloudFoundryAPIClient();
  const service = await cfApi.fetchServiceInstance(domain.serviceName);

  switch (service.entity.last_operation) {
    case 'succeeded':
      await domain.update({ state: 'created' });
      break;
    case 'failed':
      await domain.update({ state: 'failed' });
      break;
    default:
      break;
  }
}

module.exports = {
  checkCname,
  checkDns,
  checkDnsAndUpdateDomain,
  checkProvisioning,
  createDomain,
  destroyDomain,
  provisionDomain,
  updateDomain,
};
