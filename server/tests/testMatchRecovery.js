const assert = require('node:assert/strict');
const { test } = require('node:test');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const solutions = require('./fixtures/solutions');

function harness() {
  const clients = [], timers = new Map(), broadcasts = [], judgeCalls = [];
  let time = Date.now(), nextTimer = 0;
  const io = { to: (room) => ({ emit: (event, payload) => {
    broadcasts.push({ event, payload });
    clients.filter((client) => client.rooms.has(room)).forEach((client) => client.socket.emit(event, payload));
  } }) };
  const moduleObject = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../sockets/matchSocket.js'), 'utf8'), {
    module: moduleObject, console: { log() {} }, Date: { now: () => time },
    setTimeout: (callback, delay) => { timers.set(++nextTimer, { callback, delay }); return nextTimer; },
    clearTimeout: (id) => timers.delete(id),
    require: (name) => name === '../utils/judge0Helper' ? {
      runJudge0: (wrapped) => new Promise((resolve, reject) => judgeCalls.push({ wrapped, resolve, reject }))
    } : require(name)
  });
  const handler = moduleObject.exports;
  const { roomCode } = handler.createMatch({ difficulty: 'easy', topic: 'arrays' });
  function client(token = randomUUID()) {
    const handlers = {}, events = [], rooms = new Set();
    const socket = { id: randomUUID(), data: {}, join: (room) => rooms.add(room), leave: (room) => rooms.delete(room),
      on: (event, callback) => { handlers[event] = callback; }, emit: (event, payload) => events.push({ event, payload }) };
    handler(socket, io);
    const entry = { token, socket, rooms, events, handlers,
      join: () => handlers.join_match({ matchCode: roomCode, username: 'Same name', resumeToken: token }),
      disconnect: () => { rooms.clear(); handlers.disconnect(); },
      leave: () => handlers.leave_match({ matchCode: roomCode, resumeToken: token }),
      state: () => events.filter((event) => event.event === 'match_state').at(-1)?.payload,
      submit: (code = solutions.javascript[2]) => handlers.submit_code({ matchCode: roomCode, code, languageId: 63 }) };
    clients.push(entry);
    return entry;
  }
  return { client, timers, broadcasts, judgeCalls, roomCode, graceMs: handler.RECONNECT_GRACE_MS,
    advance: (ms) => { time += ms; } };
}

test('disconnect notifies the opponent; reconnect cancels the grace timer without resetting the deadline', () => {
  const h = harness(), host = h.client(), guest = h.client(); host.join(); guest.join();
  const deadline = guest.state().deadlineAt;
  host.disconnect();
  const notice = guest.events.at(-1);
  assert.equal(notice.event, 'player_connection');
  assert.equal(notice.payload.connected, false);
  assert.equal(notice.payload.playerId, host.state().playerId);
  assert.equal(notice.payload.resumeToken, undefined);
  assert.equal([...h.timers.values()].filter((timer) => timer.delay === h.graceMs).length, 1);
  h.advance(15000);
  guest.join();
  assert.equal(guest.state().players.find((player) => player.playerId === host.state().playerId).connected, false);
  const resumed = h.client(host.token); resumed.join();
  assert.equal(resumed.state().status, 'active');
  assert.equal(resumed.state().deadlineAt, deadline);
  assert.equal([...h.timers.values()].filter((timer) => timer.delay === h.graceMs).length, 0);
  assert.equal(guest.events.filter((event) => event.event === 'player_connection').at(-1).payload.connected, true);
  assert.equal(h.broadcasts.filter((event) => event.event === 'match_over').length, 0);
});

test('an expired grace period cancels once, notifies the remaining player, and restores the cancellation on return', () => {
  const h = harness(), host = h.client(), guest = h.client(); host.join(); guest.join();
  host.disconnect();
  const grace = [...h.timers.values()].find((timer) => timer.delay === h.graceMs);
  h.advance(h.graceMs); grace.callback(); grace.callback();
  const endings = guest.events.filter((event) => event.event === 'match_over');
  assert.equal(endings.length, 1);
  assert.equal(endings[0].payload.status, 'cancelled');
  assert.equal(endings[0].payload.reason, 'player_abandoned');
  assert.equal(endings[0].payload.winnerId, null);
  assert.equal(endings[0].payload.departedPlayerId, host.state().playerId);
  const resumed = h.client(host.token); resumed.join();
  assert.equal(resumed.state().status, 'cancelled');
  assert.deepEqual(resumed.state().outcome, endings[0].payload);
});

