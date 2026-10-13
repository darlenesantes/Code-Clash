import React from 'react';
import { createRoot } from 'react-dom/client';
import { act, Simulate } from 'react-dom/test-utils';
import GameRoom from './GameRoom';
import gameSocket from '../sockets/socket';

jest.mock('../sockets/socket', () => ({
  on: jest.fn(), off: jest.fn(), onGameStarted: jest.fn(),
  connect: jest.fn(), disconnect: jest.fn(), joinMatch: jest.fn(), leaveMatch: jest.fn(),
  getPlayerId: jest.fn(() => 'player-1'),
  isSocketConnected: jest.fn(() => true), submitCode: jest.fn()
}));
jest.mock('../components/VictoryPopup', () => ({ onUpdateProfile }) => (
  <div>Victory popup<button onClick={() => onUpdateProfile({})}>Apply victory rewards</button></div>
));

let container;
let root;
let handlers;
let navigate;

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  Object.defineProperty(window, 'crypto', { value: require('crypto').webcrypto, configurable: true });
  jest.clearAllMocks();
  sessionStorage.clear();
  gameSocket.getPlayerId.mockReturnValue('player-1');
  gameSocket.isSocketConnected.mockReturnValue(true);
  gameSocket.leaveMatch.mockResolvedValue(true);
  handlers = {};
  gameSocket.on.mockImplementation((event, handler) => { handlers[event] = handler; });
  gameSocket.onGameStarted.mockImplementation((handler) => { handlers.game_started = handler; });
  navigate = jest.fn();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<GameRoom navigate={navigate} roomCode="TEST" user={{ id: '1', name: 'Player' }} />));
  act(() => handlers.game_started({
    problem: { id: 2, title: 'Two Sum', functionSignature: { javascript: 'function twoSum() {}', python: 'def two_sum(): pass' } },
    deadlineAt: Date.now() + 900000,
    durationMs: 900000
  }));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  delete global.IS_REACT_ACT_ENVIRONMENT;
});

test('losing during submission clears the spinner, shows defeat, and lets the player leave', () => {
  const submit = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Run Tests & Submit');
  act(() => submit.click());
  expect(container.textContent).toContain('Running tests...');
  act(() => handlers.match_over({ winnerId: 'player-2', winnerName: 'Player', reason: 'solved' }));
  expect(container.querySelector('[role="dialog"]').textContent).toContain('Defeat');
  expect(container.textContent).toContain('Player won the match.');
  expect(container.textContent).not.toContain('Running tests...');
  expect(container.querySelector('textarea').disabled).toBe(true);
  expect(container.textContent).not.toContain('Victory popup');
  act(() => handlers.submission_result({ error: 'Late result' }));
  expect(container.textContent).not.toContain('Late result');
  act(() => container.querySelector('[role="dialog"] button').click());
  expect(navigate).toHaveBeenCalledWith('battle-arena');
});

test('server timeout shows the timeout result and clears pending testing', () => {
  act(() => [...container.querySelectorAll('button')].find((button) => button.textContent === 'Run Tests & Submit').click());
  act(() => handlers.match_over({ reason: 'time_expired' }));
  expect(container.querySelector('[role="dialog"]').textContent).toContain('Time expired');
  expect(container.textContent).toContain('No player solved the problem before the deadline.');
  expect(container.textContent).not.toContain('Running tests...');
  expect(container.querySelector('textarea').disabled).toBe(true);
});

test('opponent disconnect shows a grace notice, keeps coding available, and clears on reconnect', () => {
  act(() => handlers.player_connection({ playerId: 'player-2', connected: false, reconnectBy: Date.now() + 30000 }));
  expect(container.querySelector('[role="status"]').textContent).toContain('30 seconds to reconnect');
  expect(container.querySelector('textarea').disabled).toBe(false);
  expect(container.querySelector('[role="dialog"]')).toBeNull();
  act(() => handlers.player_connection({ playerId: 'player-2', connected: true, reconnectBy: null }));
  expect(container.querySelector('[role="status"]')).toBeNull();
});

