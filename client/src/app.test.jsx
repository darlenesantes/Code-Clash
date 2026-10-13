import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import { openMatchSession } from './utils/matchSession';

jest.mock('./pages/LandingPage', () => () => <div>Landing</div>);
jest.mock('./pages/GameDashboard', () => () => <div>Dashboard</div>);
jest.mock('./pages/BattleArena', () => () => <div>Arena</div>);
jest.mock('./pages/GameRoom', () => ({ roomCode, initialPreferences, navigate }) => (
  <div>Match {roomCode} {initialPreferences?.topic}<button onClick={() => navigate('battle-arena')}>Leave</button></div>
));

let root, container;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  Object.defineProperty(window, 'crypto', { value: require('crypto').webcrypto, configurable: true });
  localStorage.clear(); sessionStorage.clear();
  container = document.createElement('div'); document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount()); container.remove();
  delete global.IS_REACT_ACT_ENVIRONMENT;
});

test('refresh restores the saved room for the signed-in user, and leaving clears recovery', () => {
  localStorage.setItem('codeClashUser', JSON.stringify({ id: 'account-1', name: 'Player' }));
  openMatchSession('ABCD1234', 'account-1', { difficulty: 'medium', topic: 'graph' });
  act(() => root.render(<App />));
  expect(container.textContent).toContain('Match ABCD1234 graph');
  act(() => container.querySelector('button').click());
  expect(container.textContent).toBe('Arena');
  expect(sessionStorage.getItem('codeClashMatchSession')).toBeNull();
});

test('a different signed-in account does not inherit another player’s seat', () => {
  localStorage.setItem('codeClashUser', JSON.stringify({ id: 'account-2' }));
  openMatchSession('ABCD1234', 'account-1');
  act(() => root.render(<App />));
  expect(container.textContent).toBe('Dashboard');
});

test('refresh also restores a guest match', () => {
  openMatchSession('GUEST123', null);
  act(() => root.render(<App />));
  expect(container.textContent).toContain('Match GUEST123');
});
