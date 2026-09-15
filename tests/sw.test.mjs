import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../site/sw.js', import.meta.url), 'utf8');
function worker({ fetch = async () => { throw Error('offline'); }, match = async () => undefined, put = async () => {}, keys = [], openFails = false } = {}) {
  const handlers = {}, deleted = [], timers = [];
  const context = vm.createContext({
    self: { registration: { scope: 'https://example.com/HvorErAlle/' }, location: { origin: 'https://example.com' }, clients: { claim: async () => {} }, addEventListener: (name, fn) => handlers[name] = fn },
    caches: { open: async () => { if (openFails) throw Error('storage'); return { match, put }; }, keys: async () => keys, delete: async key => deleted.push(key) },
    fetch, URL, Request, Response, AbortController,
    setTimeout: fn => { timers.push(fn); return 1; }, clearTimeout: () => {}
  });
  vm.runInContext(source, context);
  return { handlers, deleted, timers, request: request => context.networkFirst(request) };
}
const request = { url: 'https://example.com/HvorErAlle/app.js', method: 'GET', mode: 'cors' };
test('activation preserves caches belonging to other apps', async () => {
  const w = worker({ keys: ['handleliste-v1', 'hvoreralle-v4', 'hvoreralle-v6'] });
  let done; w.handlers.activate({ waitUntil: promise => done = promise }); await done;
  assert.deepEqual(w.deleted, ['hvoreralle-v4']);
});
test('offline scripts never receive HTML fallback', async () => {
  const w = worker({ match: async key => typeof key === 'string' ? new Response('<html>') : undefined });
  assert.equal((await w.request(request)).type, 'error');
  assert.equal(await (await w.request({ ...request, mode: 'navigate' })).text(), '<html>');
});
test('timeout aborts network and uses cached asset', async () => {
  const w = worker({ fetch: (_, { signal }) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(Error('timeout')))), match: async () => new Response('cached') });
  const result = w.request(request); await new Promise(resolve => setImmediate(resolve)); w.timers[0]();
  assert.equal(await (await result).text(), 'cached');
});
test('HTTP errors use cache and cache write errors preserve network response', async () => {
  const w = worker({ fetch: async () => new Response('', { status: 503 }), match: async () => new Response('cached') });
  assert.equal(await (await w.request(request)).text(), 'cached');
  const online = worker({ fetch: async () => new Response('fresh'), put: async () => { throw Error('quota'); } });
  assert.equal(await (await online.request(request)).text(), 'fresh');
});
test('requests outside application scope are not intercepted', () => {
  const w = worker();
  w.handlers.fetch({ request: { ...request, url: 'https://example.com/handleliste/app.js' }, respondWith: () => assert.fail('intercepted') });
});

test('unavailable cache storage preserves successful network loading', async () => {
  const w = worker({ openFails: true, fetch: async () => new Response('fresh') });
  assert.equal(await (await w.request(request)).text(), 'fresh');
});
