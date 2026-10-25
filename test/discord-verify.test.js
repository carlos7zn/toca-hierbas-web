const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = readFileSync(join(__dirname, '..', 'api', 'discord-verify.js'), 'utf8');

async function run({ discordUserId = '123', member = true } = {}) {
  const writes = [];
  const module = { exports: {} };
  const createClient = (_url, key) => key === 'publishable'
    ? { auth: { getUser: async () => ({ data: { user: {
      id: '00000000-0000-4000-8000-000000000001',
      identities: [{ provider: 'discord', id: '123' }],
    } } }) } }
    : { from: () => ({
      upsert: async (value) => { writes.push(value); return { error: null }; },
      delete: () => ({ eq: async () => { writes.push('delete'); return { error: null }; } }),
    }) };
  const fetch = async (url) => url.endsWith('/users/@me')
    ? { ok: true, json: async () => ({ id: discordUserId }) }
    : member
      ? { ok: true, status: 200, json: async () => ({ user: { id: discordUserId } }) }
      : { ok: false, status: 404 };
  vm.runInNewContext(source, {
    module,
    require: () => ({ createClient }),
    fetch,
    console,
    process: { env: {
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_PUBLISHABLE_KEY: 'publishable',
      SUPABASE_SECRET_KEY: 'secret',
      DISCORD_GUILD_ID: 'guild',
    } },
  });
  const response = {
    statusCode: 200,
    setHeader() {},
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  await module.exports({ method: 'POST', headers: { authorization: 'Bearer session' }, body: { providerToken: 'discord-token' } }, response);
  return { response, writes };
}

test('verifies the Discord identity returned as id by Supabase Auth', async () => {
  const { response, writes } = await run();
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.verified, true);
  assert.equal(writes[0].discord_id, '123');
});

test('rejects a Discord token belonging to another identity', async () => {
  const { response, writes } = await run({ discordUserId: '456' });
  assert.equal(response.statusCode, 403);
  assert.equal(writes.length, 0);
});

test('revokes a link when the Discord account is no longer a member', async () => {
  const { response, writes } = await run({ member: false });
  assert.equal(response.statusCode, 403);
  assert.deepEqual(writes, ['delete']);
});
