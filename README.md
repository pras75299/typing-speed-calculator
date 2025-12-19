# Typing Speed Calculator

A React application that measures typing speed (WPM) with real-time feedback. Features include animated typing cursor, character highlighting, and multi-user support with WebSocket integration.

## Project Structure

```
typing-speed-calculator/
├── frontend/          # React frontend application
│   ├── src/          # Source code
│   ├── public/       # Static files
│   └── package.json
├── backend/          # Node.js backend server
│   ├── src/          # Source code
│   ├── migrations/   # Database migrations
│   ├── seeds/        # Seed data
│   └── package.json
├── SCALABILITY_PLAN.md  # Architecture and scalability plan
└── README.md         # This file
```

## Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment:
```bash
cp .env.example .env
```

4. Set up database:
```bash
npm run db:setup
```

5. Start backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment:
```bash
cp .env.example .env
```

4. Start frontend development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## Features

- ✅ Real-time typing speed calculation (WPM)
- ✅ Animated typing cursor
- ✅ Character-by-character feedback (correct/incorrect)
- ✅ Timer stops automatically when text is completed
- ✅ Multi-user support with authentication
- ✅ WebSocket integration for real-time updates
- ✅ User statistics and leaderboard
- ✅ PostgreSQL database for data persistence

## Technology Stack

**Frontend:**
- React 18+
- Native WebSocket API
- Modern CSS

**Backend:**
- Node.js with Express
- WebSocket server (ws library)
- PostgreSQL
- JWT authentication

## Documentation

- [Backend README](./backend/README.md) - Backend setup and API documentation
- [Frontend README](./frontend/README.md) - Frontend setup and development
- [Scalability Plan](./SCALABILITY_PLAN.md) - Architecture and scaling plan

## Development

### Running Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Database Management

```bash
cd backend

# Start database
npm run db:up

# Stop database
npm run db:down

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed

# Complete setup
npm run db:setup
```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/texts/random` - Get random text
- `POST /api/sessions` - Create typing session
- `GET /api/sessions` - Get user sessions
- `GET /api/stats/user` - Get user statistics
- `GET /api/stats/leaderboard` - Get leaderboard

## WebSocket

Connect to: `ws://localhost:3001/ws?token=JWT_TOKEN`

See [Backend README](./backend/README.md) for WebSocket message protocol.

## License

ISC
