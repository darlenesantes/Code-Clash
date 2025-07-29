import { io } from 'socket.io-client';

class GameSocket {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
  }

  connect(user) {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return;
    }

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
    
    console.log('Connecting to socket:', socketUrl);
    
    try {
      this.socket = io(socketUrl, {
        autoConnect: true,
        transports: ['websocket', 'polling'],
        timeout: 20000,
      });

      this.setupEventHandlers(user);
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }

  setupEventHandlers(user) {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      
      // Identify user to server
      if (user) {
        this.socket.emit('identify', {
          id: user.id,
          displayName: user.displayName || user.name,
          name: user.name,
          email: user.email
        });
      }
      
      this.emit('connection_status', { status: 'connected' });
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
      this.emit('connection_status', { status: 'disconnected' });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      this.emit('connection_status', { status: 'error', error: error.message });
    });

    // Game event handlers
    this.socket.on('game_started', (data) => {
      console.log('Game started event received:', data);
      this.emit('game_started', data);
    });

    this.socket.on('match_found', (data) => {
      console.log('Match found event received:', data);
      this.emit('match_found', data);
    });

    this.socket.on('room_created', (data) => {
      console.log('Room created event received:', data);
      this.emit('room_created', data);
    });

    this.socket.on('room_joined', (data) => {
      console.log('Room joined event received:', data);
      this.emit('room_joined', data);
    });

    this.socket.on('room_error', (data) => {
      console.log('Room error event received:', data);
      this.emit('room_error', data);
    });

    this.socket.on('player_joined', (data) => {
      console.log('Player joined event received:', data);
      this.emit('opponent_joined', data);
    });

    this.socket.on('player_disconnected', (data) => {
      console.log('Player disconnected event received:', data);
      this.emit('opponent_left', data);
    });

    this.socket.on('opponent_typing', (data) => {
      this.emit('opponent_typing', data);
    });

    this.socket.on('opponent_progress', (data) => {
      this.emit('opponent_progress', data);
    });

    this.socket.on('opponent_submitted', (data) => {
      this.emit('opponent_submitted', data);
    });

    this.socket.on('game_ended', (data) => {
      console.log('Game ended event received:', data);
      this.emit('game_ended', data);
    });

    this.socket.on('chat_message', (data) => {
      this.emit('chat_message', data);
    });

    this.socket.on('queue_update', (data) => {
      this.emit('queue_update', data);
    });

    // William's compatibility events
    this.socket.on('start_game', (data) => {
      console.log('Start game event received (William compatibility):', data);
      this.emit('game_started', data);
    });

    this.socket.on('server_message', (message) => {
      console.log('Server message received:', message);
      this.emit('server_message', message);
    });

    this.socket.on('error', (data) => {
      console.error('Socket error:', data);
      this.emit('error', data);
    });
  }

  // Event listener methods (for components to use)
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  removeAllListeners() {
    this.eventListeners.clear();
  }

  // Methods that your components expect
  onGameStarted(callback) {
    this.on('game_started', callback);
  }

  onMatchFound(callback) {
    this.on('match_found', callback);
  }

  onRoomCreated(callback) {
    this.on('room_created', callback);
  }

  onRoomJoined(callback) {
    this.on('room_joined', callback);
  }

  onRoomError(callback) {
    this.on('room_error', callback);
  }

  onOpponentJoined(callback) {
    this.on('opponent_joined', callback);
  }

  onOpponentLeft(callback) {
    this.on('opponent_left', callback);
  }

  onGameEnded(callback) {
    this.on('game_ended', callback);
  }

  onChatMessage(callback) {
    this.on('chat_message', callback);
  }

  onError(callback) {
    this.on('error', callback);
  }

  // Socket action methods
  joinRoom(roomCode, userInfo) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_room', {
        roomCode,
        userId: userInfo.id,
        username: userInfo.username || userInfo.displayName
      });
    } else {
      console.error('Socket not connected, cannot join room');
    }
  }

  createRoom(roomData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('create_room', roomData);
    } else {
      console.error('Socket not connected, cannot create room');
    }
  }

  joinMatchmaking(matchData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_matchmaking', matchData);
    } else {
      console.error('Socket not connected, cannot join matchmaking');
    }
  }

  leaveMatchmaking() {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_matchmaking');
    }
  }

  sendTyping(isTyping) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { isTyping });
    }
  }

  sendProgress(progressData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('progress_update', progressData);
    }
  }

  sendChatMessage(message) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat_message', { message });
    }
  }

  submitSolution(solutionData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('solution_submitted', solutionData);
    }
  }

  forfeitGame() {
    if (this.socket && this.isConnected) {
      this.socket.emit('forfeit');
    }
  }

  leaveRoom() {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_room');
    }
  }

  // Utility methods
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  getSocketId() {
    return this.socket ? this.socket.id : null;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

// Export singleton instance
const gameSocket = new GameSocket();
export default gameSocket;