test('both players disconnecting cancels with no winner, and waiting rooms also resolve abandonment', () => {
  for (const start of [false, true]) {
    const h = harness(), host = h.client(), guest = h.client(); host.join();
    if (start) guest.join();
    host.disconnect();
    if (start) guest.disconnect(); else guest.join();
    const grace = [...h.timers.values()].find((timer) => timer.delay === h.graceMs);
    h.advance(h.graceMs); grace.callback();
    const resumed = h.client(guest.token); resumed.join();
    assert.equal(resumed.state().status, 'cancelled');
    assert.equal(resumed.state().outcome.winnerId, null);
    assert.equal(Boolean(resumed.state().problem), start);
    assert.equal(h.broadcasts.filter((event) => event.event === 'match_over').length, 1);
  }
});

test('deliberate leave cancels immediately, rejects strangers and malformed payloads, and cannot change a finished outcome', () => {
  const h = harness(), host = h.client(), guest = h.client(), stranger = h.client(); host.join(); guest.join();
  for (const payload of [null, [], { matchCode: h.roomCode }, { matchCode: 1 }]) {
    assert.doesNotThrow(() => stranger.handlers.leave_match(payload));
    assert.ok(stranger.events.at(-1).payload.error);
  }
  assert.equal(h.broadcasts.filter((event) => event.event === 'match_over').length, 0);
  host.leave();
  const endings = guest.events.filter((event) => event.event === 'match_over');
  assert.equal(endings.length, 1);
  assert.equal(endings[0].payload.reason, 'player_left');
  assert.equal(endings[0].payload.winnerId, null);
  guest.leave(); host.disconnect();
  assert.equal(h.broadcasts.filter((event) => event.event === 'match_over').length, 1);
});

test('late reconnect and late judge completion cannot bypass the abandonment cutoff', async () => {
  for (const judging of [false, true]) {
    const h = harness(), host = h.client(), guest = h.client(); host.join(); guest.join();
    const pending = judging ? host.submit() : null;
    host.disconnect(); h.advance(h.graceMs + 1);
    if (judging) {
      const execution = spawnSync(process.execPath, ['-e', h.judgeCalls[0].wrapped], { encoding: 'utf8', timeout: 5000 });
      h.judgeCalls[0].resolve({ stdout: execution.stdout, status: { id: 3 } }); await pending;
    } else {
      const resumed = h.client(host.token); resumed.join();
      assert.equal(resumed.state().status, 'cancelled');
    }
    const ending = h.broadcasts.filter((event) => event.event === 'match_over');
    assert.equal(ending.length, 1);
    assert.equal(ending[0].payload.reason, 'player_abandoned');
    assert.equal(ending[0].payload.winnerId, null);
  }
});

test('refreshing a waiting player preserves the seat; a disconnected seat does not start the match', () => {
  const h = harness(), host = h.client();
  host.join();
  const id = host.state().playerId;
  host.disconnect();
  const guest = h.client(); guest.join();
  assert.equal(guest.state().status, 'waiting');
  const resumed = h.client(host.token); resumed.join();
  assert.equal(resumed.state().playerId, id);
  assert.equal(resumed.state().status, 'active');
  assert.equal(h.broadcasts.filter((event) => event.event === 'start_game').length, 1);
});

test('malformed join and submit payloads are rejected without crashing or calling Judge0', async () => {
  const h = harness(), host = h.client(), guest = h.client();
  for (const payload of [null, undefined, [], 'room', 7, true, {}, { matchCode: null }, { matchCode: [] }]) {
    assert.doesNotThrow(() => host.handlers.join_match(payload));
    assert.ok(host.events.at(-1).payload.error);
    await host.handlers.submit_code(payload);
    assert.ok(host.events.at(-1).payload.error);
  }
  assert.equal(h.judgeCalls.length, 0);
  assert.equal(h.broadcasts.length, 0);
  host.join(); guest.join();
  assert.equal(guest.state().status, 'active');
});