test.each(['player_left', 'player_abandoned'])('a %s result cancels without awarding a victory or showing defeat', (reason) => {
  act(() => [...container.querySelectorAll('button')].find((button) => button.textContent === 'Run Tests & Submit').click());
  act(() => handlers.match_over({ status: 'cancelled', winnerId: null, reason, departedPlayerId: 'player-2' }));
  const dialog = container.querySelector('[role="dialog"]');
  expect(dialog.textContent).toContain('Match cancelled');
  expect(dialog.textContent).toContain('No winner was declared');
  expect(dialog.textContent).not.toContain('Defeat');
  expect(container.textContent).not.toContain('Victory popup');
  expect(container.textContent).not.toContain('Running tests...');
  expect(container.querySelector('textarea').disabled).toBe(true);
  act(() => dialog.querySelector('button').click());
  expect(navigate).toHaveBeenCalledWith('battle-arena');
  expect(gameSocket.leaveMatch).not.toHaveBeenCalled();
});

test('Back to Arena sends an explicit leave request before navigating', async () => {
  let acknowledge;
  gameSocket.leaveMatch.mockReturnValue(new Promise((resolve) => { acknowledge = resolve; }));
  act(() => [...container.querySelectorAll('button')].find((button) => button.textContent === 'Back to Arena').click());
  expect(gameSocket.leaveMatch).toHaveBeenCalledWith('TEST', JSON.parse(sessionStorage.getItem('codeClashMatchSession')).resumeToken);
  expect(navigate).not.toHaveBeenCalled();
  await act(async () => acknowledge(true));
  expect(navigate).toHaveBeenCalledWith('battle-arena');
});

test('the winning player keeps the existing victory popup', () => {
  act(() => handlers.match_over({ winnerId: 'player-1', winnerName: 'Player', results: { passed: 10, total: 10, results: [] } }));
  expect(container.textContent).toContain('Victory popup');
  expect(container.querySelector('[role="dialog"]')).toBeNull();
  expect(container.textContent).toContain('10/10 tests passed');
});

test('renders both public examples with preserved line breaks and valid-output guidance', () => {
  const examples = [
    { input: '[2,7,11,15]\n9', output: '[0,1]', acceptsOtherOutputs: true },
    { input: '[3,2,4]\n6', output: '[1,2]', acceptsOtherOutputs: true }
  ];
  act(() => handlers.game_started({
    problem: { title: 'Two Sum', examples },
    deadlineAt: Date.now() + 900000, durationMs: 900000
  }));
  examples.forEach((example) => {
    const input = [...container.querySelectorAll('div')].find((element) => element.textContent === example.input);
    expect(input).toBeDefined();
    expect(input.classList.contains('whitespace-pre-wrap')).toBe(true);
    expect(container.textContent).toContain(example.output);
  });
  expect(container.textContent).toContain('Other valid outputs may also be accepted.');
  expect(container.textContent).not.toContain('Examples are evaluated securely when you submit.');
});

test('waiting players see saved server preferences and errors for nonexistent rooms', () => {
  act(() => root.unmount());
  root = createRoot(container);
  act(() => root.render(<GameRoom navigate={navigate} roomCode="UNKNOWN" user={{ name: 'Guest' }} />));
  act(() => handlers.match_settings({ preferences: { difficulty: 'medium', topic: 'graph' } }));
  expect(container.textContent).toContain('Difficulty: medium / Topic: graph');
  act(() => handlers.submission_result({ error: 'Room not found. Ask the creator for a new code.' }));
  expect(container.querySelector('[role="alert"]').textContent).toContain('Room not found');
});

test.each([['easy', 'green'], ['medium', 'yellow'], ['hard', 'red'], ['MEDIUM', 'yellow']])(
  'the %s difficulty badge uses %s styling', (difficulty, color) => {
    act(() => handlers.game_started({
      problem: { title: 'Badge check', difficulty },
      deadlineAt: Date.now() + 900000, durationMs: 900000
    }));
    const badge = [...container.querySelectorAll('span')].find((element) => element.textContent === difficulty);
    expect(badge.classList.contains(`text-${color}-400`)).toBe(true);
    expect(badge.classList.contains(`bg-${color}-500/20`)).toBe(true);
    expect(badge.classList.contains(`border-${color}-500/30`)).toBe(true);
  }
);

const snapshot = (overrides = {}) => ({
  playerId: 'player-1', status: 'active', preferences: { difficulty: 'easy', topic: 'arrays' },
  problem: { id: 2, title: 'Two Sum', functionSignature: { javascript: 'function twoSum() {}', python: 'def two_sum(): pass' } },
  deadlineAt: Date.now() + 600000, durationMs: 900000, ...overrides
});

