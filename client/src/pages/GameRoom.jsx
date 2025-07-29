import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowLeft, Play, Send, Flag, Clock, User, 
  CheckCircle, XCircle, Code, MessageCircle,
  Trophy, Target, Zap, Wifi, WifiOff
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import gameSocket from '../sockets/socket';


const GameRoom = ({ navigate, user, roomData }) => {
  // Game state
  const [gameState, setGameState] = useState('waiting'); // waiting, active, completed
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [testResults, setTestResults] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [gameResult, setGameResult] = useState(null);
  const [submitTimestamp, setSubmitTimestamp] = useState(null);

  
  // Opponent state
  const [opponent, setOpponent] = useState({
    username: 'Waiting for opponent...',
    avatar: { theme: 'coder', color: 'gray' },
    progress: 0,
    isTyping: false,
    lastSeen: 'offline',
    linesOfCode: 0,
    isConnected: false
  });
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Refs for cleanup
  const typingTimeoutRef = useRef(null);
  const progressTimeoutRef = useRef(null);
  
  // Sample problem (will come from server)
    const [problem, setProblem] = useState(null);

  // Starter code
  const starterCode = {
    javascript: `function twoSum(nums, target) {
    // Your code here
    
}`,
    python: `def two_sum(nums, target):
    # Your code here
    pass`,
    java: `public int[] twoSum(int[] nums, int target) {
    // Your code here
    return new int[2];
}`
  };

  /**
   * Initialize socket connection and event handlers
   */
  useEffect(() => {
    console.log('=== GAME ROOM INITIALIZATION ===');
    console.log('User:', user);
    console.log('Room Data:', roomData);
    
    // Connect socket if not already connected
    if (!gameSocket.isSocketConnected()) {
      gameSocket.connect(user);
    }

    /**
     * Socket Event Handlers
     */

    // Connection status updates
    const handleConnectionStatus = (data) => {
      console.log('Connection status update:', data);
      if (data.status === 'connected') {
        setConnectionStatus('connected');
      } else if (data.status === 'disconnected') {
        setConnectionStatus('disconnected');
      }
    };

    // Match found (from matchmaking)
    const handleMatchFound = (data) => {
      console.log('Match found:', data);
      setGameState('waiting');
    };

    // William's start_game event
    const handleStartGame = (data) => {
      console.log('🔥 [GameRoom] start_game payload:', data);
      setGameState('active');
      if (data.problem) {
        console.log('📦 [GameRoom] setting problem:', data.problem);
        setProblem(data.problem);
        setCode(data.problem.functionSignature[language] || '');
      }
      setTimeLeft(data.timeLimit || 600);
      setChatMessages([{ 
        id: Date.now(), 
        sender: 'system', 
        message: 'Battle started! Good luck!',
        timestamp: Date.now()
      }]);
    };

    // Alternative game_started event
    const handleGameStarted = (data) => {
      console.log('Game started:', data);
      setGameState('active');
      if (data.problem) {
        setProblem(data.problem);
      }
      setTimeLeft(data.timeLimit || 600);
      setChatMessages([{ 
        id: Date.now(), 
        sender: 'system', 
        message: 'Battle started! Good luck!',
        timestamp: Date.now()
      }]);
    };

    // William's server_message handler
    const handleServerMessage = (message) => {
      console.log('Server message:', message);
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'system',
        message: message,
        timestamp: Date.now()
      }]);
    };

    // Opponent events
    const handleOpponentJoined = (data) => {
      console.log('Opponent joined:', data);
      setOpponent(prev => ({
        ...prev,
        username: data.username || data.user?.username || 'Opponent',
        avatar: data.avatar || data.user?.avatar || { theme: 'coder', color: 'red' },
        isConnected: true
      }));
      setConnectionStatus('connected');
    };

    const handleOpponentLeft = (data) => {
      console.log('Opponent left:', data);
      setOpponent(prev => ({
        ...prev,
        username: 'Opponent disconnected',
        isConnected: false,
        isTyping: false
      }));
      setConnectionStatus('opponent_disconnected');
    };

    const handleOpponentTyping = (data) => {
      setOpponent(prev => ({ ...prev, isTyping: true, lastSeen: 'typing...' }));
    };

    const handleOpponentStoppedTyping = (data) => {
      setOpponent(prev => ({ ...prev, isTyping: false, lastSeen: 'just now' }));
    };

    const handleOpponentProgress = (data) => {
      setOpponent(prev => ({
        ...prev,
        progress: data.progress || 0,
        linesOfCode: data.linesOfCode || 0,
        lastSeen: 'just now'
      }));
    };

    const handleOpponentSubmitted = (data) => {
      console.log('Opponent submitted solution');
      setOpponent(prev => ({ ...prev, lastSeen: 'submitted solution' }));
    };

    // Game end events
    const handleGameEnded = (data) => {
      console.log('Game ended:', data);
      setGameState('completed');
      setGameResult(data);
    };

    // Chat events
    const handleChatMessage = (data) => {
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'opponent',
        message: data.message,
        timestamp: data.timestamp || Date.now()
      }]);
    };

    // Error handling
    const handleError = (data) => {
      console.error('Game error:', data);
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'system',
        message: `Error: ${data.message || 'Something went wrong'}`,
        timestamp: Date.now()
      }]);
    };

    /**
     * Register all socket event listeners
     */
    
    // GameSocket class events
    gameSocket.on('connection_status', handleConnectionStatus);
    gameSocket.on('match_found', handleMatchFound);
    gameSocket.on('game_started', handleGameStarted);
    gameSocket.on('opponent_joined', handleOpponentJoined);
    gameSocket.on('opponent_left', handleOpponentLeft);
    gameSocket.on('opponent_typing', handleOpponentTyping);
    gameSocket.on('opponent_stopped_typing', handleOpponentStoppedTyping);
    gameSocket.on('opponent_progress', handleOpponentProgress);
    gameSocket.on('opponent_submitted', handleOpponentSubmitted);
    gameSocket.on('game_ended', handleGameEnded);
    gameSocket.on('chat_message', handleChatMessage);
    gameSocket.on('error', handleError);

    const onSubmissionResult = ({ output, allPassed, winner }) => {
  handleSubmissionResult({ output });  // still uses your existing parser
  setIsSubmitting(false);              // stop the spinner
  if (allPassed) {
    setGameState('completed');
    setGameResult({
      winner,
      reason: 'solution_correct',
      solveTime: Date.now() - submitTimestamp,
      coinsEarned: 50,
      xpEarned: 25
    });
  }
};

