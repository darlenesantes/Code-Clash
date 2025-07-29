import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Copy, Users, Target, Clock, 
  Shield, Zap, CheckCircle, AlertCircle, Wifi, WifiOff 
} from 'lucide-react';

const MatchLobby = ({ navigate, user }) => {
  const [activeTab, setActiveTab] = useState('quick-match');
  const [inputCode, setInputCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [isConnected, setIsConnected] = useState(true);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Generate random 6-digit room code
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Handle room creation
  const handleCreateRoom = async () => {
    if (!isConnected) {
      setError('Please wait for connection to establish.');
      return;
    }

    setIsCreatingRoom(true);
    setError('');

    try {
      const roomCode = generateRoomCode();
      setGeneratedCode(roomCode);
      
      // Navigate to game room immediately with the generated code
      setTimeout(() => {
        navigate('game-room', {
          roomCode: roomCode,
          difficulty: difficulty,
          isCreator: true
        });
      }, 1000);

      setSuccess('Room created! Redirecting to battle...');
    } catch (err) {
      setError('Failed to create room. Please try again.');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // Handle joining room
  const handleJoinRoom = async () => {
    if (inputCode.length !== 6) {
      setError('Please enter a valid 6-digit room code');
      return;
    }

    if (!isConnected) {
      setError('Please wait for connection to establish.');
      return;
    }

    setIsJoiningRoom(true);
    setError('');

    try {
      // Simulate room validation - accept any 6-digit code for demo
      const validRoomCodes = ['S270DU', 'ABC123', 'XYZ789', generatedCode];
      const isValidRoom = validRoomCodes.includes(inputCode.toUpperCase()) || inputCode.length === 6;

      if (isValidRoom) {
        setSuccess('Joining room...');
        
        // Navigate to game room immediately
        setTimeout(() => {
          navigate('game-room', {
            roomCode: inputCode.toUpperCase(),
            difficulty: 'Easy', // Default difficulty for joined rooms
            isCreator: false
          });
        }, 1000);
      } else {
        setError('Room not found. Please check the code.');
      }
    } catch (err) {
      setError('Failed to join room. Please try again.');
    } finally {
      setIsJoiningRoom(false);
    }
  };

  // Handle quick match
  const handleQuickMatch = async () => {
    if (!isConnected) {
      setError('Please wait for connection to establish.');
      return;
    }

    setError('');
    setSuccess('Finding opponent...');

    // Generate a room code for quick match
    const roomCode = generateRoomCode();
    
    setTimeout(() => {
      navigate('game-room', {
        roomCode: roomCode,
        difficulty: difficulty,
        isQuickMatch: true
      });
    }, 2000);
  };

  // Copy room code to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('Room code copied to clipboard!');
    }).catch(() => {
      setError('Failed to copy room code');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('dashboard')}
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 text-green-400">
                <Wifi className="w-4 h-4" />
                <span className="text-sm">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">Connecting...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Match Lobby</h1>
            <p className="text-gray-300">Choose your battle mode and start competing!</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 border border-gray-700">
              <button
                onClick={() => setActiveTab('quick-match')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  activeTab === 'quick-match'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Quick Match
              </button>
              <button
                onClick={() => setActiveTab('create-room')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  activeTab === 'create-room'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Create Room
              </button>
              <button
                onClick={() => setActiveTab('join-room')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  activeTab === 'join-room'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Join Room
              </button>
            </div>
          </div>

          {/* Error/Success Messages */}
          {(error || success) && (
            <div className="max-w-md mx-auto mb-6">
              {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {success}
                </div>
              )}
            </div>
          )}

          {/* Tab Content */}
          <div className="max-w-2xl mx-auto">
            {/* Quick Match Tab */}
            {activeTab === 'quick-match' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Quick Match</h2>
                  <p className="text-gray-300">Get matched with random opponents instantly</p>
                </div>

                {/* Difficulty Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Select Difficulty
                  </label>
                  <div className="flex justify-center gap-3">
                    {['Easy', 'Medium', 'Hard'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          difficulty === level
                            ? level === 'Easy' ? 'bg-green-600 text-white'
                              : level === 'Medium' ? 'bg-yellow-600 text-white'
                              : 'bg-red-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleQuickMatch}
                  disabled={!isConnected}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Find Opponent
                </button>
              </div>
            )}

            {/* Create Room Tab */}
            {activeTab === 'create-room' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Create Private Room</h2>
                  <p className="text-gray-300">Create a room and invite your friends to battle</p>
                </div>

                {/* Difficulty Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Select Difficulty
                  </label>
                  <div className="flex justify-center gap-3">
                    {['Easy', 'Medium', 'Hard'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          difficulty === level
                            ? level === 'Easy' ? 'bg-green-600 text-white'
                              : level === 'Medium' ? 'bg-yellow-600 text-white'
                              : 'bg-red-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generated Room Code Display */}
                {generatedCode && (
                  <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <p className="text-sm text-gray-300 mb-2">Your Room Code:</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl font-mono font-bold text-white tracking-wider">
                        {generatedCode}
                      </span>
                      <button
                        onClick={() => copyToClipboard(generatedCode)}
                        className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Share this code with your friend to join the battle
                    </p>
                  </div>
                )}

                <button
                  onClick={handleCreateRoom}
                  disabled={isCreatingRoom || !isConnected}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isCreatingRoom ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Room...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Create Battle Room
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Join Room Tab */}
            {activeTab === 'join-room' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Join Private Room</h2>
                  <p className="text-gray-300">Enter the room code shared by your friend</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code"
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white text-center font-mono text-lg tracking-wider placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    maxLength={6}
                  />
                </div>

                <button
                  onClick={handleJoinRoom}
                  disabled={isJoiningRoom || inputCode.length !== 6 || !isConnected}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isJoiningRoom ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Joining Room...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Join Battle
                    </>
                  )}
                </button>

                {/* Sample Room Codes for Demo */}
                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                  <p className="text-xs text-blue-300 mb-2">Demo Room Codes (for testing):</p>
                  <div className="flex justify-center gap-2 text-xs">
                    {['S270DU', 'ABC123', 'XYZ789'].map(code => (
                      <button
                        key={code}
                        onClick={() => setInputCode(code)}
                        className="px-2 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 rounded font-mono transition-colors"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchLobby;