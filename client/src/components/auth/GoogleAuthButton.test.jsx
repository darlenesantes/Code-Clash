import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import GoogleAuthButton from './GoogleAuthButton';
import authService from '../../services/api/authService';

jest.mock('../../services/api/authService', () => ({ googleAuth: jest.fn() }));

let container;
let root;
let onSuccess;
let onError;
let googleId;

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  onSuccess = jest.fn();
  onError = jest.fn();
  googleId = { initialize: jest.fn(), renderButton: jest.fn(), prompt: jest.fn() };
  googleId.renderButton.mockImplementation((target) => {
    const button = document.createElement('button');
    button.textContent = 'Continue with Google';
    target.appendChild(button);
  });
  window.google = { accounts: { id: googleId } };
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  delete window.google;
  delete global.IS_REACT_ACT_ENVIRONMENT;
});

const render = (disabled = false) => act(() => root.render(
  <GoogleAuthButton onSuccess={onSuccess} onError={onError} disabled={disabled} />
));

test('renders the official popup button immediately without calling One Tap', async () => {
  render();
  expect(googleId.initialize).toHaveBeenCalledWith(expect.objectContaining({ ux_mode: 'popup' }));
  expect(container.querySelector('button').textContent).toBe('Continue with Google');
  expect(googleId.prompt).not.toHaveBeenCalled();
  const user = { name: 'Player' };
  authService.googleAuth.mockResolvedValue({ success: true, user });
  await act(async () => googleId.initialize.mock.calls[0][0].callback({ credential: 'test-token' }));
  expect(authService.googleAuth).toHaveBeenCalledWith('test-token');
  expect(onSuccess).toHaveBeenCalledWith(user);
});

test('loads the SDK when needed and reports loading failure', () => {
  delete window.google;
  render();
  const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
  expect(script).not.toBeNull();
  act(() => script.dispatchEvent(new Event('error')));
  expect(onError).toHaveBeenCalledWith(expect.stringContaining('Unable to load'));
  expect(container.textContent).not.toContain('Loading Google Services...');
});

test('blocks disabled sign-in and prevents duplicate backend requests while pending', async () => {
  authService.googleAuth.mockClear();
  render(true);
  const callback = googleId.initialize.mock.calls[0][0].callback;
  await act(async () => callback({ credential: 'test-token' }));
  expect(authService.googleAuth).not.toHaveBeenCalled();
  render();
  let resolve;
  authService.googleAuth.mockImplementation(() => new Promise((done) => { resolve = done; }));
  let pending;
  act(() => { pending = callback({ credential: 'test-token' }); });
  expect(container.textContent).toContain('Signing in...');
  expect(container.querySelector('[aria-disabled]').inert).toBe(true);
  await act(async () => callback({ credential: 'test-token' }));
  expect(authService.googleAuth).toHaveBeenCalledTimes(1);
  await act(async () => {
    resolve({ success: false, error: 'Login rejected' });
    await pending;
  });
  expect(onError).toHaveBeenCalledWith('Login rejected');
  expect(container.querySelector('[aria-disabled]').inert).toBe(false);
});
