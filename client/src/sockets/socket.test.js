import { io } from 'socket.io-client';
import gameSocket from './socket';

jest.mock('socket.io-client', () => ({ io: jest.fn() }));

test('reconnections send the private token and assign the stable player ID before delivering state', async () => {
  const handlers = {};
  const socket = { id: 'old-transport', connected: true, emit: jest.fn(), disconnect: jest.fn(),
    on: (event, handler) => { handlers[event] = handler; }, timeout: jest.fn() };
  socket.timeout.mockReturnValue(socket);
  io.mockReturnValue(socket);
  const token = 'private-random-token';
  const connected = ({ status }) => { if (status === 'connected') gameSocket.joinMatch('ROOM1234', 'Player', token); };
  const receiveState = jest.fn(() => expect(gameSocket.getPlayerId()).toBe('stable-player'));
  const receiveConnection = jest.fn();
  gameSocket.on('connection_status', connected);
  gameSocket.on('match_state', receiveState);
  gameSocket.on('player_connection', receiveConnection);
  gameSocket.connect({ id: 'account-1' });
  handlers.connect();
  expect(socket.emit).toHaveBeenCalledWith('join_match', { matchCode: 'ROOM1234', username: 'Player', resumeToken: token });
  handlers.match_state({ playerId: 'stable-player', status: 'active' });
  handlers.disconnect(); socket.id = 'new-transport'; handlers.connect();
  expect(gameSocket.getPlayerId()).toBe('stable-player');
  expect(gameSocket.getSocketId()).toBe('new-transport');
  expect(socket.emit.mock.calls.filter(([event]) => event === 'join_match')).toHaveLength(2);
  expect(receiveState).toHaveBeenCalledTimes(1);
  const presence = { playerId: 'opponent', connected: false, reconnectBy: 1234 };
  handlers.player_connection(presence);
  expect(receiveConnection).toHaveBeenCalledWith(presence);
  const departure = gameSocket.leaveMatch('ROOM1234', token);
  expect(socket.timeout).toHaveBeenCalledWith(1500);
  expect(socket.emit).toHaveBeenCalledWith('leave_match', { matchCode: 'ROOM1234', resumeToken: token }, expect.any(Function));
  socket.emit.mock.calls.at(-1)[2](null, { ok: true });
  expect(await departure).toBe(true);
  gameSocket.disconnect(); gameSocket.removeAllListeners();
});
