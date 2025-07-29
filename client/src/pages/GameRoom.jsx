import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Play, Send, Clock, User, 
  CheckCircle, XCircle, Code, MessageCircle,
  Trophy, Target, Zap, Settings, Copy, 
  RotateCcw, Download, Users, Crown,
  Wifi, WifiOff, Swords
} from 'lucide-react';

import Avatar from '../components/ui/Avatar';
import VictoryPopup from '../components/VictoryPopup';

const GameRoom = ({ 
  navigate, 
  user, 
  roomCode, 
  difficulty = 'Easy',
  problem = null 
}) => {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [opponent, setOpponent] = useState(null);
  const [showReady, setShowReady] = useState(false);
  const [readyCountdown, setReadyCountdown] = useState(5);
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  
  // Victory popup states
  const [showVictoryPopup, setShowVictoryPopup] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [isFirstWin, setIsFirstWin] = useState(false);

  // Code editor state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [fontSize, setFontSize] = useState(14);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Chat and progress
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [opponentTyping, setOpponentTyping] = useState(false);
  const [myProgress, setMyProgress] = useState(0);

  // Current problem - fallback if none provided
  const [currentProblem, setCurrentProblem] = useState(problem || {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6", 
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    testCases: [
      { input: [[2,7,11,15], 9], expected: [0,1] },
      { input: [[3,2,4], 6], expected: [1,2] },
      { input: [[3,3], 6], expected: [0,1] }
    ]
  });

  const codeRef = useRef(null);

  // Demo opponent data
  const demoOpponents = [
    {
      id: 'demo_001',
      displayName: 'CodeNinja',
      picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CodeNinja',
      wins: 247,
      rank: 'Gold II'
    },
    {
      id: 'demo_002', 
      displayName: 'ByteBeast',
      picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ByteBeast',
      wins: 189,
      rank: 'Silver I'
    },
    {
      id: 'demo_003',
      displayName: 'AlgoWizard',
      picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlgoWizard',
      wins: 312,
      rank: 'Platinum III'
    }
  ];

  // Language templates
  const languageTemplates = {
    javascript: `function twoSum(nums, target) {
    // Your solution here
    
}`,
    python: `def two_sum(nums, target):
    # Your solution here
    pass`,
    java: `public int[] twoSum(int[] nums, int target) {
    // Your solution here
    return new int[0];
}`,
    cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    // Your solution here
    return {};
}`
  };

  // Add demo opponent after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!opponent) {
        const randomOpponent = demoOpponents[Math.floor(Math.random() * demoOpponents.length)];
        setOpponent(randomOpponent);
        
        // Show ready screen after opponent joins
        setTimeout(() => {
          setShowReady(true);
        }, 1000);

        // Add system message
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'system',
          message: `${randomOpponent.displayName} joined the battle!`,
          timestamp: new Date().toLocaleTimeString()
        }]);

        // Simulate opponent getting ready after 2 seconds
        setTimeout(() => {
          setOpponentReady(true);
        }, 2000);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [opponent]);

  // Set initial code template
  useEffect(() => {
    setCode(languageTemplates[language] || '');
  }, [language]);

  // Ready countdown effect
  useEffect(() => {
    if (showReady && isReady && opponentReady && readyCountdown > 0) {
      const timer = setTimeout(() => {
        setReadyCountdown(prev => prev - 1);
      }, 1000);

      if (readyCountdown === 1) {
        setTimeout(() => {
          setShowReady(false);
          setGameStarted(true);
        }, 1000);
      }

      return () => clearTimeout(timer);
    }
  }, [showReady, isReady, opponentReady, readyCountdown]);

  // Game timer
  useEffect(() => {
    let timer;
    if (gameStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, timeLeft]);

  // Calculate progress based on code length
  useEffect(() => {
    const progress = Math.min((code.length / 200) * 100, 100);
    setMyProgress(progress);

    // Simulate opponent progress
    if (gameStarted && opponent) {
      const randomProgress = Math.min(myProgress + Math.random() * 20 - 10, 100);
      setOpponentProgress(Math.max(0, randomProgress));
    }
  }, [code, gameStarted, opponent, myProgress]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setCode(languageTemplates[newLanguage] || '');
  };

  // Handle test run with victory detection
  const handleRunTests = () => {
    setIsRunning(true);
    
    // Simulate test execution
    setTimeout(() => {
      const passed = Math.random() > 0.3; // 70% pass rate for demo
      const testResults = {
        passed,
        passedTests: passed ? currentProblem.testCases.length : Math.floor(Math.random() * currentProblem.testCases.length),
        totalTests: currentProblem.testCases.length,
        output: passed ? 'All tests passed!' : 'Some tests failed. Check your logic.',
        executionTime: Math.floor(Math.random() * 100) + 50
      };
      
      setTestResults(testResults);
      setIsRunning(false);
      
      // Check for victory (all tests passed)
      if (testResults.passed && testResults.passedTests === currentProblem.testCases.length) {
        setTimeout(() => {
          // Check if this is user's first win (you can track this in user data)
          const firstWin = !user.wins || user.wins === 0;
          setIsFirstWin(firstWin);
          setGameComplete(true);
          setShowVictoryPopup(true);
        }, 1000); // Small delay for dramatic effect
      }
    }, 2000);
  };

  // Handle chat message
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        type: 'user',
        sender: user.displayName,
        message: newMessage,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Simulate opponent response
      setTimeout(() => {
        const responses = [
          'Good luck!', 'Nice approach!', 'Tricky problem!', 
          'Almost got it!', 'Great solution!', 'Let\'s go!'
        ];
        const response = {
          id: Date.now() + 1,
          type: 'opponent',
          sender: opponent?.displayName || 'Opponent',
          message: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, response]);
      }, 1000 + Math.random() * 2000);
    }
  };

  // Victory handling functions
  const handleVictoryClose = () => {
    setShowVictoryPopup(false);
    // Navigate back to dashboard
    navigate('dashboard');
  };

  const gameStats = {
    completionTime: formatTime(30 * 60 - timeLeft), // Calculate actual completion time
    testsPassedFirst: true, // Track if they got it right on first try
    accuracy: 100,
    difficulty: difficulty
  };

  const rewards = {
    coins: isFirstWin ? 100 : 75,
    xp: isFirstWin ? 150 : 100,
    rankPoints: isFirstWin ? 50 : 25,
    achievements: isFirstWin ? ['First Victory'] : []
  };

  // Ready Screen Component
  if (showReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl max-w-2xl w-full mx-4">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-500/20 rounded-full border border-blue-500/30">
                <Swords className="w-12 h-12 text-blue-400" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">Battle Ready?</h1>
            <p className="text-gray-300 mb-8">Prepare for competitive coding combat!</p>
            
            {/* Players */}
            <div className="flex justify-between items-center mb-8">
              <div className="text-center">
                <Avatar src={user.picture} size="large" className="mb-3" />
                <p className="text-white font-medium">{user.displayName}</p>
                <p className="text-blue-400 text-sm">You</p>
                {isReady ? (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">Ready</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsReady(true)}
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    I'm Ready!
                  </button>
                )}
              </div>
              
              <div className="text-6xl text-blue-400">⚔️</div>
              
              <div className="text-center">
                <Avatar src={opponent?.picture} size="large" className="mb-3" />
                <p className="text-white font-medium">{opponent?.displayName}</p>
                <p className="text-purple-400 text-sm">{opponent?.rank}</p>
                {opponentReady ? (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">Ready</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Clock className="w-4 h-4 text-yellow-400 animate-spin" />
                    <span className="text-yellow-400 text-sm">Getting ready...</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Countdown */}
            {isReady && opponentReady && (
              <div className="text-center">
                <div className="text-6xl font-bold text-white mb-4 animate-pulse">
                  {readyCountdown}
                </div>
                <p className="text-gray-300">Battle starts in...</p>
              </div>
            )}
            
            {/* Problem Preview */}
            <div className="mt-8 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-2">
                Problem: {currentProblem.title}
              </h3>
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className={`px-2 py-1 rounded ${
                  difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                  difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {difficulty}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">Room: {roomCode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Waiting screen
  if (!opponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="p-6">
          <button
            onClick={() => navigate('dashboard')}
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
        
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Waiting for Opponent</h2>
            <p className="text-gray-300 mb-4">Room Code: <span className="font-mono text-blue-400">{roomCode}</span></p>
            <p className="text-gray-400">Demo opponent will join in a few seconds...</p>
          </div>
        </div>
      </div>
    );
  }

  // Main game interface
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">{currentProblem.title}</h1>
            <span className={`px-2 py-1 rounded text-sm ${
              difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
              difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {difficulty}
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
            <div className="text-sm text-gray-400">
              Room: {roomCode}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Problem & Code */}
        <div className="flex-1 flex flex-col">
          {/* Problem Description */}
          <div className="bg-gray-800 p-6 border-b border-gray-700 h-1/3 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{currentProblem.title}</h2>
            <div className="text-gray-300 mb-4 whitespace-pre-line">
              {currentProblem.description}
            </div>
            
            {currentProblem.examples.map((example, index) => (
              <div key={index} className="mb-4 bg-gray-700/50 p-3 rounded">
                <p className="font-medium text-white mb-1">Example {index + 1}:</p>
                <p className="text-gray-300 font-mono text-sm">Input: {example.input}</p>
                <p className="text-gray-300 font-mono text-sm">Output: {example.output}</p>
                {example.explanation && (
                  <p className="text-gray-400 text-sm mt-1">Explanation: {example.explanation}</p>
                )}
              </div>
            ))}
          </div>

          {/* Code Editor */}
          <div className="flex-1 flex flex-col bg-gray-900">
            {/* Editor Controls */}
            <div className="bg-gray-800 p-3 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    A-
                  </button>
                  <span className="text-sm text-gray-400">{fontSize}px</span>
                  <button
                    onClick={() => setFontSize(Math.min(20, fontSize + 1))}
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    A+
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCode(languageTemplates[language])}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
                <button
                  onClick={handleRunTests}
                  disabled={isRunning}
                  className="px-4 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm flex items-center gap-1"
                >
                  {isRunning ? (
                    <>
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      Run Tests
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Area */}
            <div className="flex-1 relative">
              <textarea
                ref={codeRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-gray-900 text-white p-4 font-mono resize-none border-none outline-none"
                style={{ fontSize: `${fontSize}px` }}
                placeholder="Write your solution here..."
              />
            </div>

            {/* Test Results */}
            {testResults && (
              <div className="bg-gray-800 border-t border-gray-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Test Results</span>
                  <span className={`text-sm ${testResults.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {testResults.passedTests}/{testResults.totalTests} passed
                  </span>
                </div>
                <div className={`p-3 rounded ${testResults.passed ? 'bg-green-900/20 border border-green-700' : 'bg-red-900/20 border border-red-700'}`}>
                  <p className={`text-sm ${testResults.passed ? 'text-green-300' : 'text-red-300'}`}>
                    {testResults.output}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Execution time: {testResults.executionTime}ms
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Opponent & Chat */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Opponent Info */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={opponent.picture} size="medium" />
              <div>
                <p className="font-medium">{opponent.displayName}</p>
                <p className="text-sm text-gray-400">{opponent.rank}</p>
              </div>
              <div className="ml-auto">
                <Wifi className="w-4 h-4 text-green-400" />
              </div>
            </div>
            
            {/* Progress Bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Your Progress</span>
                  <span>{Math.round(myProgress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${myProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Opponent Progress</span>
                  <span>{Math.round(opponentProgress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${opponentProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`${
                  message.type === 'system' ? 'text-center' :
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {message.type === 'system' ? (
                    <p className="text-xs text-gray-400 bg-gray-700/50 rounded px-2 py-1 inline-block">
                      {message.message}
                    </p>
                  ) : (
                    <div className={`inline-block max-w-[80%] p-2 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-100'
                    }`}>
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                    </div>
                  )}
                </div>
              ))}
              {opponentTyping && (
                <div className="text-left">
                  <div className="inline-block bg-gray-700 text-gray-100 p-2 rounded-lg">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                      <span className="text-xs text-gray-400 ml-2">typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Send a message..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400"
              />
              <button
                onClick={handleSendMessage}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Victory Popup */}
      {showVictoryPopup && (
        <VictoryPopup
          show={showVictoryPopup}
          onClose={handleVictoryClose}
          user={user}
          opponent={opponent}
          gameStats={gameStats}
          rewards={rewards}
          isFirstWin={isFirstWin}
        />
      )}
    </div>
  );
};

export default GameRoom;