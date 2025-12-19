# Typing Speed Calculator - Backend

Backend server for the Typing Speed Calculator application with WebSocket support for real-time updates.

## Features

- RESTful API for authentication, texts, sessions, and statistics
- WebSocket server for real-time typing updates
- PostgreSQL database for data persistence
- JWT authentication
- User statistics and leaderboard

## Prerequisites

- Node.js 18+
- Docker and Docker Compose (for database)
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials (defaults work with Docker)

4. Set up database (one command):
```bash
npm run db:setup
```

This will:
- Start PostgreSQL container
- Run database migrations
- Seed initial data

**Alternative manual setup:**
```bash
# Start PostgreSQL
npm run db:up

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed
```

5. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

**Other useful commands:**
```bash
# Stop database
npm run db:down

# View database logs
docker logs typing-speed-db
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires auth)

### Texts
- `GET /api/texts/random` - Get random text
- `GET /api/texts/:id` - Get text by ID

### Sessions
- `POST /api/sessions` - Create new session (requires auth)
- `GET /api/sessions` - Get user sessions (requires auth)
- `PATCH /api/sessions/:id` - Update session (requires auth)

### Statistics
- `GET /api/stats/user` - Get user statistics (requires auth)
- `GET /api/stats/leaderboard` - Get leaderboard

## WebSocket

Connect to: `ws://localhost:3001/ws?token=JWT_TOKEN`

### Message Types

**Client → Server:**
- `session:start` - Start typing session
- `typing:input` - Send typing input
- `typing:complete` - Complete typing

**Server → Client:**
- `connected` - Connection established
- `session:created` - Session created
- `progress:update` - Progress update
- `session:completed` - Session completed
- `error` - Error occurred

## Environment Variables

See `.env.example` for required environment variables.

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── websocket/       # WebSocket server
│   ├── app.js           # Express app
│   └── server.js        # Server entry point
├── migrations/          # Database migrations
├── seeds/               # Seed data
└── docker-compose.yml   # Docker setup
```