test('refresh restores the opponent grace notice from the server snapshot', () => {
  act(() => handlers.match_state(snapshot({ players: [
    { playerId: 'player-1', connected: true },
    { playerId: 'player-2', connected: false, reconnectBy: Date.now() + 15000 }
  ] })));
  expect(container.querySelector('[role="status"]').textContent).toContain('15 seconds to reconnect');
});

test('a cancelled waiting room shows a result instead of an invented problem', () => {
  act(() => root.unmount()); root = createRoot(container);
  act(() => root.render(<GameRoom navigate={navigate} roomCode="WAITING" user={{ id: '1', name: 'Player' }} />));
  act(() => handlers.match_state({ playerId: 'player-1', status: 'cancelled', problem: null, outcome: {
    status: 'cancelled', winnerId: null, reason: 'player_abandoned', departedPlayerId: 'player-2'
  } }));
  expect(container.querySelector('[role="dialog"]').textContent).toContain('Match cancelled');
  expect(container.querySelector('textarea')).toBeNull();
  expect(container.textContent).not.toContain('Two Sum');
});

test('reconnect and refresh retain both drafts, selected language, and the server deadline', () => {
  act(() => Simulate.change(container.querySelector('textarea'), { target: { value: 'const myDraft = 42;' } }));
  act(() => Simulate.change(container.querySelector('select'), { target: { value: 'python' } }));
  act(() => Simulate.change(container.querySelector('textarea'), { target: { value: 'def two_sum(nums, target):\n    return [0, 1]' } }));
  const saved = JSON.parse(sessionStorage.getItem('codeClashMatchSession'));
  const serverState = snapshot();
  act(() => handlers.connection_status({ status: 'disconnected' }));
  const submit = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Run Tests & Submit');
  expect(submit.disabled).toBe(true);
  act(() => handlers.connection_status({ status: 'connected' }));
  expect(gameSocket.joinMatch).toHaveBeenLastCalledWith('TEST', 'Player', saved.resumeToken);
  expect(submit.disabled).toBe(true); // Wait for membership acknowledgement.
  act(() => handlers.match_state(serverState));
  expect(submit.disabled).toBe(false);
  expect(container.querySelector('textarea').value).toContain('return [0, 1]');
  act(() => root.unmount());
  root = createRoot(container);
  act(() => root.render(<GameRoom navigate={navigate} roomCode="TEST" user={{ id: '1', name: 'Player' }} />));
  act(() => handlers.match_state(serverState));
  expect(container.querySelector('select').value).toBe('python');
  expect(container.querySelector('textarea').value).toContain('return [0, 1]');
  expect(container.textContent).toContain('10:00');
  act(() => Simulate.change(container.querySelector('select'), { target: { value: 'javascript' } }));
  expect(container.querySelector('textarea').value).toBe('const myDraft = 42;');
  expect(JSON.parse(sessionStorage.getItem('codeClashMatchSession')).resumeToken).toBe(saved.resumeToken);
});

test('restored pending evaluation ends when the server supplies its failure result', () => {
  act(() => handlers.match_state(snapshot({ pending: true })));
  expect(container.textContent).toContain('Running tests...');
  act(() => handlers.submission_result({ error: 'Execution failed' }));
  expect(container.textContent).not.toContain('Running tests...');
  expect(container.textContent).toContain('Execution failed');
});

test('a recovered finished match shows defeat instead of returning to play', () => {
  act(() => handlers.match_state(snapshot({ status: 'completed', outcome: {
    winnerId: 'player-2', winnerName: 'Player', reason: 'solved'
  } })));
  expect(container.querySelector('[role="dialog"]').textContent).toContain('Defeat');
  expect(container.querySelector('textarea').disabled).toBe(true);
  expect(container.textContent).not.toContain('Victory popup');
});

test('restoring a victory does not apply its profile rewards twice', () => {
  const update = jest.fn();
  const finalState = snapshot({ status: 'completed', outcome: {
    winnerId: 'player-1', winnerName: 'Player', reason: 'solved', results: { passed: 10, total: 10, results: [] }
  } });
  const mountWinner = () => {
    act(() => root.unmount()); root = createRoot(container);
    act(() => root.render(<GameRoom navigate={navigate} roomCode="TEST" user={{ id: '1', name: 'Player' }} onUpdateUser={update} />));
    act(() => handlers.match_state(finalState));
    act(() => [...container.querySelectorAll('button')].find((button) => button.textContent === 'Apply victory rewards').click());
  };
  mountWinner();
  expect(update).toHaveBeenCalledTimes(1);
  mountWinner();
  expect(update).toHaveBeenCalledTimes(1);
});
