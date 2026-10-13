import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import VictoryPopup from './VictoryPopup';

let container;
let root;
let updateProfile;
let originalMatchMedia;

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  jest.useFakeTimers();
  originalMatchMedia = window.matchMedia;
  window.matchMedia = jest.fn(() => ({ matches: false }));
  updateProfile = jest.fn();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  expect(jest.getTimerCount()).toBe(0);
  jest.useRealTimers();
  window.matchMedia = originalMatchMedia;
  container.remove();
  delete global.IS_REACT_ACT_ENVIRONMENT;
});

const popup = (overrides = {}) => <VictoryPopup
  show user={{ wins: 5, coins: 100, totalEarnings: 2 }}
  rewards={{ bonusMultiplier: 1.5 }} onUpdateProfile={updateProfile}
  onClose={jest.fn()} {...overrides}
/>;

test('parent updates keep particles stable and do not repeat the profile update or restart the burst', () => {
  act(() => root.render(popup()));
  const particles = [...container.querySelectorAll('.victory-confetti-particle')];
  expect(particles.length).toBe(25);
  const styles = particles.map((particle) => particle.getAttribute('style'));
  expect(updateProfile).toHaveBeenCalledTimes(1);
  const laterUpdate = jest.fn();
  act(() => jest.advanceTimersByTime(600));
  act(() => root.render(popup({ user: { wins: 6 }, rewards: { bonusMultiplier: 1 }, onUpdateProfile: laterUpdate })));
  expect([...container.querySelectorAll('.victory-confetti-particle')].map((particle) => particle.getAttribute('style'))).toEqual(styles);
  act(() => jest.advanceTimersByTime(2400));
  expect(container.querySelector('.victory-confetti')).toBeNull();
  expect(container.textContent).toContain('250 Coins');
  expect(container.textContent).toContain('$1.25');
  expect(container.textContent).toContain('1.5x!');
  expect(updateProfile).toHaveBeenCalledTimes(1);
  expect(laterUpdate).not.toHaveBeenCalled();
  expect(jest.getTimerCount()).toBe(0);
});

test.each([0, 600])('hiding the popup at %i ms clears pending timers and running intervals', (elapsed) => {
  act(() => root.render(popup()));
  act(() => jest.advanceTimersByTime(elapsed));
  expect(jest.getTimerCount()).toBeGreaterThan(0);
  act(() => root.render(popup({ show: false })));
  expect(container.textContent).toBe('');
  expect(jest.getTimerCount()).toBe(0);
  expect(updateProfile).toHaveBeenCalledTimes(1);
});

test('reduced motion skips particles and counter animation while showing final values', () => {
  window.matchMedia.mockReturnValue({ matches: true });
  act(() => root.render(popup()));
  expect(container.querySelector('.victory-confetti')).toBeNull();
  expect(container.textContent).toContain('250 Coins');
  expect(container.textContent).toContain('$1.25');
  expect(jest.getTimerCount()).toBe(0);
  expect(updateProfile).toHaveBeenCalledTimes(1);
});

test('StrictMode effect replay does not duplicate the victory update or leak timers', () => {
  act(() => root.render(<StrictMode>{popup()}</StrictMode>));
  expect(updateProfile).toHaveBeenCalledTimes(1);
  act(() => jest.advanceTimersByTime(3000));
  expect(container.querySelector('.victory-confetti')).toBeNull();
  expect(jest.getTimerCount()).toBe(0);
});