gameSocket.on('submission_result', onSubmissionResult);


    // William's direct socket events
      const handleSubmissionResult = ({ passed, output }) => {
        const lines = output.split(/\r?\n/);
        const results = lines
          .map(raw => {
            const m = raw.match(/^(✅|❌)\s*Test\s*(\d+):\s*(.+)$/);
            return m ? { id: Number(m[2]), passed: m[1] === '✅', text: raw } : null;
          })
          .filter(r => r !== null);
        setTestResults(results);
        setIsSubmitting(false); // this line is OK to keep here too for fallback
      };

    /**
     * Cleanup function
     */
    return () => {
      console.log('Cleaning up GameRoom event listeners...');
      
      // Remove GameSocket class event listeners
      gameSocket.off('connection_status', handleConnectionStatus);
      gameSocket.off('match_found', handleMatchFound);
      gameSocket.off('game_started', handleGameStarted);
      gameSocket.off('opponent_joined', handleOpponentJoined);
      gameSocket.off('opponent_left', handleOpponentLeft);
      gameSocket.off('opponent_typing', handleOpponentTyping);
      gameSocket.off('opponent_stopped_typing', handleOpponentStoppedTyping);
      gameSocket.off('opponent_progress', handleOpponentProgress);
      gameSocket.off('opponent_submitted', handleOpponentSubmitted);
      gameSocket.off('game_ended', handleGameEnded);
      gameSocket.off('chat_message', handleChatMessage);
      gameSocket.off('error', handleError);
      gameSocket.off('submission_result', onSubmissionResult);




      // Remove William's direct socket events
      if (gameSocket.socket) {
        gameSocket.socket.off('start_game', handleStartGame);
        gameSocket.socket.off('server_message', handleServerMessage);
      }

      // Clear timeouts
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
    };
  }, [user, roomData]);

  useEffect(() => {
  if (roomData?.problem) {
    console.log('💡 [GameRoom] init from navigation:', roomData.problem);
    setProblem(roomData.problem);
    setGameState('active');
    setCode(roomData.problem.functionSignature[language] || '');
    if (roomData.timeLimit) {
      setTimeLeft(roomData.timeLimit);
    }
  }
}, [roomData, language]);

  /**
   * Timer effect - handles countdown
   */
  useEffect(() => {
    if (gameState === 'active' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up!
            setGameState('completed');
            setGameResult({ winner: null, reason: 'timeout' });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft]);

  //Restart de code every time you change language
  useEffect(() => {
  if (problem) {
    setCode(problem.functionSignature[language] || '');
  }
  }, [language, problem]);
  

  /*
   * Handle typing indicators and progress updates
   */
  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
    
    // Send typing indicator
    if (!opponent.isTyping) {
      gameSocket.sendTyping(true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      gameSocket.sendTyping(false);
    }, 2000);
    
    // Send progress update (debounced)
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
    }
    
    progressTimeoutRef.current = setTimeout(() => {
      const linesOfCode = newCode.split('\n').filter(line => line.trim()).length;
      const progress = Math.min((linesOfCode / 20) * 100, 95); // Estimate progress
      
      gameSocket.sendProgress({
        linesOfCode,
        progress: Math.round(progress),
        language
      });
    }, 1000);
  }, [language, opponent.isTyping]);

  /**
   * Format time display
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Handle code submission
   */
  const handleSubmit = async () => {
    if (!code.trim()) return;

    setSubmitTimestamp(Date.now());
    setIsSubmitting(true);
    
    // Send submission via socket
    gameSocket.submitSolution({
      roomCode: roomData.roomCode,
      code: code.trim(),
      language,
      submissionTime: Date.now()
    });
    
    // Simulate test execution (real implementation would wait for server response)
  };

  /**
   * Handle chat message sending
   */
  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: 'you',
        message: newMessage.trim(),
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, message]);
      gameSocket.sendChatMessage(newMessage);
      setNewMessage('');
    }
  };

  /**
   * Handle game forfeit
   */
  const handleForfeit = () => {
    if (window.confirm('Are you sure you want to forfeit this battle?')) {
      gameSocket.forfeitGame();
      setGameState('completed');
      setGameResult({ 
        winner: opponent.username, 
        reason: 'forfeit',
        coinsLost: 10
      });
    }
  };

  /**
   * Handle leaving the room
   */
  const handleLeaveRoom = () => {
    if (gameState === 'active') {
      if (window.confirm('Leaving will forfeit the battle. Are you sure?')) {
        gameSocket.leaveRoom();
        navigate('dashboard');
      }
    } else {
      gameSocket.leaveRoom();
      navigate('dashboard');
    }
  };

  /**
   * Render connection status indicator
   */
  const renderConnectionStatus = () => {
    const statusConfig = {
      connecting: { icon: Wifi, color: 'text-yellow-400', text: 'Connecting...' },
      connected: { icon: Wifi, color: 'text-green-400', text: 'Connected' },
      opponent_disconnected: { icon: WifiOff, color: 'text-red-400', text: 'Opponent disconnected' },
      disconnected: { icon: WifiOff, color: 'text-red-400', text: 'Disconnected' }
    };
    
    const config = statusConfig[connectionStatus] || statusConfig.connecting;
    const Icon = config.icon;
    
    return (
      <div className={`flex items-center gap-2 ${config.color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{config.text}</span>
      </div>
    );
  };

  /**
   * Render problem panel
   */
const renderProblemPanel = () => {
  // show loading until we find problem
  if (!problem) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 h-full flex items-center justify-center">
        <p className="text-gray-400 text-center">Waiting for problem…</p>
      </div>
    );
  }

  // once we get it, we renderize it
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 h-full overflow-y-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <h2 className="text-xl font-bold text-white">{problem.title}</h2>
        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold">
          {problem.difficulty}
        </span>
      </div>

      <div className="prose prose-invert max-w-none">
        <p className="text-gray-300 mb-6 leading-relaxed">{problem.description}</p>
        
        <div className="space-y-4">
          {problem.examples?.map((example, index) => (
            <div key={index} className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-sm font-semibold text-blue-400 mb-2">Example {index + 1}:</div>
              <div className="font-mono text-sm space-y-1">
                <div><span className="text-gray-400">Input:</span> <span className="text-white">{example.input}</span></div>
                <div><span className="text-gray-400">Output:</span> <span className="text-white">{example.output}</span></div>
                {example.explanation && (
                  <div><span className="text-gray-400">Explanation:</span> <span className="text-gray-300">{example.explanation}</span></div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="text-sm font-semibold text-gray-400 mb-2">Constraints:</div>
          <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
            {problem.constraints?.map((constraint, index) => (
              <li key={index} className="font-mono">{constraint}</li>
              ))}
              </ul>
            </div>
        </div>
      </div>
  );
};

  /**
   * Render code editor panel
   */
  const renderCodeEditor = () => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 h-full flex flex-col">
      {/* Editor Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            disabled={gameState !== 'active'}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
          
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Code className="w-4 h-4" />
            {code.split('\n').length} lines
          </div>
          
          {/* Connection Status */}
          {renderConnectionStatus()}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {/* Run tests locally */}}
            disabled={gameState !== 'active'}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Run
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || gameState !== 'active' || !code.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Submit
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-auto">
        <textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          className="w-full h-full bg-transparent text-white resize-none focus:outline-none"
          placeholder={gameState === 'waiting' ? 'Waiting for game to start...' : 'Start coding here...'}
          spellCheck={false}
          disabled={gameState !== 'active'}
        />
      </div>

{/* Test Results */}
{testResults.length > 0 && (
  <div className="mt-4 bg-gray-900/50 rounded-lg p-4">
    <div className="text-sm font-semibold text-white mb-3">Test Results:</div>
    <div className="space-y-2">
      {testResults.map(r => (
        <div key={r.id} className="flex items-center gap-3 text-sm">
          {r.passed ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
          {/* Aquí mostramos la línea completa del servidor */}
          <span className="text-gray-300">{r.text}</span>
        </div>
      ))}
    </div>
    {/* Resumen igual al estilo que prefieres */}
    <div className="mt-4 text-gray-300 text-sm">
      Result: {testResults.filter(r => r.passed).length}/{testResults.length} tests passed.{" "}
      {testResults.every(r => r.passed)
        ? <span className="text-green-400">All passed 🎉</span>
        : <span className="text-red-400">Some failed ✗</span>}
    </div>
  </div>
)}

    </div>
  );

  /**
   * Render opponent panel
   */
  const renderOpponentPanel = () => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 h-full">
      {/* Opponent Info */}
      <div className="flex items-center gap-3 mb-6">
        <Avatar theme={opponent.avatar.theme} color={opponent.avatar.color} size="md" />
        <div className="flex-1">
          <div className="text-white font-semibold">{opponent.username}</div>
          <div className="text-gray-400 text-sm flex items-center gap-1">
            {opponent.isConnected ? (
              opponent.isTyping ? (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  typing...
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  {opponent.lastSeen}
                </>
              )
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                offline
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Progress</span>
          <span className="text-white font-semibold">{opponent.progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${opponent.progress}%` }}
          />
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{opponent.linesOfCode}</div>
          <div className="text-gray-400 text-sm">Lines</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">0</div>
          <div className="text-gray-400 text-sm">Submissions</div>
        </div>
      </div>

      {/* Chat Toggle */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mb-4"
      >
        <MessageCircle className="w-4 h-4" />
        {isChatOpen ? 'Hide Chat' : 'Show Chat'}
        {chatMessages.length > 0 && !isChatOpen && (
          <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {chatMessages.filter(msg => msg.sender === 'opponent').length}
          </span>
        )}
      </button>

      {/* Chat */}
      {isChatOpen && (
        <div className="flex flex-col h-48">
          <div className="flex-1 bg-gray-900/50 rounded-lg p-3 overflow-y-auto mb-3">
            <div className="space-y-2">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`text-sm ${
                  msg.sender === 'you' ? 'text-blue-400' :
                  msg.sender === 'system' ? 'text-gray-400' : 'text-green-400'
                }`}>
                  <span className="font-semibold">
                    {msg.sender === 'you' ? 'You' : 
                     msg.sender === 'system' ? 'System' : opponent.username}:
                  </span> {msg.message}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              maxLength={200}
              className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 mt-4">
        {gameState === 'active' && (
          <button
            onClick={handleForfeit}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Flag className="w-4 h-4" />
            Forfeit
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="relative z-50 px-6 py-4 border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={handleLeaveRoom}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {gameState === 'active' ? 'Forfeit & Leave' : 'Leave Battle'}
          </button>

          {/* Timer */}
          <div className={`flex items-center gap-4 bg-gray-800/50 rounded-xl px-6 py-3 ${
            timeLeft < 60 ? 'bg-red-900/50 border border-red-500/30' : ''
          }`}>
            <Clock className={`w-5 h-5 ${timeLeft < 60 ? 'text-red-400' : 'text-blue-400'}`} />
            <div className={`text-2xl font-mono font-bold ${
              timeLeft < 60 ? 'text-red-400' : 'text-white'
            }`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-gray-400">remaining</div>
          </div>

          {/* Battle Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              gameState === 'active' ? 'bg-green-500 animate-pulse' :
              gameState === 'waiting' ? 'bg-yellow-500 animate-pulse' :
              'bg-gray-500'
            }`}></div>
            <span className={`font-semibold ${
              gameState === 'active' ? 'text-green-400' :
              gameState === 'waiting' ? 'text-yellow-400' :
              'text-gray-400'
            }`}>
              {gameState === 'active' ? 'Live Battle' :
               gameState === 'waiting' ? 'Waiting for Opponent' :
               'Battle Ended'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Battle Interface */}
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
            {/* Problem Panel */}
            <div className="col-span-12 lg:col-span-3">
              {renderProblemPanel()}
            </div>

            {/* Code Editor Panel */}
            <div className="col-span-12 lg:col-span-6">
              {renderCodeEditor()}
            </div>

            {/* Opponent Panel */}
            <div className="col-span-12 lg:col-span-3">
              {renderOpponentPanel()}
            </div>
          </div>
        </div>
      </div>

      {/* Victory/Defeat Modal */}
      {gameState === 'completed' && gameResult && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-8 text-center max-w-md mx-4">
            {gameResult.winner === user.id ? (
              <>
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Victory!</h2>
                <p className="text-gray-400 mb-6">
                  {gameResult.reason === 'solution_correct' ? 'You solved the problem first!' :
                   gameResult.reason === 'opponent_forfeit' ? 'Your opponent forfeited!' :
                   'You won the battle!'}
                </p>
                
                {gameResult.solveTime && (
                  <div className="text-gray-300 mb-4">
                    Solved in {formatTime(gameResult.solveTime)}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">+{gameResult.coinsEarned || 50}</div>
                    <div className="text-gray-400 text-sm">Coins</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">+{gameResult.xpEarned || 25}</div>
                    <div className="text-gray-400 text-sm">XP</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Defeat</h2>
                <p className="text-gray-400 mb-6">
                  {gameResult.reason === 'solution_correct' ? 'Your opponent solved the problem first!' :
                   gameResult.reason === 'forfeit' ? 'You forfeited the battle.' :
                   gameResult.reason === 'timeout' ? 'Time ran out!' :
                   'Better luck next time!'}
                </p>
                
                {gameResult.coinsLost && (
                  <div className="text-center mb-6">
                    <div className="text-2xl font-bold text-red-400">-{gameResult.coinsLost}</div>
                    <div className="text-gray-400 text-sm">Coins</div>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => navigate('dashboard')}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('match-lobby')}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition-colors"
              >
                Next Battle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRoom;