import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, User, CheckCircle, XCircle, Code, Trophy, Target, Zap, Settings, Copy, RotateCcw, Download, Users, Crown, Wifi, WifiOff, Swords, Monitor, Activity } from 'lucide-react';
import VictoryPopup from '../components/VictoryPopup'; 
import gameSocket from '../sockets/socket';
import { openMatchSession, saveMatchSession } from '../utils/matchSession';

const DIFFICULTY_STYLES = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const MatchResultDialog = ({ result, onBack }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div role="dialog" aria-modal="true" aria-labelledby="match-result-title" aria-describedby="match-result-message" className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-8 text-center">
      {result.cancelled ? <Users className="w-12 h-12 text-yellow-400 mx-auto mb-4" /> : result.timedOut ? (
        <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
      ) : <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />}
      <h2 id="match-result-title" className="text-2xl font-bold text-white mb-3">
        {result.cancelled ? 'Match cancelled' : result.timedOut ? 'Time expired' : 'Defeat'}
      </h2>
      <p id="match-result-message" className="text-gray-300 mb-6">{result.message}</p>
      <button autoFocus onClick={onBack} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">Back to Arena</button>
    </div>
  </div>
);

const GameRoom = ({ 
  navigate, 
  roomCode, 
  initialPreferences,
  user = { name: 'Player1', avatar: null },
  onUpdateUser // CRITICAL: This comes from App.jsx for victory updates
}) => {
  const [session] = useState(() => openMatchSession(roomCode, user?.id, initialPreferences));
  const draftProblemIdRef = useRef(session.problemId);
  const [selectedLanguage, setSelectedLanguage] = useState(session.selectedLanguage || 'javascript');
  const [codeDrafts, setCodeDrafts] = useState(session.codeDrafts || { javascript: '// Start coding here...\n', python: '# Start coding here...\n' });
  const [matchReady, setMatchReady] = useState(false);
  const code = codeDrafts[selectedLanguage];
  const setCode = (value) => setCodeDrafts((drafts) => ({ ...drafts, [selectedLanguage]: value }));
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [matchDurationSeconds, setMatchDurationSeconds] = useState(0);
  const [myProgress, setMyProgress] = useState(0);
  const [opponentProgress] = useState(0);
  const [gameStatus, setGameStatus] = useState('waiting'); // waiting, active, finished, victory, defeat
  const [matchStatus, setMatchStatus] = useState('waiting');
  const [serverProblem, setServerProblem] = useState(null);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [editorLocked, setEditorLocked] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [endResult, setEndResult] = useState(null);
  const [opponentConnection, setOpponentConnection] = useState(null);
  const [reconnectSeconds, setReconnectSeconds] = useState(0);
  const [testResults, setTestResults] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [matchPreferences, setMatchPreferences] = useState(initialPreferences || session.preferences || null);
  const [deadlineAt, setDeadlineAt] = useState(null);
  const codeEditorRef = useRef(null);
  const matchEndedRef = useRef(false);
  const guestUsernameRef = useRef(`Player-${Math.random().toString(36).slice(2, 7)}`);

  // Opponent AI messages for different phases
  const opponentMessages = {
    start: [
      "Ready for this battle? Good luck!",
      "Let's see who's the better coder",
      "This looks like a fun challenge",
      "May the best algorithm win!",
      "gl hf! Ã°Å¸â€™Âª",
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
      "well done! Ã°Å¸â€˜Â",
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

  // The current server sends the selected JSON problem's description.
  const fallbackProblem = {
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

  const problem = typeof serverProblem === 'string'
    ? { ...fallbackProblem, description: serverProblem }
    : serverProblem
      ? { ...fallbackProblem, ...serverProblem, examples: serverProblem.examples || [] }
      : fallbackProblem;

  const username = user?.displayName || user?.name || guestUsernameRef.current;
  const userId = user?.id;
  const userEmail = user?.email;
  const leaveAndNavigate = async (page) => {
    if (!matchEndedRef.current) await gameSocket.leaveMatch(roomCode, session.resumeToken);
    navigate(page);
  };

  useEffect(() => {
    if (!opponentConnection?.reconnectBy) return undefined;
    const update = () => setReconnectSeconds(Math.max(0, Math.ceil((opponentConnection.reconnectBy - Date.now()) / 1000)));
    update();
    const timer = setInterval(update, 250);
    return () => clearInterval(timer);
  }, [opponentConnection]);

  useEffect(() => {
    Object.assign(session, { codeDrafts, selectedLanguage, problemId: draftProblemIdRef.current, preferences: matchPreferences });
    saveMatchSession(session);
  }, [session, codeDrafts, selectedLanguage, matchPreferences]);

  // Join the real Socket.IO match and listen for server-owned match events.
  useEffect(() => {
    if (!roomCode) {
      setConnectionStatus('error');
      return undefined;
    }

    const handleConnectionStatus = ({ status }) => {
      setConnectionStatus(status);
      setMatchReady(false);
      if (status === 'connected') {
        gameSocket.joinMatch(roomCode, username, session.resumeToken);
      }
    };

    const handleGameStarted = ({ problem: selectedProblem, deadlineAt: matchDeadlineAt, durationMs }) => {
      setMatchReady(true);
      matchEndedRef.current = false;
      setEndResult(null);
      setShowVictory(false);
      setOpponentConnection(null);
      setTestResults(null);
      setServerProblem(selectedProblem);
      setMatchStatus('active');
      setGameStatus('active');
      setDeadlineAt(matchDeadlineAt);
      setMatchDurationSeconds(durationMs / 1000);
      setTimeRemaining(Math.max(0, Math.ceil((matchDeadlineAt - Date.now()) / 1000)));
      if (draftProblemIdRef.current !== selectedProblem?.id || !session.codeDrafts) {
        setSelectedLanguage('javascript');
        setCodeDrafts({
          javascript: selectedProblem?.functionSignature?.javascript || '// Start coding here...\n',
          python: selectedProblem?.functionSignature?.python || '# Start coding here...\n'
        });
      }
      draftProblemIdRef.current = selectedProblem?.id;
      setEditorLocked(false);
      setSubmissionMessage('');
    };

    const handleSubmissionResult = ({ results, error }) => {
      if (matchEndedRef.current) return;
      const passed = results?.passed || 0;
      const total = results?.total || 0;
      setSubmissionMessage(error || (total ? `${passed}/${total} server tests passed.` : 'The submitted solution did not pass all tests.'));
      setTestResults({
        status: passed === total && total > 0 ? 'passed' : passed > 0 ? 'partial' : 'failed',
        passed,
        total,
        details: results?.results || [{ input: 'Server evaluation', passed: false }]
      });
    };

    const handleMatchOver = ({ winnerId, winnerName, reason, results, status, departedPlayerId }) => {
      const timedOut = reason === 'time_expired';
      const cancelled = status === 'cancelled' || ['player_left', 'player_abandoned'].includes(reason);
      const ownDeparture = departedPlayerId === gameSocket.getPlayerId();
      const cancellationMessage = reason === 'player_left'
        ? `${ownDeparture ? 'You left' : 'Your opponent left'} the match. No winner was declared.`
        : `${ownDeparture ? 'Your reconnection window expired' : 'Your opponent did not reconnect within 30 seconds'}. No winner was declared.`;
      const didWin = !timedOut && !cancelled && Boolean(winnerId) && winnerId === gameSocket.getPlayerId();
      matchEndedRef.current = true;
      setMatchStatus('completed');
      setGameStatus(timedOut || cancelled ? 'finished' : didWin ? 'victory' : 'defeat');
      setOpponentConnection(null);
      setDeadlineAt(null);
      setEditorLocked(true);
      if (timedOut) setTimeRemaining(0);
      setSubmissionMessage(
        cancelled ? cancellationMessage : timedOut ? 'Time expired. No player solved the problem.' :
          didWin ? 'Your solution won the match.' : `${winnerName || 'Your opponent'} won the match.`
      );
      if (didWin && results) {
        setTestResults({
          status: 'passed',
          passed: results.passed,
          total: results.total,
          details: results.results
        });
      } else {
        setTestResults((previous) => previous === 'running' ? null : previous);
      }
      setEndResult(didWin ? null : {
        timedOut,
        cancelled,
        message: cancelled ? cancellationMessage : timedOut ? 'No player solved the problem before the deadline.' : `${winnerName || 'Your opponent'} won the match.`
      });
      setShowVictory(didWin);
    };

    const handleLockEditor = () => setEditorLocked(true);
    const handleMatchSettings = ({ preferences }) => setMatchPreferences(preferences);
    const handlePlayerConnection = (player) => {
      if (matchEndedRef.current || player.playerId === gameSocket.getPlayerId()) return;
      setOpponentConnection(player.connected ? null : player);
    };
    const handleMatchState = (state) => {
      setMatchReady(true);
      setMatchPreferences(state.preferences);
      if (state.problem) handleGameStarted(state);
      setOpponentConnection(state.players?.find((player) => player.playerId !== state.playerId && !player.connected) || null);
      if (state.outcome) handleMatchOver(state.outcome);
      else if (state.pending) {
        setTestResults('running');
        setSubmissionMessage('Submitting solution to the server...');
      } else if (state.submissionResult) handleSubmissionResult(state.submissionResult);
    };

    gameSocket.on('connection_status', handleConnectionStatus);
    gameSocket.onGameStarted(handleGameStarted);
    gameSocket.on('submission_result', handleSubmissionResult);
    gameSocket.on('match_over', handleMatchOver);
    gameSocket.on('lock_editor', handleLockEditor);
    gameSocket.on('match_settings', handleMatchSettings);
    gameSocket.on('match_state', handleMatchState);
    gameSocket.on('player_connection', handlePlayerConnection);
    gameSocket.connect({ id: userId, name: username, email: userEmail });

    return () => {
      gameSocket.off('connection_status', handleConnectionStatus);
      gameSocket.off('game_started', handleGameStarted);
      gameSocket.off('submission_result', handleSubmissionResult);
      gameSocket.off('match_over', handleMatchOver);
      gameSocket.off('lock_editor', handleLockEditor);
      gameSocket.off('match_settings', handleMatchSettings);
      gameSocket.off('match_state', handleMatchState);
      gameSocket.off('player_connection', handlePlayerConnection);
      gameSocket.disconnect();
    };
  }, [roomCode, username, userId, userEmail, session]);

  // Timer countdown
  useEffect(() => {
    if (matchStatus !== 'active' || gameStatus !== 'active' || !deadlineAt) {
      return undefined;
    }

    const updateTimeRemaining = () => {
      const remaining = Math.max(0, Math.ceil((deadlineAt - Date.now()) / 1000));
      setTimeRemaining(remaining);
      if (remaining === 0) setGameStatus('finished');
    };

    updateTimeRemaining();
    const timer = setInterval(updateTimeRemaining, 250);

    return () => clearInterval(timer);
  }, [deadlineAt, matchStatus, gameStatus]);

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
      
      return Math.min(progress, 100);
    };

    const newProgress = calculateProgress();
    setMyProgress(newProgress);
  }, [code]);

  const handleSubmit = () => {
    if (!matchReady || matchStatus !== 'active' || editorLocked || timeRemaining === 0 || !gameSocket.isSocketConnected()) {
      return;
    }

    setTestResults('running');
    setSubmissionMessage('Submitting solution to the server...');
    gameSocket.submitCode({
      matchCode: roomCode,
      code,
      languageId: selectedLanguage === 'python' ? 71 : 63
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const reconnectNotice = opponentConnection && (
    <p role="status" className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 px-4 py-3 text-sm">
      {reconnectSeconds > 0
        ? `Opponent disconnected. ${reconnectSeconds} seconds to reconnect before the match is cancelled.`
        : 'Opponent disconnected. Waiting for the server to resolve the match...'}
    </p>
  );

  if (endResult && !serverProblem) {
    return <MatchResultDialog result={endResult} onBack={() => leaveAndNavigate('battle-arena')} />;
  }

  if (matchStatus === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-gray-800/60 border border-gray-700 rounded-2xl p-8 text-center">
          <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Waiting for your opponent</h1>
          <p className="text-gray-300 mb-4">Share this room code with the second player:</p>
          <div className="text-3xl font-mono font-bold text-cyan-400 tracking-widest mb-6">
            {roomCode || 'NO ROOM'}
          </div>
          {matchPreferences && (
            <p className="text-sm text-gray-300 mb-4">
              Difficulty: <span className="capitalize">{matchPreferences.difficulty}</span> / Topic: <span className="capitalize">{matchPreferences.topic}</span>
            </p>
          )}
          {submissionMessage && <p role="alert" className="text-sm text-red-400 mb-4">{submissionMessage}</p>}
          {reconnectNotice}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
            {connectionStatus === 'connected' ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
            <span>{connectionStatus === 'connected' ? 'Connected Ã¢â‚¬â€ waiting for player 2' : 'Connecting to match server...'}</span>
          </div>
          <button
            onClick={() => leaveAndNavigate('battle-arena')}
            className="mt-6 text-gray-400 hover:text-white transition-colors"
          >
            Leave match
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => leaveAndNavigate('battle-arena')}
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

      {reconnectNotice}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Problem & Progress */}
        <div className="w-1/2 border-r border-gray-700/50 flex flex-col">
          {/* Problem Statement */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{problem.title}</h2>
                <span className={`px-3 py-1 rounded-lg font-bold text-sm border ${DIFFICULTY_STYLES[String(problem.difficulty).toLowerCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                  {problem.difficulty}
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">{problem.description}</p>
              
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Examples:</h3>
                {problem.examples.length === 0 && (
                  <p className="text-sm text-gray-400">No examples are available for this problem.</p>
                )}
                {problem.examples.map((example, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                    <div className="text-sm text-gray-400 mb-1">Input:</div>
                    <div className="text-cyan-400 font-mono mb-2 whitespace-pre-wrap break-words">{example.input}</div>
                    <div className="text-sm text-gray-400 mb-1">Output:</div>
                    <div className="text-green-400 font-mono whitespace-pre-wrap break-words">{example.output}</div>
                    {example.acceptsOtherOutputs && (
                      <p className="text-sm text-gray-400 mt-2">One valid output is shown. Other valid outputs may also be accepted.</p>
                    )}
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

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4 text-purple-400" />
                  <select
                    aria-label="Solution language"
                    value={selectedLanguage}
                    onChange={(event) => setSelectedLanguage(event.target.value)}
                    disabled={!matchReady || editorLocked || matchStatus !== 'active' || timeRemaining === 0 || testResults === 'running'}
                    className="rounded-lg bg-gray-800 px-3 py-1 font-medium text-yellow-400"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleSubmit}
                  disabled={!matchReady || editorLocked || matchStatus !== 'active' || timeRemaining === 0 || testResults === 'running'}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Run Tests & Submit</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <textarea
                ref={codeEditorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={editorLocked || matchStatus !== 'active' || timeRemaining === 0}
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
            {submissionMessage && (
              <div className="bg-gray-900 border-t border-gray-700 px-4 py-3 text-sm text-gray-300 whitespace-pre-wrap">
                {submissionMessage}
              </div>
            )}
          </div>
          
        </div>
      </div>
      
      {endResult && (
        <MatchResultDialog result={endResult} onBack={() => leaveAndNavigate('battle-arena')} />
      )}

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
            displayName: 'Opponent',
            picture: null,
            rank: 'Silver I'
          }}
          gameStats={{
            completionTime: formatTime(Math.max(0, matchDurationSeconds - timeRemaining)),
            testsPassedFirst: testResults?.status === 'passed',
            accuracy: myProgress,
            difficulty: 'Easy'
          }}
          rewards={{
            coins: gameStatus === 'victory' ? 250 : 75,
            cash: gameStatus === 'victory' ? 1.25 : 0.40,
            xp: gameStatus === 'victory' ? 200 : 50,
            rankPoints: gameStatus === 'victory' ? 75 : 15,
            achievements: myProgress === 100 && matchDurationSeconds - timeRemaining < 2 * 60 ? ['Speed Demon'] : [],
            bonusMultiplier: Math.random() > 0.7 ? 1.5 : 1.0
          }}
          isFirstWin={false}
          onUpdateProfile={(updatedUserStats) => {
            if (session.victoryRewardApplied) return;
            session.victoryRewardApplied = true;
            saveMatchSession(session);
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
