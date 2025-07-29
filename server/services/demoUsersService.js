class DemoUsersService {
  constructor() {
    this.demoUsers = [
      {
        id: 'demo_001',
        displayName: 'CodeNinja',
        rank: 'Gold II',
        wins: 247,
        totalGames: 312,
        winRate: 79,
        coins: 1850,
        xp: 4200,
        avatar: { theme: 'ninja', color: 'red' },
        skillLevel: 'expert',
        favoriteLanguages: ['JavaScript', 'Python', 'C++'],
        isOnline: true,
        status: 'Available for battle'
      },
      {
        id: 'demo_002',
        displayName: 'AlgoMaster',
        rank: 'Silver I',
        wins: 156,
        totalGames: 203,
        winRate: 77,
        coins: 1240,
        xp: 2800,
        avatar: { theme: 'genius', color: 'blue' },
        skillLevel: 'advanced',
        favoriteLanguages: ['Java', 'Python', 'JavaScript'],
        isOnline: true,
        status: 'Ready to clash'
      },
      {
        id: 'demo_003',
        displayName: 'ByteCrusher',
        rank: 'Bronze I',
        wins: 89,
        totalGames: 134,
        winRate: 66,
        coins: 650,
        xp: 1500,
        avatar: { theme: 'cyborg', color: 'green' },
        skillLevel: 'intermediate',
        favoriteLanguages: ['Python', 'C++', 'Java'],
        isOnline: true,
        status: 'Looking for opponents'
      },
      {
        id: 'demo_004',
        displayName: 'DevChampion',
        rank: 'Platinum III',
        wins: 423,
        totalGames: 511,
        winRate: 83,
        coins: 3200,
        xp: 7500,
        avatar: { theme: 'champion', color: 'yellow' },
        skillLevel: 'expert',
        favoriteLanguages: ['C++', 'Java', 'Python'],
        isOnline: true,
        status: 'Seeking worthy challengers'
      },
      {
        id: 'demo_005',
        displayName: 'CodeWizard',
        rank: 'Gold I',
        wins: 298,
        totalGames: 367,
        winRate: 81,
        coins: 2100,
        xp: 5200,
        avatar: { theme: 'genius', color: 'purple' },
        skillLevel: 'expert',
        favoriteLanguages: ['JavaScript', 'TypeScript', 'Python'],
        isOnline: true,
        status: 'Online and ready'
      },
      {
        id: 'demo_006',
        displayName: 'BugSlayer',
        rank: 'Silver III',
        wins: 134,
        totalGames: 187,
        winRate: 72,
        coins: 980,
        xp: 2200,
        avatar: { theme: 'ninja', color: 'orange' },
        skillLevel: 'intermediate',
        favoriteLanguages: ['Python', 'JavaScript', 'Go'],
        isOnline: true,
        status: 'Ready for action'
      },
      {
        id: 'demo_007',
        displayName: 'LogicBeast',
        rank: 'Bronze II',
        wins: 67,
        totalGames: 98,
        winRate: 68,
        coins: 420,
        xp: 950,
        avatar: { theme: 'coder', color: 'cyan' },
        skillLevel: 'beginner',
        favoriteLanguages: ['JavaScript', 'Python'],
        isOnline: true,
        status: 'Learning and battling'
      },
      {
        id: 'demo_008',
        displayName: 'DataDragon',
        rank: 'Diamond I',
        wins: 567,
        totalGames: 642,
        winRate: 88,
        coins: 4500,
        xp: 9800,
        avatar: { theme: 'champion', color: 'red' },
        skillLevel: 'expert',
        favoriteLanguages: ['C++', 'Rust', 'Java'],
        isOnline: true,
        status: 'Elite competitor'
      }
    ];

    this.activeRoomCodes = new Map(); // roomCode -> { creator, expiresAt }
    this.setupRoomCodeGeneration();
  }

  getRandomDemoUser(excludeId = null) {
    const availableUsers = this.demoUsers.filter(user => 
      user.id !== excludeId && user.isOnline
    );
    
    if (availableUsers.length === 0) {
      return this.demoUsers[0]; // Fallback
    }

    const randomIndex = Math.floor(Math.random() * availableUsers.length);
    return availableUsers[randomIndex];
  }

  getDemoUserById(id) {
    return this.demoUsers.find(user => user.id === id);
  }

  getAllDemoUsers() {
    return this.demoUsers.filter(user => user.isOnline);
  }

  setupRoomCodeGeneration() {
    // Generate room codes every 2-3 seconds
    setInterval(() => {
      this.generateRandomRoomCode();
    }, Math.random() * 1000 + 2000); // 2-3 seconds

    // Clean expired room codes every minute
    setInterval(() => {
      this.cleanExpiredRoomCodes();
    }, 60000);
  }

  generateRandomRoomCode() {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const creator = this.getRandomDemoUser();
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour

    this.activeRoomCodes.set(roomCode, {
      creator,
      roomCode,
      expiresAt,
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
    });

    console.log(`Demo room code generated: ${roomCode} by ${creator.displayName}`);
    
    return {
      roomCode,
      creator,
      expiresAt
    };
  }

  cleanExpiredRoomCodes() {
    const now = Date.now();
    for (const [roomCode, data] of this.activeRoomCodes.entries()) {
      if (data.expiresAt < now) {
        this.activeRoomCodes.delete(roomCode);
        console.log(`Expired room code removed: ${roomCode}`);
      }
    }
  }

  getValidRoomCode(roomCode) {
    const roomData = this.activeRoomCodes.get(roomCode);
    if (!roomData) {
      return null;
    }

    if (roomData.expiresAt < Date.now()) {
      this.activeRoomCodes.delete(roomCode);
      return null;
    }

    return roomData;
  }

  getLatestRoomCode() {
    const roomCodes = Array.from(this.activeRoomCodes.values());
    if (roomCodes.length === 0) {
      return this.generateRandomRoomCode();
    }

    // Return the most recent room code
    return roomCodes[roomCodes.length - 1];
  }

  simulateOpponentJoin(roomCode, delay = 3000) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const opponent = this.getRandomDemoUser();
        resolve(opponent);
      }, delay);
    });
  }

  updateUserStatus(userId, status) {
    const user = this.demoUsers.find(u => u.id === userId);
    if (user) {
      user.status = status;
    }
  }

  getUsersByRank() {
    return this.demoUsers
      .filter(user => user.isOnline)
      .sort((a, b) => {
        const rankOrder = {
          'Bronze': 1, 'Silver': 2, 'Gold': 3, 'Platinum': 4, 'Diamond': 5
        };
        
        const aRank = rankOrder[a.rank.split(' ')[0]] || 0;
        const bRank = rankOrder[b.rank.split(' ')[0]] || 0;
        
        if (aRank !== bRank) return bRank - aRank; // Higher rank first
        return b.winRate - a.winRate; // Higher win rate first
      });
  }

  searchUsers(query) {
    const queryLower = query.toLowerCase();
    return this.demoUsers.filter(user => 
      user.isOnline && (
        user.displayName.toLowerCase().includes(queryLower) ||
        user.rank.toLowerCase().includes(queryLower) ||
        user.skillLevel.toLowerCase().includes(queryLower)
      )
    );
  }
}

module.exports = new DemoUsersService();