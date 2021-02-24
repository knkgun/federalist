const config = require('../../config');
const Features = require('../features');

function siteViewDomain(site) {
  if (Features.enabled(Features.Flags.FEATURE_PROXY_EDGE_LINKS)) {
    return config.app.proxyPreviewHost.replace('*', site.subdomain);
  }
  return `https://${site.awsBucketName}.app.cloud.gov`;
}

function path(site, deployment) {
  return `/${deployment}/${site.owner}/${site.repository}`;
}

function siteViewLink(site, deployment = 'site') {
  let link;
  if (deployment === 'site' && site.domain) {
    link = site.domain;
  } else if (deployment === 'demo' && site.demoDomain) {
    link = site.demoDomain;
  } else {
    link = `${siteViewDomain(site)}${path(site, deployment)}`;
  }
  return `${link.replace(/\/+$/, '')}/`;
}

const hideBasicAuthPassword = ({ username, password }) => {
  if (password && password.length) {
    return { username, password: '**********' };
  }
  return {};
};

module.exports = {
  path, siteViewLink, siteViewDomain, hideBasicAuthPassword,
};