test('the server rejects forged 10/10 summaries and input mutation, then accepts an honest solution', async () => {
  const h = harness(), host = h.client(), guest = h.client(); host.join(); guest.join();
  const forged = host.submit();
  const prefix = JSON.parse(h.judgeCalls[0].wrapped.match(/const __codeClashResultPrefix = ("[^"\n]+");/)[1]);
  h.judgeCalls[0].resolve({ status: { id: 3 }, stdout: prefix + JSON.stringify({
    passed: 10, total: 10, results: Array.from({ length: 10 }, (_, i) => ({ test: i + 1, passed: true }))
  }) });
  await forged;
  assert.match(host.events.at(-1).payload.error, /invalid test result/);
  const changedInput = host.submit('function twoSum(nums,target) { nums[0]=0; nums[1]=target; return [0,1]; }');
  const execute = (call) => {
    const execution = spawnSync(process.execPath, ['-e', call.wrapped], { encoding: 'utf8', timeout: 5000 });
    assert.equal(execution.status, 0);
    call.resolve({ stdout: execution.stdout, status: { id: 3 } });
  };
  execute(h.judgeCalls[1]); await changedInput;
  assert.ok(host.events.at(-1).payload.results.passed < 10);
  assert.equal(h.broadcasts.filter((event) => event.event === 'match_over').length, 0);
  const honest = host.submit(); execute(h.judgeCalls[2]); await honest;
  const wins = h.broadcasts.filter((event) => event.event === 'match_over');
  assert.equal(wins.length, 1);
  assert.equal(wins[0].payload.results.passed, 10);
});

test('both disconnected players recover the same problem and deadline; strangers cannot take their seats', () => {
  const h = harness(), host = h.client(), guest = h.client(); host.join(); guest.join();
  // Get the host's active snapshot before comparing it with recovery.
  host.join();
  const original = host.state();
  host.disconnect(); guest.disconnect(); h.advance(20000);
  const stranger = h.client(); stranger.join();
  assert.match(stranger.events.at(-1).payload.error, /already started/);
  const resumed = h.client(host.token), guestResumed = h.client(guest.token);
  resumed.join(); guestResumed.join();
  assert.equal(resumed.state().playerId, original.playerId);
  assert.equal(resumed.state().deadlineAt, original.deadlineAt);
  assert.equal(resumed.state().durationMs, original.durationMs);
  assert.deepEqual(resumed.state().problem, original.problem);
  assert.equal(resumed.state().problem.testCases, undefined);
  assert.equal(resumed.state().resumeToken, undefined);
  assert.equal(guestResumed.state().deadlineAt, original.deadlineAt);
  assert.notEqual(guestResumed.state().playerId, original.playerId);
  assert.equal(h.broadcasts.filter((event) => event.event === 'start_game').length, 1);
});

test('refresh during judging keeps one submission and delivers its result to the replacement socket', async () => {
  const h = harness(), host = h.client(), guest = h.client(); host.join(); guest.join();
  const pending = host.submit(); host.disconnect();
  const resumed = h.client(host.token); resumed.join();
  assert.equal(resumed.state().pending, true);
  await resumed.submit();
  assert.equal(h.judgeCalls.length, 1);
  h.judgeCalls[0].reject(new Error('Execution failed'));
  await pending;
  assert.equal(resumed.events.at(-1).payload.error, 'Execution failed');
  resumed.join();
  assert.equal(resumed.state().pending, false);
  assert.equal(resumed.state().submissionResult.error, 'Execution failed');
});

test('a result earned while disconnected uses the stable player ID; both players can restore the final result', async () => {
  const h = harness(), host = h.client(), guest = h.client(); host.join(); guest.join();
  const pending = guest.submit();
  const winnerId = guest.state().playerId;
  guest.disconnect(); host.disconnect();
  const execution = spawnSync(process.execPath, ['-e', h.judgeCalls[0].wrapped], { encoding: 'utf8', timeout: 5000 });
  assert.equal(execution.status, 0);
  h.judgeCalls[0].resolve({ stdout: execution.stdout, status: { id: 3 } });
  await pending;
  const loser = h.client(host.token), winner = h.client(guest.token); loser.join(); winner.join();
  assert.equal(winner.state().status, 'completed');
  assert.equal(winner.state().outcome.winnerId, winnerId);
  assert.equal(winner.state().outcome.winnerId, winner.state().playerId);
  assert.notEqual(loser.state().playerId, winnerId);
  assert.deepEqual(loser.state().outcome, winner.state().outcome);
  assert.equal(winner.state().outcome.results.passed, 10);
});

test('disconnect does not stop expiry, and replacing a transport revokes its ability to submit', async () => {
  const h = harness(), host = h.client(), guest = h.client(); host.join(); guest.join();
  const replacement = h.client(host.token); replacement.join();
  host.disconnect(); // Must not clear the replacement's seat.
  assert.equal(replacement.state().status, 'active');
  await host.submit();
  assert.equal(h.judgeCalls.length, 0);
  assert.match(host.events.at(-1).payload.error, /no active match/);
  replacement.disconnect(); guest.disconnect();
  h.advance(900001);
  [...h.timers.values()][0].callback();
  const resumed = h.client(host.token); resumed.join();
  assert.equal(resumed.state().status, 'expired');
  assert.equal(resumed.state().outcome.reason, 'time_expired');
  assert.equal(resumed.state().outcome.winnerId, null);
});

test('real Socket.IO transports resume an active match, submit, and recover the opponent’s final result', async () => {
  const { createServer } = require('node:http');
  const { Server } = require('socket.io');
  const { io: connect } = require('socket.io-client');
  const http = createServer(), io = new Server(http), clients = [], timers = [];
  const moduleObject = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../sockets/matchSocket.js'), 'utf8'), {
    module: moduleObject, console: { log() {} }, Date,
    setTimeout: (callback, delay) => { const timer = setTimeout(callback, delay); timers.push(timer); return timer; }, clearTimeout,
    require: (name) => name === '../utils/judge0Helper' ? { runJudge0: async (wrapped) => {
      const execution = spawnSync(process.execPath, ['-e', wrapped], { encoding: 'utf8', timeout: 5000 });
      assert.equal(execution.status, 0);
      return { stdout: execution.stdout, status: { id: 3 } };
    } } : require(name)
  });
  const handler = moduleObject.exports;
  io.on('connection', (socket) => handler(socket, io));
  const wait = (socket, event) => new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${event}`)), 5000);
    socket.once(event, (payload) => { clearTimeout(timeout); resolve(payload); });
  });
  try {
    await new Promise((resolve) => http.listen(0, '127.0.0.1', resolve));
    const url = `http://127.0.0.1:${http.address().port}`;
    const newClient = async () => {
      const socket = connect(url, { autoConnect: false, transports: ['websocket'], reconnection: false, forceNew: true });
      clients.push(socket);
      const ready = wait(socket, 'connect'); socket.connect(); await ready; return socket;
    };
    const host = await newClient(), guest = await newClient();
    for (const event of ['join_match', 'submit_code']) {
      const rejected = wait(host, 'submission_result'); host.emit(event, null);
      assert.ok((await rejected).error);
      assert.equal(host.connected, true);
    }
    const hostToken = randomUUID(), guestToken = randomUUID();
    const { roomCode } = handler.createMatch({ topic: 'arrays' });
    const join = (socket, resumeToken) => socket.emit('join_match', { matchCode: roomCode, username: 'Same name', resumeToken });
    const waiting = wait(host, 'match_state'); join(host, hostToken);
    const hostId = (await waiting).playerId;
    const starts = [wait(host, 'start_game'), wait(guest, 'start_game')];
    const guestState = wait(guest, 'match_state'); join(guest, guestToken);
    const [hostStart, guestStart] = await Promise.all(starts);
    assert.deepEqual(hostStart, guestStart);
    const guestId = (await guestState).playerId;
    const oldTransportId = host.id;
    const disconnected = wait(guest, 'player_connection');
    host.disconnect();
    assert.equal((await disconnected).connected, false);
    guest.disconnect();
    const resumed = await newClient();
    const active = wait(resumed, 'match_state'); join(resumed, hostToken);
    const state = await active;
    assert.notEqual(resumed.id, oldTransportId);
    assert.equal(state.playerId, hostId);
    assert.equal(state.deadlineAt, hostStart.deadlineAt);
    assert.deepEqual(state.problem, hostStart.problem);
    const over = wait(resumed, 'match_over');
    resumed.emit('submit_code', { matchCode: roomCode, code: solutions.javascript[2], languageId: 63 });
    assert.equal((await over).winnerId, hostId);
    const returningGuest = await newClient();
    const final = wait(returningGuest, 'match_state'); join(returningGuest, guestToken);
    const finalState = await final;
    assert.equal(finalState.playerId, guestId);
    assert.equal(finalState.status, 'completed');
    assert.equal(finalState.outcome.winnerId, hostId);
    assert.notEqual(finalState.outcome.winnerId, guestId);
    // A second real match verifies that leave is delivered before transport shutdown.
    const room2 = handler.createMatch({ topic: 'arrays' }).roomCode;
    const hostWaiting = wait(resumed, 'match_state');
    resumed.emit('join_match', { matchCode: room2, username: 'Host', resumeToken: randomUUID() }); await hostWaiting;
    const guestReady = wait(returningGuest, 'match_state');
    returningGuest.emit('join_match', { matchCode: room2, username: 'Guest', resumeToken: randomUUID() }); await guestReady;
    const cancelled = wait(returningGuest, 'match_over');
    const acknowledgement = await new Promise((resolve) => resumed.timeout(3000).emit('leave_match', { matchCode: room2 }, (error, reply) => resolve(!error && reply?.ok)));
    assert.equal(acknowledgement, true);
    resumed.disconnect();
    const cancellation = await cancelled;
    assert.equal(cancellation.status, 'cancelled');
    assert.equal(cancellation.reason, 'player_left');
    assert.equal(cancellation.winnerId, null);
  } finally {
    clients.forEach((socket) => socket.disconnect());
    timers.forEach(clearTimeout);
    await new Promise((resolve) => io.close(resolve));
  }
});
