const dns = require('dns').promises;
const { Domain } = require('../models');
const { path, siteViewDomain } = require('../utils/site');
const { ValidationError } = require('../utils/validators');

const cloudGovDomain = 'external-domains-production.cloud.gov';
const acmePrefix = '_acme-challenge';

function mapState(values, value) {
  if (values.length === 0) {
    return 'pending';
  }

  return values.includes(value) ? 'success' : 'error';
}

async function checkCname(domainName, value) {
  const dns = {
    type: 'CNAME',
    name: domainName,
  };

  try {
    const values = await dns.resolveCname(domainName);
    dns.state = mapState(values, value);
  } catch(err) {
    if (err.message === `queryCname ENOTFOUND ${domainName}`) {
      dns.state = 'pending';
    } else {
      dns.state = 'error';
      dns.message = err.message;
    };
  }
  return dns;
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
    throw new ValidationError(`Environment value must be 'site' or 'demo'.`);
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

function dnsReady(dns) {
  return dns
    .filter(value => value.name.startsWith('_acme-challenge'))
    .every(value => value.status);
}

async function updateDomain(domain, dns) {
  if (domain.isDnsPending() && dnsReady(dns)) {
    await domain.update({ state: 'dns_confirmed' });
  }
}

async function provisionDomain(domain) {
  if (!domain.isDnsConfirmed()) {
    throw new ValidationError('Cannot provision domain until acme challenge record(s) are present.');
  }

  // provision

  await domain.update({ state: 'provisioning '});
}

module.exports = {
  checkCname,
  checkDns,
  createDomain,
  provisionDomain,
  updateDomain,
};