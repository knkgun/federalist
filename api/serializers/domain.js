const { pick } = require('../utils');

const allowedAttributes = [
  'branch',
  'names',
  'state',
];

const adminAllowedAttributes = [
  'origin',
  'path',
  'serviceName',
];

const extraAttributes = [
  'dns',
];

function serialize(domain, isSystemAdmin) {
  const object = domain.get({ plain: true });
  
  const attributes = allowedAttributes;
  if (isSystemAdmin) {
    attributes.push(...adminAllowedAttributes);
  }
  
  const filtered = {
    ...pick(attributes, object),
    ...pick(extraAttributes, domain),
  };

  return filtered;
}

function serializeMany(domains, isSystemAdmin) {
  return domains.map(domain => serialize(domain, isSystemAdmin));
}

module.exports = { serialize, serializeMany };