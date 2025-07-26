// client/src/sockets/socket.js - Update the port to 3001
import { io } from 'socket.io-client';

/**
 * GameSocket Class
 * Manages all socket connections and real-time game events
 * Singleton pattern ensures one connection across the entire app
 */
class GameSocket {
  constructor() {
    this.socket = null;
    this.gameCallbacks = {};
    this.isConnected = false;
  }

  /**
   * Initialize socket connection with user authentication
   * @param {Object} user - User object containing id and username
   */
  connect(user) {
    // Prevent multiple connections
    if (this.socket) return;

    // FIXED: Changed port from 5000 to 3001 to match your backend
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
    
    console.log('=== SOCKET CONNECTION DEBUG ===');
    console.log('Connecting to:', socketUrl);
    console.log('User data:', user);
    
    this.socket = io(socketUrl, {
      auth: {
        sessionId: localStorage.getItem('codeclash_session_id'),
        userId: user?.id,
        username: user?.username
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventListeners();
    console.log('Socket connecting to:', socketUrl);
  }

  /**
   * Setup all socket event listeners
   * Handles both connection events and game-specific events
   */
  setupEventListeners() {
    // Connection status events
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      this.emit('connection_status', { status: 'connected', socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.emit('connection_status', { status: 'disconnected', reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.emit('connection_status', { status: 'error', error });
    });

    // Matchmaking events
    this.socket.on('match_found', (data) => {
      console.log('Match found:', data);
      this.emit('match_found', data);
    });

    this.socket.on('match_cancelled', (data) => {
      console.log('Match cancelled:', data);
      this.emit('match_cancelled', data);
    });

    this.socket.on('queue_update', (data) => {
      console.log('Queue update:', data);
      this.emit('queue_update', data);
    });

    // Private room events
    this.socket.on('room_created', (data) => {
      console.log('Room created:', data);
      this.emit('room_created', data);
    });

    this.socket.on('room_joined', (data) => {
      console.log('Room joined:', data);
      this.emit('room_joined', data);
    });

    this.socket.on('room_error', (data) => {
      console.log('Room error:', data);
      this.emit('room_error', data);
    });

    // Game session events
    this.socket.on('game_started', (data) => {
      console.log('Game started:', data);
      this.emit('game_started', data);
    });

    this.socket.on('opponent_joined', (data) => {
      console.log('Opponent joined:', data);
      this.emit('opponent_joined', data);
    });

    this.socket.on('opponent_left', (data) => {
      console.log('Opponent left:', data);
      this.emit('opponent_left', data);
    });

    // Real-time game events during battle
    this.socket.on('opponent_typing', (data) => {
      this.emit('opponent_typing', data);
    });

    this.socket.on('opponent_stopped_typing', (data) => {
      this.emit('opponent_stopped_typing', data);
    });

    this.socket.on('opponent_progress', (data) => {
      this.emit('opponent_progress', data);
    });

    this.socket.on('opponent_submitted', (data) => {
      console.log('Opponent submitted:', data);
      this.emit('opponent_submitted', data);
    });

    this.socket.on('game_ended', (data) => {
      console.log('Game ended:', data);
      this.emit('game_ended', data);
    });

    // Chat system events
    this.socket.on('chat_message', (data) => {
      this.emit('chat_message', data);
    });

    // General error handling
    this.socket.on('error', (data) => {
      console.error('Socket error:', data);
      this.emit('error', data);
    });
  }

  /**
   * Join the matchmaking queue
   * @param {Object} preferences - Matchmaking preferences
   */
  joinMatchmaking(preferences) {
    if (!this.socket) {
      console.warn('Socket not connected - cannot join matchmaking');
      return;
    }
    
    console.log('Joining matchmaking:', preferences);
    this.socket.emit('join_matchmaking', {
      difficulty: preferences.difficulty,
      language: preferences.language || 'any',
      mode: preferences.mode || 'quick'
    });
  }

  /**
   * Leave the matchmaking queue
   */
  leaveMatchmaking() {
    if (!this.socket) return;
    
    console.log('Leaving matchmaking');
    this.socket.emit('leave_matchmaking');
  }

  /**
   * Create a private room
   * @param {Object} roomData - Room configuration
   */
  createRoom(roomData) {
    if (!this.socket) {
      console.warn('Socket not connected - cannot create room');
      return;
    }
    
    console.log('Creating room:', roomData);
    this.socket.emit('create_room', {
      difficulty: roomData.difficulty,
      isPrivate: true,
      creator: roomData.creator
    });
  }

  /**
   * Join a private room using room code
   * @param {string} roomCode - 6-digit room code
   * @param {Object} player - Player information
   */
  joinRoom(roomCode, player) {
    if (!this.socket) {
      console.warn('Socket not connected - cannot join room');
      return;
    }
    
    console.log('Joining room:', roomCode);
    this.socket.emit('join_room', { 
      roomCode,
      player 
    });
  }

  /**
   * Leave current room
   */
  leaveRoom() {
    if (!this.socket) return;
    
    console.log('Leaving room');
    this.socket.emit('leave_room');
  }

  /**
   * Send typing indicator to opponent
   * @param {boolean} isTyping - Whether user is currently typing
   */
  sendTyping(isTyping) {
    if (!this.socket) return;
    
    if (isTyping) {
      this.socket.emit('typing_start');
    } else {
      this.socket.emit('typing_stop');
    }
  }

  /**
   * Send progress update to opponent
   * @param {Object} progressData - Progress information
   */
  sendProgress(progressData) {
    if (!this.socket) return;
    
    this.socket.emit('progress_update', {
      linesOfCode: progressData.linesOfCode,
      progress: progressData.progress,
      language: progressData.language
    });
  }

  /**
   * Submit solution for evaluation
   * @param {Object} solutionData - Code solution and metadata
   */
  submitSolution(solutionData) {
    if (!this.socket) {
      console.warn('Socket not connected - cannot submit solution');
      return;
    }
    
    console.log('Submitting solution');
    this.socket.emit('submit_solution', {
      code: solutionData.code,
      language: solutionData.language,
      submissionTime: Date.now()
    });
  }

  /**
   * Send chat message to opponent
   * @param {string} message - Chat message content
   */
  sendChatMessage(message) {
    if (!this.socket) return;
    
    this.socket.emit('chat_message', {
      message: message.trim(),
      timestamp: Date.now()
    });
  }

  /**
   * Forfeit the current game
   */
  forfeitGame() {
    if (!this.socket) return;
    
    console.log('Forfeiting game');
    this.socket.emit('forfeit_game');
  }

  /**
   * Register event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.gameCallbacks[event]) {
      this.gameCallbacks[event] = [];
    }
    this.gameCallbacks[event].push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   */
  off(event, callback) {
    if (this.gameCallbacks[event]) {
      this.gameCallbacks[event] = this.gameCallbacks[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Emit event to registered callbacks (internal method)
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    if (this.gameCallbacks[event]) {
      this.gameCallbacks[event].forEach(callback => callback(data));
    }
  }

  /**
   * Disconnect socket and clean up
   */
  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.gameCallbacks = {};
    }
  }

  /**
   * Check if socket is connected
   * @returns {boolean} Connection status
   */
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  /**
   * Get current socket ID
   * @returns {string|null} Socket ID or null if not connected
   */
  getSocketId() {
    return this.socket?.id || null;
  }
}

// Export singleton instance
export default new GameSocket();