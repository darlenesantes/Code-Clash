import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Send, Clock, User, CheckCircle, XCircle, Code, MessageCircle, Trophy, Target, Zap, Settings, Copy, RotateCcw, Download, Users, Crown, Wifi, WifiOff, Swords, Monitor, Activity } from 'lucide-react';
import VictoryPopup from '../components/VictoryPopup'; 

const GameRoom = ({ 
  navigate, 
  roomCode, 
  language = 'javascript', 
  user = { name: 'Player1', avatar: null },
  onUpdateUser // CRITICAL: This comes from App.jsx for victory updates
}) => {
  const [code, setCode] = useState('// Start coding here...\n');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes
  const [myProgress, setMyProgress] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [gameStatus, setGameStatus] = useState('active'); // active, finished, victory, defeat
  const [showVictory, setShowVictory] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  const messagesEndRef = useRef(null);
  const codeEditorRef = useRef(null);

  const languages = [
    { id: 'javascript', name: 'JavaScript', color: 'text-yellow-400', starter: '// Start coding here...\nfunction twoSum(nums, target) {\n    \n}' },
    { id: 'python', name: 'Python', color: 'text-blue-400', starter: '# Start coding here...\ndef two_sum(nums, target):\n    pass' },
    { id: 'java', name: 'Java', color: 'text-orange-400', starter: '// Start coding here...\npublic int[] twoSum(int[] nums, int target) {\n    \n}' },
    { id: 'cpp', name: 'C++', color: 'text-purple-400', starter: '// Start coding here...\nvector<int> twoSum(vector<int>& nums, int target) {\n    \n}' },
    { id: 'csharp', name: 'C#', color: 'text-green-400', starter: '// Start coding here...\npublic int[] TwoSum(int[] nums, int target) {\n    \n}' },
    { id: 'go', name: 'Go', color: 'text-cyan-400', starter: '// Start coding here...\nfunc twoSum(nums []int, target int) []int {\n    \n}' },
    { id: 'rust', name: 'Rust', color: 'text-red-400', starter: '// Start coding here...\nimpl Solution {\n    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n        \n    }\n}' },
    { id: 'typescript', name: 'TypeScript', color: 'text-blue-300', starter: '// Start coding here...\nfunction twoSum(nums: number[], target: number): number[] {\n    \n}' }
  ];

  const handleLanguageChange = (languageId) => {
    const newLang = languages.find(lang => lang.id === languageId);
    if (newLang) {
      setSelectedLanguage(languageId);
      setCode(newLang.starter);
      setShowLanguageDropdown(false);
    }
  };

  const currentLanguage = languages.find(lang => lang.id === selectedLanguage) || languages[0];
  
  // Opponent AI messages for different phases
  const opponentMessages = {
    start: [
      "Ready for this battle? Good luck!",
      "Let's see who's the better coder",
      "This looks like a fun challenge",
      "May the best algorithm win!",
      "gl hf! 💪",
      "Ready when you are"
    ],
    midGame: [
      "hmm this is tricky",
      "taking longer than expected",
      "almost got the logic working",
      "debugging some edge cases",
      "getting closer...",
      "this problem has some gotchas",
      "need to think about this more",
      "working through the solution"
    ],
    nearEnd: [
      "Time is running out!",
      "Almost there...",
      "final optimizations needed",
      "this is going to be close",
      "race against time now!",
      "cutting it close here"
    ],
    victory: [
      "GG! Well played",
      "nice work, you got me",
      "well done! 👏",
      "you beat me to it",
      "great job there",
      "gg wp",
      "respect! good solution"
    ],
    defeat: [
      "got it! gg",
      "phew, that was close",
      "good effort though",
      "better luck next time",
      "wp, close battle"
    ],
    responses: [
      "thanks, you too!",
      "agreed",
      "yeah definitely",
      "cool thanks",
      "good point",
      "exactly",
      "for sure",
      "same here",
      "yep",
      "totally",
      "nice",
      "true that",
      "agreed 100%",
      "you got it"
    ]
  };

  // Sample problem
  const problem = {
    title: "Two Sum Challenge",
    difficulty: "EASY",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
    ],
    testCases: [
      { input: "[2,7,11,15], 9", expected: "[0,1]" },
      { input: "[3,2,4], 6", expected: "[1,2]" },
      { input: "[3,3], 6", expected: "[0,1]" }
    ]
  };

  // Initialize chat with pre-battle message
  useEffect(() => {
    const initialMessage = opponentMessages.start[Math.floor(Math.random() * opponentMessages.start.length)];
    setMessages([{
      id: 1,
      sender: 'opponent',
      text: initialMessage,
      timestamp: new Date()
    }]);
  }, []);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          setGameStatus('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Opponent progress simulation with realistic backtracking
  useEffect(() => {
    let progressCount = 0;
    
    const progressTimer = setInterval(() => {
      if (gameStatus === 'active' && opponentProgress < 100) {
        setOpponentProgress(prev => {
          progressCount++;
          
          // Realistic backtracking: go back 5-15% once every 7-10 increments
          if (progressCount % (7 + Math.floor(Math.random() * 4)) === 0 && prev > 20) {
            const backtrack = 5 + Math.random() * 10; // 5-15% back
            return Math.max(prev - backtrack, 0);
          }
          
          const increment = Math.random() * 3 + 1; // 1-4% per interval
          const newProgress = Math.min(prev + increment, 100);
          
          // Trigger opponent messages based on progress
          if (newProgress > 30 && newProgress < 35 && prev <= 30) {
            sendOpponentMessage('midGame');
          } else if (newProgress > 80 && newProgress < 85 && prev <= 80) {
            sendOpponentMessage('nearEnd');
          } else if (newProgress >= 100 && prev < 100) {
            setGameStatus('defeat');
            setShowVictory(true);
            sendOpponentMessage('defeat');
          }
          
          return newProgress;
        });
      }
    }, 2000 + Math.random() * 3000); // Random interval 2-5 seconds

    return () => clearInterval(progressTimer);
  }, [gameStatus, opponentProgress]);

  // Calculate my progress based on code
  useEffect(() => {
    const calculateProgress = () => {
      if (!code || code.trim() === '// Start coding here...' || code.trim() === '') {
        return 0;
      }

      let progress = 0;
      const lines = code.split('\n').filter(line => line.trim() !== '');
      
      // Basic structure points
      if (code.includes('function') || code.includes('const') || code.includes('let')) progress += 10;
      if (code.includes('for') || code.includes('while') || code.includes('forEach')) progress += 20;
      if (code.includes('if') || code.includes('else')) progress += 15;
      if (code.includes('return')) progress += 25;
      
      // Content-based scoring
      progress += Math.min(lines.length * 3, 30); // Up to 30 points for code length
      
      // Solution-specific scoring
      if (code.includes('target') && code.includes('nums')) progress += 10;
      if (code.includes('[') && code.includes(']')) progress += 10;
      
      // Complete solution detection
      if (code.includes('return [') && (code.includes('i') || code.includes('0')) && (code.includes('j') || code.includes('1'))) {
        progress = 100;
        if (myProgress < 100) {
          setGameStatus('victory');
          setShowVictory(true);
          sendOpponentMessage('victory');
        }
      }
      
      return Math.min(progress, 100);
    };

    const newProgress = calculateProgress();
    setMyProgress(newProgress);
  }, [code, myProgress]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendOpponentMessage = (phase) => {
    const messageList = opponentMessages[phase];
    const randomMessage = messageList[Math.floor(Math.random() * messageList.length)];
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'opponent',
        text: randomMessage,
        timestamp: new Date()
      }]);
    }, 1000 + Math.random() * 2000);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'me',
        text: newMessage,
        timestamp: new Date()
      }]);
      setNewMessage('');
      
      // Trigger opponent response
      setTimeout(() => {
        const response = opponentMessages.responses[Math.floor(Math.random() * opponentMessages.responses.length)];
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'opponent',
          text: response,
          timestamp: new Date()
        }]);
      }, 2000 + Math.random() * 3000);
    }
  };

  const handleRunTests = () => {
    // Simulate test running
    setTestResults('running');
    
    setTimeout(() => {
      const hasBasicStructure = code.includes('return') && code.length > 50;
      const hasCompleteLogic = code.includes('return [') && (code.includes('i') || code.includes('j'));
      
      if (hasCompleteLogic) {
        setTestResults({
          status: 'passed',
          passed: 3,
          total: 3,
          details: [
            { input: "[2,7,11,15], 9", expected: "[0,1]", actual: "[0,1]", passed: true },
            { input: "[3,2,4], 6", expected: "[1,2]", actual: "[1,2]", passed: true },
            { input: "[3,3], 6", expected: "[0,1]", actual: "[0,1]", passed: true }
          ]
        });
      } else if (hasBasicStructure) {
        setTestResults({
          status: 'partial',
          passed: 1,
          total: 3,
          details: [
            { input: "[2,7,11,15], 9", expected: "[0,1]", actual: "[0,1]", passed: true },
            { input: "[3,2,4], 6", expected: "[1,2]", actual: "undefined", passed: false },
            { input: "[3,3], 6", expected: "[0,1]", actual: "undefined", passed: false }
          ]
        });
      } else {
        setTestResults({
          status: 'failed',
          passed: 0,
          total: 3,
          details: [
            { input: "[2,7,11,15], 9", expected: "[0,1]", actual: "Error", passed: false },
            { input: "[3,2,4], 6", expected: "[1,2]", actual: "Error", passed: false },
            { input: "[3,3], 6", expected: "[0,1]", actual: "Error", passed: false }
          ]
        });
      }
    }, 2000);
  };

  const handleSubmit = () => {
    if (myProgress >= 100) {
      setGameStatus('victory');
      setShowVictory(true);
    } else {
      // Show submission confirmation
      const confirmed = window.confirm('Are you sure you want to submit? Your solution may not be complete.');
      if (confirmed) {
        setGameStatus('finished');
        setShowVictory(true);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('battle-arena')}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Arena</span>
            </button>
            <div className="flex items-center space-x-2">
              <Swords className="w-5 h-5 text-orange-400" />
              <span className="text-white font-bold">Room: {roomCode}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-white font-mono text-lg font-bold">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
              connectionStatus === 'connected' 
                ? 'bg-green-500/20 border border-green-500/30' 
                : 'bg-red-500/20 border border-red-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
              } animate-pulse`}></div>
              <span className={`text-sm font-medium ${
                connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'
              }`}>
                {connectionStatus === 'connected' ? 'CONNECTED' : 'RECONNECTING'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Problem & Progress */}
        <div className="w-1/2 border-r border-gray-700/50 flex flex-col">
          {/* Problem Statement */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{problem.title}</h2>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg font-bold text-sm border border-green-500/30">
                  {problem.difficulty}
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">{problem.description}</p>
              
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Examples:</h3>
                {problem.examples.map((example, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                    <div className="text-sm text-gray-400 mb-1">Input:</div>
                    <div className="text-cyan-400 font-mono mb-2">{example.input}</div>
                    <div className="text-sm text-gray-400 mb-1">Output:</div>
                    <div className="text-green-400 font-mono">{example.output}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Progress Bars */}
          <div className="p-6 bg-gray-800/30 border-t border-gray-700/50">
            <div className="space-y-4">
              {/* My Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium">You</span>
                  </div>
                  <span className="text-blue-400 font-bold">{Math.round(myProgress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${myProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              {/* Opponent Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-red-400" />
                    <span className="text-white font-medium">Opponent</span>
                  </div>
                  <span className="text-red-400 font-bold">{Math.round(opponentProgress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${opponentProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor & Chat */}
        <div className="w-1/2 flex flex-col">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4 text-purple-400" />
                  <div className="relative">
                    <button
                      onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                      className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${currentLanguage.color} hover:bg-gray-700/50`}
                    >
                      <span className="font-medium">{currentLanguage.name}</span>
                      <svg className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showLanguageDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 min-w-40">
                        {languages.map((lang) => (
                          <button
                            key={lang.id}
                            onClick={() => handleLanguageChange(lang.id)}
                            className={`w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors ${lang.color} ${
                              selectedLanguage === lang.id ? 'bg-gray-700' : ''
                            }`}
                          >
                            {lang.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleRunTests}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  <Play className="w-4 h-4" />
                  <span>Run Tests</span>
                </button>
                <button 
                  onClick={handleSubmit}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <textarea
                ref={codeEditorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-gray-900 text-white p-4 font-mono text-sm resize-none focus:outline-none"
                placeholder="// Start coding here..."
                spellCheck="false"
              />
            </div>
            
            {/* Test Results */}
            {testResults && (
              <div className="bg-gray-800/50 border-t border-gray-700/50 p-4">
                {testResults === 'running' ? (
                  <div className="flex items-center space-x-2 text-yellow-400">
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Running tests...</span>
                  </div>
                ) : (
                  <div>
                    <div className={`flex items-center space-x-2 mb-2 ${
                      testResults.status === 'passed' ? 'text-green-400' :
                      testResults.status === 'partial' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {testResults.status === 'passed' ? 
                        <CheckCircle className="w-4 h-4" /> : 
                        <XCircle className="w-4 h-4" />
                      }
                      <span className="font-medium">
                        {testResults.passed}/{testResults.total} tests passed
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                      {testResults.details.map((test, index) => (
                        <div key={index} className={`flex items-center space-x-2 ${test.passed ? 'text-green-400' : 'text-red-400'}`}>
                          {test.passed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span className="font-mono">{test.input}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Chat */}
          <div className="h-80 bg-gray-800/30 border-t border-gray-700/50 flex flex-col">
            <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50 flex items-center space-x-2">
              <MessageCircle className="w-4 h-4 text-green-400" />
              <span className="text-white font-medium">Battle Chat</span>
              <div className="flex items-center space-x-1 ml-auto">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-gray-400">2 online</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.sender === 'me' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-200'
                    }`}>
                      <div className="text-sm">{message.text}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-700/50">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* VICTORY POPUP - PROPERLY INTEGRATED */}
      {showVictory && (
        <VictoryPopup
          show={showVictory}
          onClose={() => {
            setShowVictory(false);
          }}
          onStartNewGame={() => {
            setShowVictory(false);
            navigate('battle-arena');
          }}
          onGoToDashboard={() => {
            setShowVictory(false);
            navigate('dashboard');
          }}
          user={{
            displayName: user?.name || 'Player1',
            picture: user?.avatar,
            wins: user?.wins || 0,
            coins: user?.coins || 0,
            totalEarnings: user?.totalEarnings || 0,
            winStreak: 11, // Static win streak as requested
            rankPoints: user?.rankPoints || 847,
            rank: 'Silver II',
            name: user?.name,
            email: user?.email
          }}
          opponent={{
            displayName: 'CodeNinja',
            picture: null,
            rank: 'Silver I'
          }}
          gameStats={{
            completionTime: formatTime(15 * 60 - timeRemaining),
            testsPassedFirst: testResults?.status === 'passed',
            accuracy: myProgress,
            difficulty: 'Easy'
          }}
          rewards={{
            coins: gameStatus === 'victory' ? 250 : 75,
            cash: gameStatus === 'victory' ? 1.25 : 0.40,
            xp: gameStatus === 'victory' ? 200 : 50,
            rankPoints: gameStatus === 'victory' ? 75 : 15,
            achievements: myProgress === 100 && timeRemaining > 13*60 ? ['Speed Demon'] : [],
            bonusMultiplier: Math.random() > 0.7 ? 1.5 : 1.0
          }}
          isFirstWin={false}
          onUpdateProfile={(updatedUserStats) => {
            console.log('Victory popup updating user stats:', updatedUserStats);
            
            // Calculate the new stats based on actual battle results
            const battleRewards = {
              coins: gameStatus === 'victory' ? 250 : 75,
              cash: gameStatus === 'victory' ? 1.25 : 0.40,
              rankPoints: gameStatus === 'victory' ? 75 : 15
            };
            
            // Apply bonus multiplier if present
            const bonusMultiplier = Math.random() > 0.7 ? 1.5 : 1.0;
            const finalCoins = Math.floor(battleRewards.coins * bonusMultiplier);
            const finalCash = Number((battleRewards.cash * bonusMultiplier).toFixed(2));
            const finalRankPoints = Math.floor(battleRewards.rankPoints * bonusMultiplier);
            
            const newStats = {
              ...user,
              wins: (user?.wins || 0) + (gameStatus === 'victory' ? 1 : 0),
              coins: (user?.coins || 0) + finalCoins,
              totalEarnings: Number(((user?.totalEarnings || 0) + finalCash).toFixed(2)),
              rankPoints: (user?.rankPoints || 847) + finalRankPoints,
              winStreak: 11, // Keep static as requested
              battlesPlayed: (user?.battlesPlayed || 0) + 1,
              lastBattleTime: new Date().toISOString()
            };
            
            console.log('Calculated new stats:', newStats);
            
            // Update the user state in App.jsx
            if (typeof onUpdateUser === 'function') {
              onUpdateUser(newStats);
              console.log('User stats sent to App.jsx');
            } else {
              console.warn('onUpdateUser function not available');
            }
          }}
        />
      )}
    </div>
  );
};

export default GameRoom;