# CodeClash⚡

**LeetCode Battles. Real-Time Duels.**

Turn interview prep into competitive sport. Battle friends on LeetCode problems, climb the ranks, and become a coding legend.

## Features

- **Real-time 1v1 battles** - Race to solve coding problems first
- **Email & Google OAuth** - Multiple authentication options  
- **Profile setup** - Customize avatar, skills, and goals
- **Ranking system** - Bronze to Grandmaster progression
- **Leaderboards** - Compete with the community
- **Modern UI** - Clean, responsive design with Tailwind CSS

## Tech Stack

**Frontend:**
- React 18 with modern hooks
- Tailwind CSS for styling
- Socket.io for real-time features
- Lucide React for icons

**Backend:**
- Node.js with Express
- Socket.io for WebSocket connections
- JWT authentication (14-day tokens)
- bcryptjs for password hashing

**Planned:**
- PostgreSQL database
- Judge0 API for code execution
- Monaco Editor for coding interface

## Quick Start

### Prerequisites
- Node.js 16+
- npm 8+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Code-Clash.git
   cd Code-Clash

2. **Install dependencies**
   ```bash
   Install root dependencies
   npm install

3. **Install frontend dependencies**
   ```bash
   cd client && npm install

4. **Install backend dependencies**
    ```bash
    cd ../server && npm install

**Environment setup**

***Client environment***
 - cp client/.env.example
 -  client/.env.local

***Server environment***  
 - cp server/.env.example
 - server/.env

**Start development servers**

From root directory, `npm run dev` starts:
- ***Frontend:*** http://localhost:3000

- ***Backend:*** http://localhost:3001

**Available Scripts**
***Root directory:***

`npm run dev` - Start both frontend and backend
`npm run client` - Start frontend only
`npm run server` - Start backend only

Frontend (client/):

`npm start` - Start React development server
`npm run build` - Build for production

Backend (server/):

`npm run dev` - Start with nodemon (auto-restart)
`npm start` - Start production server
