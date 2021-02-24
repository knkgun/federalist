/* eslint-disable no-console */
/* global API_URL */
import { notification } from '../stores';
import { logout as authLogout } from './auth';

const apiUrl = API_URL;

const defaultOptions = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  mode: 'cors',
};

// eslint-disable-next-line no-underscore-dangle
function _setSearchString(query = {}) {
  const search = new URLSearchParams();

  // eslint-disable-next-line array-callback-return
  Object.keys(query).map((key) => {
    search.set(key, query[key]);
  });
  return search.toString();
}

// eslint-disable-next-line no-underscore-dangle
async function _fetch(path, opts = {}) {
  try {
    const response = await fetch(`${apiUrl}/admin${path}`, { ...defaultOptions, ...opts });

    if (response.status === 401) {
      authLogout();
      return null;
    }

    const json = await response.json();

    if (response.ok) {
      return json;
    }

    throw new Error(json.message);
  } catch (error) {
    notification.setError(`API request failed: ${error.message}`);
    console.error(error);
    throw error;
  }
}

function destroy(path) {
  return _fetch(path, { method: 'DELETE' });
}

function get(path, query) {
  let qs = '';
  if (query) {
    const searchString = _setSearchString(query);
    qs = searchString !== '' ? `?${searchString}` : '';
  }
  return _fetch(path + qs);
}

function post(path, body) {
  return _fetch(path, { method: 'POST', body: JSON.stringify(body) });
}

function put(path, body) {
  return _fetch(path, { method: 'PUT', body: JSON.stringify(body) });
}

async function destroySite(id) {
  return destroy(`/sites/${id}`).catch(() => null);
}

async function fetchMe() {
  return get('/me');
}

function fetchBuildLogEventSource(id, onMessage) {
  const es = new EventSource(`${apiUrl}/admin/builds/${id}/log`, { withCredentials: true });
  es.addEventListener('message', onMessage);
  es.addEventListener('error', (error) => {
    // eslint-disable-next-line no-console
    console.error('EventSource failed:', error);
    if (es) {
      es.close();
    }
  });
  return es;
}

async function fetchBuild(id) {
  return get(`/builds/${id}`).catch(() => null);
}

async function fetchBuilds(query = {}) {
  return get('/builds', query).catch(() => []);
}

async function fetchBuildLog(id) {
  return get(`/builds/${id}/log`).catch(() => null);
}

async function createDomain(params) {
  return post('/domains', params).catch(() => null);
}

async function provisionDomain(id) {
  return post(`/domains/${id}/provision`).catch(() => null);
}

async function destroyDomain(id) {
  return destroy(`/domains/${id}`).then(() => true).catch(() => null);
}

async function fetchDomain(id) {
  return get(`/domains/${id}`).catch(() => null);
}

async function fetchDomains(query = {}) {
  return get('/domains', query).catch(() => []);
}

async function fetchDomainDns(id) {
  return get(`/domains/${id}/dns`).catch(() => []);
}

async function fetchEvents(query = {}) {
  return get('/events', query).catch(() => []);
}

async function fetchSite(id) {
  return get(`/sites/${id}`).catch(() => null);
}

async function fetchSites(query = {}) {
  return get('/sites', query).catch(() => []);
}

async function updateSite(id, params) {
  return put(`/sites/${id}`, params).catch(() => null);
}

async function fetchUser(id) {
  return get(`/users/${id}`).catch(() => null);
}

async function fetchUsers(query = {}) {
  return get('/users', query).catch(() => []);
}

async function logout() {
  return get('/logout').catch(() => null);
}

export {
  createDomain,
  destroyDomain,
  destroySite,
  fetchMe,
  fetchBuildLogEventSource,
  fetchBuild,
  fetchBuilds,
  fetchBuildLog,
  fetchDomain,
  fetchDomainDns,
  fetchDomains,
  fetchEvents,
  fetchSite,
  fetchSites,
  fetchUser,
  fetchUsers,
  logout,
  provisionDomain,
  updateSite,
};
