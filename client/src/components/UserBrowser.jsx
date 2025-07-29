import React, { useState, useEffect } from 'react';
import { 
  Search, Users, Trophy, Zap, Target, 
  Swords, Crown, Medal, ArrowLeft 
} from 'lucide-react';
import Avatar from './ui/Avatar';

const UserBrowser = ({ navigate, user, onInviteUser }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('rank');
  const [isLoading, setIsLoading] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState(new Set());

  useEffect(() => {
    fetchDemoUsers();
  }, []);

  const fetchDemoUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/game/demo-users', {
        headers: {
          'x-session-id': localStorage.getItem('codeclash_session_id')
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch demo users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async (targetUser) => {
    if (invitedUsers.has(targetUser.id)) return;

    setInvitedUsers(prev => new Set([...prev, targetUser.id]));
    
    // Simulate invitation sent
    console.log(`Invited ${targetUser.displayName} to battle`);
    
    // Auto-accept invitation after 3 seconds (demo behavior)
    setTimeout(() => {
      if (onInviteUser) {
        onInviteUser(targetUser);
      }
    }, 3000);
  };

  const getRankColor = (rank) => {
    if (rank.includes('Bronze')) return 'text-orange-400';
    if (rank.includes('Silver')) return 'text-gray-300';
    if (rank.includes('Gold')) return 'text-yellow-400';
    if (rank.includes('Platinum')) return 'text-cyan-400';
    if (rank.includes('Diamond')) return 'text-purple-400';
    return 'text-gray-400';
  };

  const getRankIcon = (rank) => {
    if (rank.includes('Diamond')) return Crown;
    if (rank.includes('Platinum')) return Trophy;
    if (rank.includes('Gold')) return Medal;
    return Target;
  };

  const getSkillLevelColor = (skillLevel) => {
    switch (skillLevel?.toLowerCase()) {
      case 'beginner': return 'text-green-400 bg-green-500/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'advanced': return 'text-orange-400 bg-orange-500/20';
      case 'expert': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const filteredUsers = users
    .filter(u => {
      const matchesSearch = u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           u.rank.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           u.skillLevel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rank':
          const rankOrder = { 'Bronze': 1, 'Silver': 2, 'Gold': 3, 'Platinum': 4, 'Diamond': 5 };
          const aRank = rankOrder[a.rank.split(' ')[0]] || 0;
          const bRank = rankOrder[b.rank.split(' ')[0]] || 0;
          return bRank - aRank;
        case 'winRate':
          return b.winRate - a.winRate;
        case 'wins':
          return b.wins - a.wins;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          
          <h1 className="text-2xl font-bold text-white">Find Opponents</h1>
          
          <div className="flex items-center gap-2 text-blue-400">
            <Users className="w-5 h-5" />
            <span>{users.length} fighters online</span>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="px-6 mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search fighters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="rank">Sort by Rank</option>
                <option value="winRate">Sort by Win Rate</option>
                <option value="wins">Sort by Wins</option>
              </select>

              {/* Stats */}
              <div className="flex items-center justify-center bg-gray-700/50 rounded-lg px-4 py-3">
                <span className="text-gray-400">
                  Showing {filteredUsers.length} of {users.length} fighters
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading fighters...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((fighter) => {
                const RankIcon = getRankIcon(fighter.rank);
                const isInvited = invitedUsers.has(fighter.id);
                
                return (
                  <div
                    key={fighter.id}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-300"
                  >
                    {/* Fighter Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar 
                        theme={fighter.avatar.theme}
                        color={fighter.avatar.color}
                        size="lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-white">
                            {fighter.displayName}
                          </h3>
                          <div className={`w-3 h-3 rounded-full ${
                            fighter.isOnline ? 'bg-green-400' : 'bg-gray-500'
                          }`}></div>
                        </div>
                        <div className={`flex items-center gap-2 ${getRankColor(fighter.rank)}`}>
                          <RankIcon className="w-4 h-4" />
                          <span className="font-semibold">{fighter.rank}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{fighter.wins}</div>
                        <div className="text-gray-400 text-sm">Wins</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{fighter.winRate}%</div>
                        <div className="text-gray-400 text-sm">Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">{fighter.coins}</div>
                        <div className="text-gray-400 text-sm">Coins</div>
                      </div>
                    </div>

                    {/* Skill Level */}
                    <div className="mb-4">
                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getSkillLevelColor(fighter.skillLevel)}`}>
                        {fighter.skillLevel?.charAt(0).toUpperCase() + fighter.skillLevel?.slice(1)}
                      </div>
                    </div>

                    {/* Favorite Languages */}
                    <div className="mb-4">
                      <div className="text-gray-400 text-sm mb-2">Favorite Languages</div>
                      <div className="flex flex-wrap gap-2">
                        {fighter.favoriteLanguages?.slice(0, 3).map((lang) => (
                          <span
                            key={lang}
                            className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="mb-4">
                      <div className="text-gray-400 text-sm mb-1">Status</div>
                      <div className="text-green-400 text-sm">{fighter.status}</div>
                    </div>

                    {/* Invite Button */}
                    <button
                      onClick={() => handleInviteUser(fighter)}
                      disabled={isInvited}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                        isInvited
                          ? 'bg-green-600/20 text-green-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                      }`}
                    >
                      {isInvited ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                          Invitation Sent
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Swords className="w-4 h-4" />
                          Challenge to Battle
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No fighters found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserBrowser;