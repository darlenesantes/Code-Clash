import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import BattleArena from './BattleArena';
import matchService from '../services/api/matchService';

jest.mock('../services/api/matchService', () => ({ getOptions: jest.fn(), createRoom: jest.fn() }));

const combinations = [
  { difficulty: 'easy', topic: 'arrays' },
  { difficulty: 'medium', topic: 'linked list' },
  { difficulty: 'medium', topic: 'binary tree' },
  { difficulty: 'medium', topic: 'graph' }
];
let container;
let root;
let navigate;

beforeEach(async () => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  matchService.getOptions.mockResolvedValue({ combinations });
  navigate = jest.fn();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<BattleArena navigate={navigate} />));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  delete global.IS_REACT_ACT_ENVIRONMENT;
});

const option = (select, value) => [...select.options].find((entry) => entry.value === value);
const selectValue = (select, value) => act(() => {
  select.value = value;
  select.dispatchEvent(new Event('change', { bubbles: true }));
});

test('only Create Room has selectors and unavailable combinations are disabled in both directions', () => {
  const difficulty = container.querySelector('#match-difficulty');
  const topic = container.querySelector('#match-topic');
  expect(container.querySelectorAll('select').length).toBe(2);
  expect(difficulty.value).toBe('any');
  expect(topic.value).toBe('any');
  expect(option(difficulty, 'hard').disabled).toBe(true);
  selectValue(difficulty, 'easy');
  expect(option(topic, 'arrays').disabled).toBe(false);
  expect(option(topic, 'graph').disabled).toBe(true);
  selectValue(difficulty, 'any');
  selectValue(topic, 'graph');
  expect(option(difficulty, 'easy').disabled).toBe(true);
  expect(option(difficulty, 'medium').disabled).toBe(false);
});

test('creates the room on the backend using the selected filters and navigates with its code', async () => {
  selectValue(container.querySelector('#match-difficulty'), 'medium');
  selectValue(container.querySelector('#match-topic'), 'binary tree');
  const preferences = { difficulty: 'medium', topic: 'binary tree' };
  matchService.createRoom.mockResolvedValue({ roomCode: '1234ABCD', preferences });
  const create = [...container.querySelectorAll('button')].find((button) => button.textContent.trim() === 'CREATE ROOM');
  await act(async () => create.click());
  expect(matchService.createRoom).toHaveBeenCalledWith(preferences);
  expect(navigate).toHaveBeenCalledWith('game-room', { roomCode: '1234ABCD', preferences });
});

test('room creation failures are visible and do not navigate to an unregistered code', async () => {
  matchService.createRoom.mockRejectedValue(new Error('No supported problem matches this difficulty and topic.'));
  const create = [...container.querySelectorAll('button')].find((button) => button.textContent.trim() === 'CREATE ROOM');
  await act(async () => create.click());
  expect(container.querySelector('[role="alert"]').textContent).toContain('No supported problem');
  expect(navigate).not.toHaveBeenCalled();
  expect(create.disabled).toBe(false);
});
