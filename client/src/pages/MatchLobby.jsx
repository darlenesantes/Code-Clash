import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Copy, Users, Target, Clock, 
  Shield, Zap, CheckCircle, AlertCircle, Wifi, WifiOff 
} from 'lucide-react';
import gameSocket from '../sockets/socket';

/**
 * MatchLobby Component
 * Handles matchmaking, room creation, and room joining functionality
 * Uses GameSocket class for real-time multiplayer features
 */
const MatchLobby = ({ navigate, user, mode = 'quick' }) => {
  // State for managing different lobby modes
  const [matchMode, setMatchMode] = useState(mode); // 'quick', 'create', 'join'
  
  // Room and matchmaking state
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [isSearching, setIsSearching] = useState(false);
  
  // UI feedback state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [playersInQueue, setPlayersInQueue] = useState(0);
  
  const [language, setLanguage] = useState('python');   // python by defect
  const [category, setCategory] = useState('');         // empty means any
  const topics = ['arrays','linked list','graphs','trees'];

  // Available difficulty levels for problems
  const difficulties = [
    { id: 'easy', name: 'Easy', color: 'bg-green-500', description: 'Perfect for beginners' },
    { id: 'medium', name: 'Medium', color: 'bg-yellow-500', description: 'Balanced challenge' },
    { id: 'hard', name: 'Hard', color: 'bg-red-500', description: 'Expert level problems' }
  ];

  /**
   * Initialize GameSocket connection and event listeners when component mounts
   */
  useEffect(() => {
    console.log('=== MATCH LOBBY DEBUG START ===');
    console.log('User:', user);
    console.log('GameSocket isConnected:', gameSocket.isSocketConnected());
    
    setConnectionStatus('connecting');
    
    // Add connection timeout
    const connectionTimeout = setTimeout(() => {
      if (!gameSocket.isSocketConnected()) {
        console.error('Socket failed to connect within 10 seconds');
        setConnectionStatus('disconnected');
        setError('Cannot connect to game server. Please check if the backend is running on http://localhost:3001');
      }
    }, 10000);
    
    // Connect socket using GameSocket class method
    if (!gameSocket.isSocketConnected()) {
      console.log('Attempting to connect gameSocket...');
      if (user && user.id) {
        gameSocket.connect(user);
        console.log('GameSocket connect() called with user:', user);
      } else {
        console.error('No user data available for socket connection');
        setError('User data not available. Please log in again.');
        return () => clearTimeout(connectionTimeout);
      }
    } else {
      console.log('GameSocket already connected');
      setConnectionStatus('connected');
    }

    /**
     * GameSocket Event Handlers
     * These handle responses from the backend server
     */
    
    // Connection status handler
    const handleConnectionStatus = (data) => {
      console.log('Connection status update:', data);
      clearTimeout(connectionTimeout);
      if (data.status === 'connected') {
        setConnectionStatus('connected');
        setError('');
      } else if (data.status === 'disconnected') {
        setConnectionStatus('disconnected');
        setIsSearching(false);
      } else if (data.status === 'error') {
        setConnectionStatus('disconnected');
        setError('Connection failed. Please try again.');
      }
    };

    // Matchmaking event handlers
    const handleMatchFound = (data) => {
      console.log('Match found:', data);
      setIsSearching(false);
      setSuccess('Match found! Waiting for both players…');
    };

    const handleMatchCancelled = (data) => {
      console.log('Match cancelled:', data);
      setIsSearching(false);
      setError(data.reason || 'Match was cancelled. Please try again.');
    };

    // Queue status updates for matchmaking
    const handleQueueUpdate = (data) => {
      console.log('Queue update:', data);
      setPlayersInQueue(data.playersInQueue || 0);
    };

    // Private room event handlers
    const handleRoomCreated = (data) => {
      console.log('Room created:', data);
      setRoomCode(data.roomCode);
      setSuccess('Room created! Share the code with your friend.');
    };

    const handleRoomJoined = (data) => {
      console.log('Room joined:', data);
      setRoomCode(data.roomCode); 
      setSuccess('Room joined! Waiting for opponent...');
      
    };

    const handleStartGame = ({ roomCode: rc, problem, timeLimit }) => {
      console.log('🔥 [MatchLobby] start_game received:', { rc, problem, timeLimit });
      navigate('game-room', {
        roomCode: rc,
        problem,
        timeLimit: timeLimit || 600
        });
    };

    const handleRoomError = (data) => {
      console.log('Room error:', data);
      setError(data.message || 'Room error occurred.');
    };


    const handleError = (data) => {
      console.error('Socket error:', data);
      setError(data.message || 'An error occurred. Please try again.');
    };

    // Register all GameSocket event listeners using the class methods
    gameSocket.on('connection_status', handleConnectionStatus);
    gameSocket.on('match_found', handleMatchFound);
    gameSocket.on('match_cancelled', handleMatchCancelled);
    gameSocket.on('queue_update', handleQueueUpdate);
    gameSocket.on('room_created', handleRoomCreated);
    gameSocket.on('room_joined', handleRoomJoined);
    gameSocket.on('start_game', handleStartGame);
    gameSocket.on('room_error', handleRoomError);
    //gameSocket.on('game_started', handleGameStarted);
    gameSocket.on('error', handleError);

    // Cleanup function - removes event listeners when component unmounts
    return () => {
      clearTimeout(connectionTimeout);
      console.log('Cleaning up GameSocket listeners...');
      gameSocket.off('connection_status', handleConnectionStatus);
      gameSocket.off('match_found', handleMatchFound);
      gameSocket.off('match_cancelled', handleMatchCancelled);
      gameSocket.off('queue_update', handleQueueUpdate);
      gameSocket.off('room_created', handleRoomCreated);
      gameSocket.off('room_joined', handleRoomJoined);
      gameSocket.off('start_game', handleStartGame);
      gameSocket.off('room_error', handleRoomError);
      //gameSocket.off('game_started', handleGameStarted);
      gameSocket.off('error', handleError);
      
      // Leave any active matchmaking when component unmounts
      if (isSearching) {
        gameSocket.leaveMatchmaking();
      }
    };
  }, [user, navigate, isSearching]);

  /**
   * Clear error and success messages after a delay
   */
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  /**
   * Create a private room with selected difficulty
   */
  const generateRoomCode = () => {
      if (!gameSocket.isSocketConnected()) {
        setError('Please wait for connection to establish.');
        return;
      }

      console.log('Creating room with:', { difficulty, language, category });

      gameSocket.createRoom({
        difficulty,
        language,
        category,
        creator: {
          id: user.id,
          username: user.username
        }
      });
    };

  /**
   * Copy room code to clipboard for sharing
   */
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
      .then(() => {
        setSuccess('Room code copied to clipboard!');
      })
      .catch(() => {
        setError('Failed to copy room code');
      });
  };

  /**
   * Start quick matchmaking with selected difficulty
   */
  const handleQuickMatch = () => {
    // Validate connection status
    if (!gameSocket.isSocketConnected()) {
      setError('Please wait for connection to establish.');
      return;
    }

    setIsSearching(true);
    setError('');
    
    console.log('Joining matchmaking with difficulty:', difficulty);
    
    // Use GameSocket class method to join matchmaking
    gameSocket.joinMatchmaking({
      difficulty: difficulty,
      language: 'any', // Accept any programming language
      mode: 'quick'
    });
  };

  /**
   * Cancel active matchmaking search
   */
  const handleCancelMatch = () => {
    setIsSearching(false);
    gameSocket.leaveMatchmaking();
    setPlayersInQueue(0);
  };

  /**
   * Join a private room using room code
   */
  const handleJoinRoom = () => {
    // Validate room code format
    if (inputCode.length !== 6) {
      setError('Please enter a valid 6-digit room code');
      return;
    }

    // Check connection status
    if (!gameSocket.isSocketConnected()) {
      setError('Please wait for connection to establish.');
      return;
    }
    
    setError('');
    console.log('Joining room with code:', inputCode);
    
    // Use GameSocket class method to join room
    gameSocket.joinRoom(inputCode, {
      id: user?.id,
      username: user?.username
    });
  };

  /**
   * Render connection status indicator
   */
  const renderConnectionStatus = () => {
    const statusConfig = {
      connecting: { 
        icon: Wifi, 
        color: 'text-yellow-400', 
        text: 'Connecting...', 
        bgColor: 'bg-yellow-500/10' 
      },
      connected: { 
        icon: Wifi, 
        color: 'text-green-400', 
        text: 'Connected', 
        bgColor: 'bg-green-500/10' 
      },
      disconnected: { 
        icon: WifiOff, 
        color: 'text-red-400', 
        text: 'Disconnected', 
        bgColor: 'bg-red-500/10' 
      }
    };
    
    const config = statusConfig[connectionStatus] || statusConfig.connecting;
    const Icon = config.icon;
    
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bgColor}`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
        {gameSocket.isSocketConnected() && (
          <span className="text-xs text-gray-500">
            ID: {gameSocket.getSocketId()?.slice(-4)}
          </span>
        )}
      </div>
    );
  };

  /**
   * Render quick match interface
   */
  const renderQuickMatch = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="w-16 h-16 text-blue-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Quick Match</h2>
        <p className="text-gray-400">Get matched with an opponent of similar skill level</p>
        {playersInQueue > 0 && (
          <p className="text-blue-400 text-sm mt-2">{playersInQueue} players in queue</p>
        )}
      </div>

      {!isSearching ? (
        <>
          {/* Difficulty Selection */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Choose Difficulty</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {difficulties.map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => setDifficulty(diff.id)}
                  disabled={!gameSocket.isSocketConnected()}
                  className={`p-4 rounded-xl text-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    difficulty === diff.id
                      ? 'ring-4 ring-blue-400 bg-gray-700'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className={`w-4 h-4 ${diff.color} rounded-full mx-auto mb-2`} />
                  <div className="text-white font-semibold">{diff.name}</div>
                  <div className="text-gray-400 text-sm">{diff.description}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleQuickMatch}
            disabled={!gameSocket.isSocketConnected()}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {gameSocket.isSocketConnected() ? 'Find Match' : 'Connecting...'}
          </button>
        </>
      ) : (
        // Searching state UI
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Finding your opponent...</h3>
          <p className="text-gray-400 mb-2">Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
          {playersInQueue > 0 && (
            <p className="text-blue-400 text-sm mb-4">{playersInQueue} players in queue</p>
          )}
          <p className="text-gray-400 mb-4">This usually takes 10-30 seconds</p>
          <button
            onClick={handleCancelMatch}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Cancel Search
          </button>
        </div>
      )}
    </div>
  );

  /**
   * Render create room interface
   */
  const renderCreateRoom = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Create Private Room</h2>
        <p className="text-gray-400">Create a room and invite your friends to battle</p>
      </div>

      {!roomCode ? (
        // Room creation form
        <>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Choose Difficulty</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {difficulties.map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => setDifficulty(diff.id)}
                  disabled={!gameSocket.isSocketConnected()}
                  className={`p-4 rounded-xl text-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    difficulty === diff.id
                      ? 'ring-4 ring-purple-400 bg-gray-700'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className={`w-4 h-4 ${diff.color} rounded-full mx-auto mb-2`} />
                  <div className="text-white font-semibold">{diff.name}</div>
                  <div className="text-gray-400 text-sm">{diff.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Selection */}
<div className="mt-6">
  <h3 className="text-lg font-semibold text-white mb-2">Choose Topic</h3>
  <div className="flex flex-wrap gap-2">
    {topics.map(t => (
      <button
        key={t}
        onClick={() => setCategory(t)}
        className={`px-3 py-1 rounded ${
          category === t
            ? 'bg-purple-500 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        {t}
      </button>
    ))}
    {/* Botón para "Any" */}
    <button
      onClick={() => setCategory('')}
      className={`px-3 py-1 rounded ${
        category === ''
          ? 'bg-purple-500 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      Any
    </button>
  </div>
</div>

          <button
            onClick={generateRoomCode}
            disabled={!gameSocket.isSocketConnected()}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {gameSocket.isSocketConnected() ? 'Create Room' : 'Connecting...'}
          </button>
        </>
      ) : (
        // Room created - show code
        <div className="text-center">
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Room Code</h3>
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <div className="text-3xl font-mono font-bold text-blue-400 tracking-wider">
                {roomCode}
              </div>
            </div>
            <button
              onClick={copyRoomCode}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Copy className="w-4 h-4" />
              Copy Code
            </button>
          </div>
          
          <p className="text-gray-400 mb-4">Share this code with your friend to start the battle!</p>
          <div className="text-sm text-gray-500 mb-4">
            Waiting for opponent to join...
          </div>
        </div>
      )}
    </div>
  );

  /**
   * Render join room interface
   */
  const renderJoinRoom = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Join Private Room</h2>
        <p className="text-gray-400">Enter the room code shared by your friend</p>
      </div>

      <div>
        <label className="block text-white font-semibold mb-2">Room Code</label>
        <input
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.toUpperCase())}
          placeholder="Enter 6-digit code"
          maxLength={6}
          disabled={!gameSocket.isSocketConnected()}
          className="w-full px-4 py-4 bg-gray-700 text-white text-center text-2xl font-mono tracking-wider rounded-xl border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <button
        onClick={handleJoinRoom}
        disabled={inputCode.length !== 6 || !gameSocket.isSocketConnected()}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {gameSocket.isSocketConnected() ? 'Join Battle' : 'Connecting...'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="relative z-50 px-6 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          
          <h1 className="text-2xl font-bold text-white">Match Lobby</h1>
          
          {/* Show connection status in header */}
          {renderConnectionStatus()}
        </div>
      </header>

      {/* Mode Selection Tabs */}
      <div className="px-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex bg-gray-800/50 rounded-xl p-2">
            {[
              { id: 'quick', name: 'Quick Match', icon: Target },
              { id: 'create', name: 'Create Room', icon: Users },
              { id: 'join', name: 'Join Room', icon: Shield }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMatchMode(tab.id)}
                disabled={!gameSocket.isSocketConnected()}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  matchMode === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-semibold">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
            {/* Render appropriate interface based on selected mode */}
            {matchMode === 'quick' && renderQuickMatch()}
            {matchMode === 'create' && renderCreateRoom()}
            {matchMode === 'join' && renderJoinRoom()}

            {/* Error and Success Messages */}
            {error && (
              <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-green-400">{success}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchLobby;