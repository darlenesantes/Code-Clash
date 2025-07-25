# CodeClash - Complete Project File Structure
# Frontend + Backend Architecture

codeclash/
├── README.md                          # Project overview and setup instructions
├── .gitignore                         # Git ignore file
├── package.json                       # Root package.json for scripts
├── docker-compose.yml                 # Docker setup for full stack
├── .env.example                       # Environment variables template
│
├── client/                            # FRONTEND - React Application
│   ├── public/
│   │   ├── index.html                 # Main HTML file
│   │   ├── favicon.ico                # CodeClash logo favicon
│   │   ├── manifest.json              # PWA manifest
│   │   ├── logo192.png                # App logo (192x192)
│   │   ├── logo512.png                # App logo (512x512)
│   │   └── robots.txt                 # SEO robots file
│   │
│   ├── src/
│   │   ├── components/                # Reusable UI Components
│   │   │   ├── ui/                    # Basic UI Elements
│   │   │   │   ├── Button.jsx         # Custom button component
│   │   │   │   ├── Card.jsx           # Container cards
│   │   │   │   ├── Modal.jsx          # Overlay modals
│   │   │   │   ├── Input.jsx          # Form inputs
│   │   │   │   ├── Badge.jsx          # Status badges
│   │   │   │   ├── Avatar.jsx         # User avatars
│   │   │   │   ├── ProgressBar.jsx    # Progress indicators
│   │   │   │   ├── LoadingSpinner.jsx # Loading animations
│   │   │   │   ├── Toast.jsx          # Notification toasts
│   │   │   │   └── index.js           # Export all UI components
│   │   │   │
│   │   │   ├── layout/                # Layout Components
│   │   │   │   ├── Header.jsx         # Top navigation
│   │   │   │   ├── Sidebar.jsx        # Side navigation
│   │   │   │   ├── Footer.jsx         # Page footer
│   │   │   │   ├── PageLayout.jsx     # Main layout wrapper
│   │   │   │   └── index.js           # Export layout components
│   │   │   │
│   │   │   ├── auth/                  # Authentication Components
│   │   │   │   ├── LoginForm.jsx      # Login form
│   │   │   │   ├── RegisterForm.jsx   # Registration form
│   │   │   │   ├── GoogleAuthButton.jsx # Google OAuth
│   │   │   │   ├── ProtectedRoute.jsx # Route protection
│   │   │   │   └── index.js           # Export auth components
│   │   │   │
│   │   │   ├── game/                  # Game-Related Components
│   │   │   │   ├── CodeEditor.jsx     # Monaco editor wrapper
│   │   │   │   ├── ProblemDisplay.jsx # Problem statement viewer
│   │   │   │   ├── TestResults.jsx    # Test case results
│   │   │   │   ├── OpponentStatus.jsx # Real-time opponent info
│   │   │   │   ├── GameTimer.jsx      # Match countdown
│   │   │   │   ├── ChatBox.jsx        # In-game chat
│   │   │   │   ├── SubmissionPanel.jsx # Code submission UI
│   │   │   │   ├── SpectatorView.jsx  # Watch mode
│   │   │   │   └── index.js           # Export game components
│   │   │   │
│   │   │   ├── dashboard/             # Dashboard Components
│   │   │   │   ├── StatsCard.jsx      # User statistics
│   │   │   │   ├── QuickMatch.jsx     # Quick matchmaking
│   │   │   │   ├── RecentMatches.jsx  # Match history
│   │   │   │   ├── FriendsList.jsx    # Online friends
│   │   │   │   ├── LeaderboardCard.jsx # Rankings preview
│   │   │   │   ├── AchievementCard.jsx # Achievement display
│   │   │   │   └── index.js           # Export dashboard components
│   │   │   │
│   │   │   ├── profile/               # Profile Components
│   │   │   │   ├── ProfileCard.jsx    # Profile display
│   │   │   │   ├── EditProfile.jsx    # Profile editing
│   │   │   │   ├── SettingsForm.jsx   # User settings
│   │   │   │   ├── MatchHistory.jsx   # Detailed match history
│   │   │   │   ├── SkillProgress.jsx  # Progress tracking
│   │   │   │   └── index.js           # Export profile components
│   │   │   │
│   │   │   └── common/                # Shared Components
│   │   │       ├── ErrorBoundary.jsx  # Error handling
│   │   │       ├── SEOHead.jsx        # Meta tags
│   │   │       ├── ThemeProvider.jsx  # Theme context
│   │   │       └── index.js           # Export common components
│   │   │
│   │   ├── pages/                     # Page Components (Route Handlers)
│   │   │   ├── LandingPage.jsx        # Marketing home page
│   │   │   ├── LoginPage.jsx          # Authentication
│   │   │   ├── RegisterPage.jsx       # User registration
│   │   │   ├── DashboardPage.jsx      # User dashboard
│   │   │   ├── ProfilePage.jsx        # User profile
│   │   │   ├── SettingsPage.jsx       # User settings
│   │   │   ├── MatchmakingPage.jsx    # Find opponents
│   │   │   ├── GameRoomPage.jsx       # Active battle
│   │   │   ├── SpectatorPage.jsx      # Watch matches
│   │   │   ├── ResultsPage.jsx        # Post-match results
│   │   │   ├── LeaderboardPage.jsx    # Global rankings
│   │   │   ├── FriendsPage.jsx        # Social features
│   │   │   ├── PracticePage.jsx       # Solo practice
│   │   │   ├── TournamentPage.jsx     # Tournament view
│   │   │   ├── NotFoundPage.jsx       # 404 error
│   │   │   └── index.js               # Export all pages
│   │   │
│   │   ├── hooks/                     # Custom React Hooks
│   │   │   ├── useAuth.js             # Authentication logic
│   │   │   ├── useSocket.js           # Socket.io connection
│   │   │   ├── useLocalStorage.js     # Local storage helper
│   │   │   ├── useTimer.js            # Countdown timer
│   │   │   ├── useDebounce.js         # Input debouncing
│   │   │   ├── useKeyboard.js         # Keyboard shortcuts
│   │   │   ├── useMediaQuery.js       # Responsive queries
│   │   │   ├── useGameState.js        # Game state management
│   │   │   ├── useWebRTC.js           # Video/audio features
│   │   │   └── index.js               # Export all hooks
│   │   │
│   │   ├── context/                   # React Context Providers
│   │   │   ├── AuthContext.js         # User authentication
│   │   │   ├── GameContext.js         # Current game state
│   │   │   ├── SocketContext.js       # Socket connection
│   │   │   ├── ThemeContext.js        # UI theme
│   │   │   ├── NotificationContext.js # Toast notifications
│   │   │   └── index.js               # Export all contexts
│   │   │
│   │   ├── services/                  # External Service Integrations
│   │   │   ├── api/                   # Backend API Client
│   │   │   │   ├── authApi.js         # Authentication endpoints
│   │   │   │   ├── userApi.js         # User management
│   │   │   │   ├── gameApi.js         # Game operations
│   │   │   │   ├── problemApi.js      # LeetCode problems
│   │   │   │   ├── leaderboardApi.js  # Rankings
│   │   │   │   ├── friendsApi.js      # Social features
│   │   │   │   ├── tournamentApi.js   # Tournament system
│   │   │   │   └── index.js           # API client setup
│   │   │   │
│   │   │   ├── socket/                # Socket.io Event Handlers
│   │   │   │   ├── gameEvents.js      # Game events
│   │   │   │   ├── chatEvents.js      # Chat functionality
│   │   │   │   ├── matchmakingEvents.js # Matchmaking
│   │   │   │   ├── spectatorEvents.js # Spectator mode
│   │   │   │   └── index.js           # Socket setup
│   │   │   │
│   │   │   └── external/              # Third-Party Services
│   │   │       ├── judge0.js          # Code execution
│   │   │       ├── googleAuth.js      # Google OAuth
│   │   │       ├── analytics.js       # Usage tracking
│   │   │       └── payment.js         # Payment processing
│   │   │
│   │   ├── utils/                     # Utility Functions
│   │   │   ├── constants.js           # App constants
│   │   │   ├── validation.js          # Form validation
│   │   │   ├── formatting.js          # Data formatting
│   │   │   ├── codeUtils.js           # Code processing
│   │   │   ├── gameLogic.js           # Game calculations
│   │   │   ├── dateUtils.js           # Date/time helpers
│   │   │   ├── errorHandling.js       # Error processing
│   │   │   ├── localStorageKeys.js    # Storage keys
│   │   │   └── index.js               # Export utilities
│   │   │
│   │   ├── styles/                    # Styling Files
│   │   │   ├── globals.css            # Global CSS
│   │   │   ├── tailwind.css           # Tailwind imports
│   │   │   ├── components.css         # Component styles
│   │   │   ├── animations.css         # Custom animations
│   │   │   ├── themes/                # Theme Files
│   │   │   │   ├── dark.css           # Dark theme
│   │   │   │   ├── light.css          # Light theme
│   │   │   │   └── neon.css           # Neon theme
│   │   │   └── fonts/                 # Custom fonts
│   │   │       ├── inter.css          # Inter font
│   │   │       └── jetbrains-mono.css # Code font
│   │   │
│   │   ├── assets/                    # Static Assets
│   │   │   ├── images/                # Images
│   │   │   │   ├── logo/              # Brand logos
│   │   │   │   │   ├── logo.svg       # Main logo
│   │   │   │   │   ├── logo-dark.svg  # Dark theme logo
│   │   │   │   │   └── favicon.ico    # Favicon
│   │   │   │   ├── icons/             # Custom icons
│   │   │   │   ├── backgrounds/       # Background images
│   │   │   │   ├── avatars/           # Default avatars
│   │   │   │   └── badges/            # Achievement badges
│   │   │   │
│   │   │   ├── sounds/                # Audio Files
│   │   │   │   ├── victory.mp3        # Win sound
│   │   │   │   ├── defeat.mp3         # Loss sound
│   │   │   │   ├── notification.mp3   # Notifications
│   │   │   │   ├── typing.mp3         # Keyboard sounds
│   │   │   │   └── ambient.mp3        # Background music
│   │   │   │
│   │   │   └── animations/            # Lottie Animations
│   │   │       ├── loading.json       # Loading spinner
│   │   │       ├── victory.json       # Victory animation
│   │   │       └── searching.json     # Matchmaking animation
│   │   │
│   │   ├── data/                      # Static Data & Mocks
│   │   │   ├── mockProblems.js        # Sample LeetCode problems
│   │   │   ├── mockUsers.js           # Test user data
│   │   │   ├── languages.js           # Programming languages
│   │   │   ├── difficultyLevels.js    # Problem difficulties
│   │   │   ├── achievements.js        # Achievement definitions
│   │   │   ├── defaultSettings.js     # Default preferences
│   │   │   └── rankSystem.js          # Ranking system
│   │   │
│   │   ├── config/                    # Configuration Files
│   │   │   ├── environment.js         # Environment variables
│   │   │   ├── routes.js              # Route definitions
│   │   │   ├── socketConfig.js        # Socket.io config
│   │   │   ├── editorConfig.js        # Monaco editor settings
│   │   │   ├── themeConfig.js         # Theme configurations
│   │   │   └── apiConfig.js           # API configurations
│   │   │
│   │   ├── tests/                     # Frontend Tests
│   │   │   ├── components/            # Component tests
│   │   │   ├── hooks/                 # Hook tests
│   │   │   ├── pages/                 # Page tests
│   │   │   ├── utils/                 # Utility tests
│   │   │   ├── integration/           # Integration tests
│   │   │   ├── e2e/                   # End-to-end tests
│   │   │   └── setup/                 # Test configuration
│   │   │       ├── setupTests.js      # Jest setup
│   │   │       └── testUtils.js       # Test helpers
│   │   │
│   │   ├── App.jsx                    # Main app component
│   │   ├── index.js                   # React entry point
│   │   └── reportWebVitals.js         # Performance monitoring
│   │
│   ├── package.json                   # Frontend dependencies
│   ├── tailwind.config.js             # Tailwind configuration
│   ├── postcss.config.js              # PostCSS configuration
│   ├── craco.config.js                # Create React App config
│   └── .env.local                     # Local environment variables
│
├── server/                            # BACKEND - Node.js/Express Server
│   ├── src/
│   │   ├── controllers/               # Route Controllers
│   │   │   ├── authController.js      # Authentication logic
│   │   │   ├── userController.js      # User management
│   │   │   ├── gameController.js      # Game operations
│   │   │   ├── problemController.js   # Problem management
│   │   │   ├── leaderboardController.js # Rankings
│   │   │   ├── friendsController.js   # Social features
│   │   │   └── tournamentController.js # Tournaments
│   │   │
│   │   ├── models/                    # Database Models
│   │   │   ├── User.js                # User schema
│   │   │   ├── Game.js                # Game/match schema
│   │   │   ├── Problem.js             # Problem schema
│   │   │   ├── Submission.js          # Code submission schema
│   │   │   ├── Tournament.js          # Tournament schema
│   │   │   ├── Friendship.js          # Friend relationships
│   │   │   └── Achievement.js         # Achievement schema
│   │   │
│   │   ├── routes/                    # API Routes
│   │   │   ├── auth.js                # Authentication routes
│   │   │   ├── users.js               # User routes
│   │   │   ├── games.js               # Game routes
│   │   │   ├── problems.js            # Problem routes
│   │   │   ├── leaderboard.js         # Ranking routes
│   │   │   ├── friends.js             # Social routes
│   │   │   ├── tournaments.js         # Tournament routes
│   │   │   └── index.js               # Route aggregation
│   │   │
│   │   ├── middleware/                # Express Middleware
│   │   │   ├── auth.js                # Authentication middleware
│   │   │   ├── validation.js          # Request validation
│   │   │   ├── rateLimit.js           # Rate limiting
│   │   │   ├── cors.js                # CORS configuration
│   │   │   ├── errorHandler.js        # Error handling
│   │   │   └── logger.js              # Request logging
│   │   │
│   │   ├── services/                  # Business Logic Services
│   │   │   ├── authService.js         # Authentication logic
│   │   │   ├── gameService.js         # Game management
│   │   │   ├── matchmakingService.js  # Matchmaking algorithm
│   │   │   ├── judge0Service.js       # Code execution
│   │   │   ├── emailService.js        # Email notifications
│   │   │   ├── paymentService.js      # Payment processing
│   │   │   └── analyticsService.js    # Usage analytics
│   │   │
│   │   ├── socket/                    # Socket.io Handlers
│   │   │   ├── gameSocket.js          # Game events
│   │   │   ├── chatSocket.js          # Chat events
│   │   │   ├── matchmakingSocket.js   # Matchmaking events
│   │   │   ├── spectatorSocket.js     # Spectator events
│   │   │   └── index.js               # Socket server setup
│   │   │
│   │   ├── utils/                     # Backend Utilities
│   │   │   ├── database.js            # DB connection
│   │   │   ├── validation.js          # Input validation
│   │   │   ├── encryption.js          # Password hashing
│   │   │   ├── jwt.js                 # JWT token handling
│   │   │   ├── constants.js           # Server constants
│   │   │   └── logger.js              # Logging utility
│   │   │
│   │   ├── config/                    # Server Configuration
│   │   │   ├── database.js            # Database config
│   │   │   ├── redis.js               # Redis config
│   │   │   ├── oauth.js               # OAuth settings
│   │   │   ├── email.js               # Email config
│   │   │   └── environment.js         # Environment setup
│   │   │
│   │   ├── data/                      # Seed Data & Migrations
│   │   │   ├── seeds/                 # Database seeds
│   │   │   │   ├── users.js           # User seed data
│   │   │   │   ├── problems.js        # Problem seed data
│   │   │   │   └── achievements.js    # Achievement seeds
│   │   │   └── migrations/            # Database migrations
│   │   │       ├── 001_initial.js     # Initial schema
│   │   │       ├── 002_add_tournaments.js # Tournament features
│   │   │       └── 003_add_friends.js # Social features
│   │   │
│   │   └── tests/                     # Backend Tests
│   │       ├── unit/                  # Unit tests
│   │       ├── integration/           # Integration tests
│   │       ├── api/                   # API endpoint tests
│   │       └── socket/                # Socket.io tests
│   │
│   ├── app.js                         # Express app setup
│   ├── server.js                      # Server entry point
│   ├── package.json                   # Backend dependencies
│   └── .env                           # Environment variables
│
├── database/                          # Database Files
│   ├── postgres/                      # PostgreSQL files
│   │   ├── init.sql                   # Initial schema
│   │   └── sample_data.sql            # Sample data
│   └── redis/                         # Redis configuration
│       └── redis.conf                 # Redis config file
│
├── docs/                              # Documentation
│   ├── api/                           # API Documentation
│   │   ├── authentication.md          # Auth endpoints
│   │   ├── games.md                   # Game endpoints
│   │   ├── users.md                   # User endpoints
│   │   └── websockets.md              # Socket.io events
│   ├── setup/                         # Setup Guides
│   │   ├── development.md             # Dev environment
│   │   ├── deployment.md              # Production deployment
│   │   └── contributing.md            # Contribution guide
│   ├── design/                        # Design Documentation
│   │   ├── ui-components.md           # Component guide
│   │   ├── user-flows.md              # User journey maps
│   │   └── wireframes/                # Wireframe files
│   └── technical/                     # Technical Specs
│       ├── architecture.md            # System architecture
│       ├── database-schema.md         # DB schema docs
│       └── socket-events.md           # Real-time events
│
├── scripts/                           # Utility Scripts
│   ├── build.sh                       # Build script
│   ├── deploy.sh                      # Deployment script
│   ├── seed-db.js                     # Database seeding
│   ├── migrate.js                     # Database migrations
│   └── test.sh                        # Test runner
│
└── deployment/                        # Deployment Configuration
    ├── docker/                        # Docker files
    │   ├── Dockerfile.client          # Frontend container
    │   ├── Dockerfile.server          # Backend container
    │   └── docker-compose.prod.yml    # Production compose
    ├── nginx/                         # Nginx configuration
    │   ├── nginx.conf                 # Main config
    │   └── ssl/                       # SSL certificates
    ├── aws/                           # AWS deployment
    │   ├── cloudformation.yml         # Infrastructure as code
    │   └── deploy.yml                 # Deploy pipeline
    └── kubernetes/                    # K8s configuration
        ├── deployment.yml             # App deployment
        ├── service.yml                # Service config
        └── ingress.yml                # Ingress rules

# Key Dependencies Summary:

## Frontend (client/package.json):
# - react, react-dom, react-router-dom
# - @monaco-editor/react (code editor)
# - socket.io-client (real-time)
# - axios (API calls)
# - tailwindcss (styling)
# - lucide-react (icons)
# - react-hot-toast (notifications)

## Backend (server/package.json):
# - express (web framework)
# - socket.io (real-time)
# - postgres (database)
# - redis (caching/sessions)
# - jsonwebtoken (auth)
# - bcryptjs (password hashing)
# - cors, helmet (security)
# - joi (validation)
