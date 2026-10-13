const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createServer } = require('node:net');
const { spawn, spawnSync } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const path = require('node:path');
const { io: connect } = require('socket.io-client');
const { getServerConfig } = require('../utils/serverConfig');
const { getJudge0ConfigStatus } = require('../utils/judge0Helper');
const { validateBuildEnv } = require('../../client/scripts/validateEnv');

// Synthetic settings only. Never load private .env files or call Google/Judge0.
const productionEnv = {
  NODE_ENV: 'production',
  CLIENT_ORIGIN: 'https://codeclash-deployment-check.vercel.app',
  GOOGLE_CLIENT_ID: '1234567890-deploymentcheck.apps.googleusercontent.com',
  JUDGE0_API_URL: 'https://judge0-ce.p.rapidapi.com/submissions',
  JUDGE0_API_HOST: 'judge0-ce.p.rapidapi.com',
  JUDGE0_API_KEY: 'synthetic-key-not-used-for-network-requests'
};
const buildEnv = {
  REACT_APP_API_URL: 'https://codeclash-deployment-check.onrender.com',
  REACT_APP_SOCKET_URL: 'https://codeclash-deployment-check.onrender.com',
  REACT_APP_GOOGLE_CLIENT_ID: productionEnv.GOOGLE_CLIENT_ID
};

test('production accepts host-provided settings, normalizes CORS origin, and uses PORT', () => {
  const config = getServerConfig({ ...productionEnv, PORT: '10000',
    CLIENT_ORIGIN: ` ${productionEnv.CLIENT_ORIGIN}/ ` });
  assert.equal(config.port, 10000);
  assert.equal(config.clientOrigin, productionEnv.CLIENT_ORIGIN);
  assert.equal(config.googleClientId, productionEnv.GOOGLE_CLIENT_ID);
  assert.equal(getServerConfig({}).clientOrigin, 'http://localhost:3000');
});

test('production rejects missing or unusable configuration without exposing supplied values', () => {
  for (const override of [
    { CLIENT_ORIGIN: '' }, { CLIENT_ORIGIN: 'http://localhost:3000' },
    { CLIENT_ORIGIN: `${productionEnv.CLIENT_ORIGIN}/api` },
    { CLIENT_ORIGIN: 'https://user:sensitive-value@frontend.example' },
    { GOOGLE_CLIENT_ID: 'your-client-id.apps.googleusercontent.com' },
    { PORT: 'not-a-port' }, { PORT: '70000' },
    { JUDGE0_API_URL: '' }, { JUDGE0_API_KEY: '' }, { JUDGE0_API_HOST: '' }
  ]) {
    assert.throws(() => getServerConfig({ ...productionEnv, ...override }), (error) => {
      assert.ok(!error.message.includes('sensitive-value'));
      assert.ok(!error.message.includes(productionEnv.JUDGE0_API_KEY));
      return true;
    });
  }
});

test('Judge0 rejects placeholders, wrong endpoint paths, and mismatched RapidAPI hosts', () => {
  for (const override of [
    { JUDGE0_API_URL: 'https://your-judge0-host/submissions' },
    { JUDGE0_API_URL: 'https://judge0-ce.p.rapidapi.com/' },
    { JUDGE0_API_URL: 'ftp://judge0-ce.p.rapidapi.com/submissions' },
    { JUDGE0_API_URL: 'http://judge0-ce.p.rapidapi.com/submissions' },
    { JUDGE0_API_KEY: 'replace-with-your-secret-key' },
    { JUDGE0_API_HOST: 'wrong.p.rapidapi.com' }
  ]) assert.equal(getJudge0ConfigStatus({ ...productionEnv, ...override }).configured, false);
  assert.equal(getJudge0ConfigStatus(productionEnv).configured, true);
  // Preserve support for non-RapidAPI Judge0 installations.
  assert.equal(getJudge0ConfigStatus({ JUDGE0_API_URL: 'http://judge.example/submissions' }).configured, true);
});

test('frontend build rejects localhost fallbacks, missing IDs, and API paths before bundling', () => {
  assert.doesNotThrow(() => validateBuildEnv(buildEnv));
  assert.doesNotThrow(() => validateBuildEnv({ ...buildEnv, REACT_APP_API_URL: ` ${buildEnv.REACT_APP_API_URL}/ ` }));
  for (const override of [
    { REACT_APP_API_URL: '' }, { REACT_APP_API_URL: 'http://localhost:3001' },
    { REACT_APP_API_URL: `${buildEnv.REACT_APP_API_URL}/api` },
    { REACT_APP_SOCKET_URL: '' }, { REACT_APP_SOCKET_URL: 'https://localhost:3001' },
    { REACT_APP_GOOGLE_CLIENT_ID: '' },
    { REACT_APP_GOOGLE_CLIENT_ID: 'your-client-id.apps.googleusercontent.com' }
  ]) assert.throws(() => validateBuildEnv({ ...buildEnv, ...override }));
});

function childEnv(overrides) {
  const env = {};
  for (const name of ['PATH', 'Path', 'SystemRoot', 'SYSTEMROOT', 'TEMP', 'TMP', 'ComSpec', 'PATHEXT']) {
    if (process.env[name]) env[name] = process.env[name];
  }
  return { ...env, ...overrides };
}

