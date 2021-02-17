const { Domain, Site } = require('../../models');
const { fetchModelById } = require('../../utils/queryDatabase');
const { wrapHandlers } = require('../../utils');
const DomainService = require('../../services/Domain');
const { serialize, serializeMany } = require('../../serializers/domain');

module.exports = wrapHandlers({
  async list(req, res) {
    const {
      query: { site: siteId },
    } = req;

    const domains = await Domain.findAll({ where: { siteId } });

    await Promise.all(domains.map(async domain => {
      domain.dns = await DomainService.checkDns(domain);
    }));

    return res.json(serializeMany(domains, true));
  },

  async findById(req, res) {
    const {
      params: { id },
    } = req;

    const domain = await fetchModelById(id, Domain);
    if (!domain) {
      return res.notFound();
    }
    
    domain.dns = await DomainService.checkDns(domain);

    return res.json(serialize(domain, true));
  },

  async create(req, res) {
    const {
      body: {
        name,
        branch,
        environment,
        siteId,
      }
    } = req;

    const site = await fetchModelById(siteId, Site);
    if (!site) {
      return res.notFound();
    }

    const domain = await DomainService.createDomain(site, { branch, environment, name });

    const dns = await DomainService.checkDns(domain);

    await DomainService.updateDomain(domain, dns);

    domain.dns = dns;

    return res.json(serialize(domain, true));
  },

  async destroy(req, res) {
    const {
      params: { id },
    } = req;

    const domain = await fetchModelById(id, Domain);
    if (!domain) {
      return res.notFound();
    }

    await domain.destroy();

    return res.ok();
  },

  async provision(req, res) {
    const {
      params: { id },
    } = req;

    const domain = await fetchModelById(id, Domain);
    if (!domain) {
      return res.notFound();
    }

    await DomainService.provisionDomain(domain);

    domain.dns = await DomainService.checkDns(domain);

    return res.json(serialize(domain, true));
  },
});