test('actual production entry point fails before listening when hosting settings are missing', () => {
  const execution = spawnSync(process.execPath, [path.join(__dirname, '../app.js')], {
    cwd: path.join(__dirname, '../..'), env: childEnv({ NODE_ENV: 'production' }),
    encoding: 'utf8', timeout: 15000
  });
  assert.equal(execution.status, 1);
  assert.match(execution.stderr, /Server configuration error/);
  assert.match(execution.stderr, /CLIENT_ORIGIN/);
  assert.match(execution.stderr, /GOOGLE_CLIENT_ID/);
  assert.match(execution.stderr, /JUDGE0_API_URL/);
});

test('actual production server serves health/API/CORS and supports WebSocket and polling match recovery',
  { timeout: 40000 }, async (t) => {
    const probe = createServer();
    await new Promise((resolve) => probe.listen(0, '127.0.0.1', resolve));
    const port = probe.address().port;
    await new Promise((resolve) => probe.close(resolve));
    const server = spawn(process.execPath, [path.join(__dirname, '../app.js')], {
      cwd: path.join(__dirname, '../..'), env: childEnv({ ...productionEnv, PORT: String(port) }),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    const clients = [];
    t.after(async () => {
      clients.forEach((socket) => socket.disconnect());
      if (server.exitCode === null) {
        const closed = new Promise((resolve) => server.once('exit', resolve));
        server.kill();
        await closed;
      }
    });
    await new Promise((resolve, reject) => {
      let output = '';
      const timer = setTimeout(() => reject(new Error('Production server startup timed out')), 15000);
      server.once('error', (error) => { clearTimeout(timer); reject(error); });
      server.once('exit', (code) => { clearTimeout(timer); reject(new Error(`Production server exited: ${code}`)); });
      server.stdout.on('data', (chunk) => {
        output += chunk;
        if (output.includes('CodeClash Server Started')) { clearTimeout(timer); resolve(); }
      });
    });
    const url = `http://127.0.0.1:${port}`;
    const headers = { Origin: productionEnv.CLIENT_ORIGIN };
    const health = await fetch(`${url}/health`, { headers });
    assert.equal(health.status, 200);
    assert.equal(health.headers.get('access-control-allow-origin'), productionEnv.CLIENT_ORIGIN);
    assert.match((await health.json()).judge0, /execution not verified/);
    const options = await fetch(`${url}/api/game/options`, { headers });
    assert.equal((await options.json()).combinations.length, 4);
    const preflight = await fetch(`${url}/api/auth/google`, { method: 'OPTIONS', headers: {
      ...headers, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type'
    } });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), productionEnv.CLIENT_ORIGIN);
    const otherOrigin = await fetch(`${url}/health`, { headers: { Origin: 'https://other-site.example' } });
    assert.notEqual(otherOrigin.headers.get('access-control-allow-origin'), 'https://other-site.example');
    const missingToken = await fetch(`${url}/api/auth/google`, {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: '{}'
    });
    assert.equal(missingToken.status, 400);
    const created = await fetch(`${url}/api/game/rooms`, {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ difficulty: 'easy', topic: 'arrays' })
    });
    assert.equal(created.status, 201);
    const { roomCode } = await created.json();
    const wait = (socket, event) => new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${event}`)), 5000);
      socket.once(event, (data) => { clearTimeout(timer); resolve(data); });
    });
    const newClient = async (transport) => {
      const socket = connect(url, { autoConnect: false, transports: [transport], upgrade: false,
        forceNew: true, reconnection: false, extraHeaders: headers });
      clients.push(socket);
      const connected = wait(socket, 'connect'); socket.connect(); await connected; return socket;
    };
    const host = await newClient('websocket'), guest = await newClient('polling');
    const token = randomUUID();
    const join = (socket, resumeToken) => socket.emit('join_match', {
      matchCode: roomCode, username: 'Deployment check', resumeToken
    });
    const waiting = wait(host, 'match_state'); join(host, token); await waiting;
    const startedHost = wait(host, 'start_game'), startedGuest = wait(guest, 'start_game');
    join(guest, randomUUID());
    const [first, second] = await Promise.all([startedHost, startedGuest]);
    assert.deepEqual(first.problem, second.problem);
    assert.equal(first.deadlineAt, second.deadlineAt);
    assert.equal(first.problem.testCases, undefined);
    const notice = wait(guest, 'player_connection'); host.disconnect();
    assert.equal((await notice).connected, false);
    const resumed = await newClient('websocket');
    const restored = wait(resumed, 'match_state'); join(resumed, token);
    const state = await restored;
    assert.equal(state.deadlineAt, first.deadlineAt);
    assert.deepEqual(state.problem, first.problem);
    const rejected = wait(resumed, 'submission_result');
    resumed.emit('submit_code', { matchCode: roomCode, code: 'not executed', languageId: 999 });
    assert.ok((await rejected).error);
    const cancelled = wait(guest, 'match_over');
    const left = new Promise((resolve) => resumed.emit('leave_match', { matchCode: roomCode, resumeToken: token }, resolve));
    assert.equal((await left).ok, true);
    assert.equal((await cancelled).reason, 'player_left');
  });
