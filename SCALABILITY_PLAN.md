# Typing Speed Calculator - Scalability Plan

## Executive Summary

This document outlines a practical plan for scaling the Typing Speed Calculator into a multi-user application with real-time updates and progress tracking using native WebSockets, Node.js backend, and PostgreSQL database.

---

## 1. Architecture Overview

### 1.1 System Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   React Client  │◄──WS───►│   Node.js Server  │◄────────►│   PostgreSQL    │
│   (Frontend)    │         │   (Backend)       │         │   (Database)    │
└─────────────────┘         └──────────────────┘         └─────────────────┘
      │                              │
      │ HTTP/REST                    │
      └──────────────────────────────┘
```

### 1.2 Technology Stack

**Frontend:**

- React 18+ (upgrade from 16.13.1)
- Native WebSocket API (browser built-in)
- Axios for REST API calls

**Backend:**

- Node.js 18+ with Express.js
- `ws` library for WebSocket server
- PostgreSQL 14+ for data persistence
- `pg` library for database queries (simple, no ORM needed initially)
- JWT for authentication
- Bcrypt for password hashing

**Infrastructure:**

- Docker & Docker Compose for local development
- PM2 for process management (production)

---

## 2. Database Schema

### 2.1 Simplified PostgreSQL Tables

```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Texts/Prompts Table
CREATE TABLE texts (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    difficulty_level VARCHAR(20) DEFAULT 'medium',
    word_count INTEGER,
    character_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Typing Sessions Table
CREATE TABLE typing_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    text_id INTEGER REFERENCES texts(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INTEGER,
    correct_characters INTEGER,
    wpm DECIMAL(10, 2),
    accuracy DECIMAL(5, 2),
    is_completed BOOLEAN DEFAULT false
);

-- User Statistics Table (calculated from sessions)
CREATE TABLE user_statistics (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_sessions INTEGER DEFAULT 0,
    average_wpm DECIMAL(10, 2) DEFAULT 0,
    best_wpm DECIMAL(10, 2) DEFAULT 0,
    average_accuracy DECIMAL(5, 2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Simple Leaderboard (top scores only)
CREATE TABLE leaderboard (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    wpm DECIMAL(10, 2) NOT NULL,
    accuracy DECIMAL(5, 2) NOT NULL,
    session_id INTEGER REFERENCES typing_sessions(id),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_sessions_user_id ON typing_sessions(user_id);
CREATE INDEX idx_sessions_completed_at ON typing_sessions(completed_at);
CREATE INDEX idx_leaderboard_wpm ON leaderboard(wpm DESC);
CREATE INDEX idx_users_username ON users(username);
```

---

## 3. API Endpoints

### 3.1 Authentication Endpoints

```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - User login (returns JWT)
GET    /api/auth/me           - Get current user info
```

### 3.2 Text/Prompt Endpoints

```
GET    /api/texts/random      - Get random text
GET    /api/texts/:id         - Get specific text by ID
```

### 3.3 Session Endpoints

```
POST   /api/sessions          - Create new typing session
GET    /api/sessions          - Get user's recent sessions (limit 20)
PATCH  /api/sessions/:id      - Update session (mark as completed)
```

### 3.4 Statistics Endpoints

```
GET    /api/stats/user        - Get current user statistics
GET    /api/stats/leaderboard - Get top 50 leaderboard
```

---

## 4. WebSocket Protocol

### 4.1 Connection

**Client connects to:** `ws://localhost:3001` (or `wss://` in production)

**Authentication:**

- Client sends JWT token in connection query: `ws://localhost:3001?token=JWT_TOKEN`
- Server validates token on connection
- If invalid, server closes connection

### 4.2 Message Format

All messages are JSON:

```javascript
{
  "type": "message_type",
  "data": { ... }
}
```

### 4.3 Client → Server Messages

```javascript
// Start typing session
{
  "type": "session:start",
  "data": {
    "textId": 123
  }
}

// Send typing input (throttled to max 1 per 100ms)
{
  "type": "typing:input",
  "data": {
    "sessionId": 456,
    "input": "Hello wor",
    "position": 9
  }
}

// Complete typing
{
  "type": "typing:complete",
  "data": {
    "sessionId": 456,
    "finalInput": "Hello world"
  }
}
```

### 4.4 Server → Client Messages

```javascript
// Session created
{
  "type": "session:created",
  "data": {
    "sessionId": 456,
    "textId": 123,
    "text": "Hello world..."
  }
}

// Progress update
{
  "type": "progress:update",
  "data": {
    "sessionId": 456,
    "correctChars": 9,
    "wpm": 45.2,
    "seconds": 12
  }
}

// Session completed
{
  "type": "session:completed",
  "data": {
    "sessionId": 456,
    "wpm": 52.3,
    "accuracy": 98.5,
    "duration": 15
  }
}

// Error
{
  "type": "error",
  "data": {
    "message": "Invalid session"
  }
}
```

---

## 5. Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # PostgreSQL connection pool
│   │   └── env.js               # Environment variables
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── textController.js
│   │   ├── sessionController.js
│   │   └── statsController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   └── errorHandler.js      # Error handling
│   ├── routes/
│   │   ├── auth.js
│   │   ├── texts.js
│   │   ├── sessions.js
│   │   └── stats.js
│   ├── services/
│   │   ├── typingService.js     # Business logic
│   │   ├── statsService.js      # Statistics calculations
│   │   └── websocketService.js  # WebSocket handlers
│   ├── utils/
│   │   ├── calculateWPM.js
│   │   ├── calculateAccuracy.js
│   │   └── jwt.js
│   ├── websocket/
│   │   └── server.js            # WebSocket server setup
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
├── migrations/
│   └── 001_initial_schema.sql
├── seeds/
│   └── texts.sql
├── .env.example
├── package.json
└── docker-compose.yml
```

---

## 6. Frontend Changes

### 6.1 New Components Structure

```
src/
├── components/
│   ├── Typing/
│   │   ├── Preview.jsx          # (existing, enhanced)
│   │   └── Speed.jsx            # (existing, enhanced)
│   ├── Auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── Dashboard/
│   │   ├── StatsCard.jsx
│   │   └── RecentSessions.jsx
│   └── Leaderboard/
│       └── LeaderboardTable.jsx
├── services/
│   ├── api.js                   # Axios instance
│   ├── websocket.js             # WebSocket client wrapper
│   └── authService.js
├── hooks/
│   ├── useAuth.js
│   ├── useTypingSession.js
│   └── useWebSocket.js
├── context/
│   └── AuthContext.jsx
└── App.jsx
```

### 6.2 Key Frontend Changes

1. **Authentication**

   - Simple login/register forms
   - JWT token storage in localStorage
   - Protected routes

2. **WebSocket Integration**

   - Native WebSocket connection
   - Auto-reconnect on disconnect
   - Throttle typing events (max 1 per 100ms)

3. **Session Management**
   - Create session via REST API
   - Send typing updates via WebSocket
   - Timer stops when text is completely typed (already implemented)

---

## 7. Implementation Phases

### Phase 1: Backend Foundation (Week 1)

- [ ] Set up Node.js/Express project
- [ ] Configure PostgreSQL database
- [ ] Create database schema
- [ ] Implement authentication (JWT)
- [ ] Create REST API endpoints
- [ ] Set up WebSocket server with `ws` library

### Phase 2: Core Features (Week 2)

- [ ] Implement typing session creation
- [ ] WebSocket message handling
- [ ] Real-time progress updates
- [ ] WPM and accuracy calculations
- [ ] Session completion logic
- [ ] Timer stops on completion

### Phase 3: Statistics & Leaderboard (Week 3)

- [ ] User statistics calculation
- [ ] Leaderboard system
- [ ] Statistics API endpoints

### Phase 4: Frontend Integration (Week 4)

- [ ] Upgrade React to 18+
- [ ] Add authentication UI
- [ ] Integrate WebSocket client
- [ ] Connect to backend APIs
- [ ] Implement real-time updates
- [ ] Add dashboard and leaderboard UI

### Phase 5: Testing & Polish (Week 5)

- [ ] Basic testing
- [ ] Bug fixes
- [ ] UI improvements
- [ ] Documentation

---

## 8. Real-time Updates Flow

### 8.1 Typing Session Flow

```
1. User clicks "Start Typing"
   → Frontend: POST /api/sessions (create session)
   → Backend: Create session, return session_id and text
   → Frontend: Connect WebSocket, send 'session:start'
   → Backend: Validate, send 'session:created'

2. User types character
   → Frontend: Throttle and send 'typing:input' via WebSocket
   → Backend: Calculate progress (correct chars, WPM)
   → Backend: Send 'progress:update' to client
   → Frontend: Update UI in real-time

3. User completes text
   → Frontend: Detect completion, send 'typing:complete'
   → Backend: Stop timer, calculate final stats
   → Backend: Save to database, update user statistics
   → Backend: Send 'session:completed' with final stats
   → Frontend: Show completion screen
```

### 8.2 Timer Management

**Implementation:**

- Timer starts on first keystroke (frontend)
- Timer stops when `userInput === targetText` (frontend)
- Server validates completion and records exact time
- Server calculates precise duration from `started_at` to `completed_at`

---

## 9. Security Considerations

1. **Authentication**

   - JWT tokens with 24h expiration
   - Password hashing with bcrypt (10 rounds)
   - Rate limiting on auth endpoints (5 requests per minute)

2. **WebSocket Security**

   - Authenticate on connection (JWT in query string)
   - Validate all messages
   - Rate limit: max 10 messages per second per connection
   - Close connection on invalid messages

3. **Input Validation**

   - Validate all user inputs
   - Use parameterized queries (prevent SQL injection)
   - Sanitize text content

4. **CORS & HTTPS**
   - Configure CORS for frontend domain only
   - Use HTTPS/WSS in production

---

## 10. Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=typing_speed
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=24h

# WebSocket
WS_PORT=3001  # Same as HTTP server
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001
```

---

## 11. Dependencies

### Backend (package.json)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.14.2",
    "pg": "^8.11.3",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^6.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Frontend (package.json additions)

```json
{
  "dependencies": {
    "axios": "^1.5.0"
  }
}
```

---

## 12. WebSocket Server Implementation Example

### 12.1 Server Setup (backend/src/websocket/server.js)

```javascript
const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const { handleWebSocketMessage } = require("../services/websocketService");

function setupWebSocket(server) {
  const wss = new WebSocket.Server({
    server,
    path: "/ws",
  });

  wss.on("connection", (ws, req) => {
    // Authenticate via JWT token in query string
    const token = new URL(
      req.url,
      `http://${req.headers.host}`
    ).searchParams.get("token");

    if (!token) {
      ws.close(1008, "Authentication required");
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.userId = decoded.userId;
      ws.username = decoded.username;

      ws.send(
        JSON.stringify({
          type: "connected",
          data: { message: "WebSocket connected" },
        })
      );
    } catch (error) {
      ws.close(1008, "Invalid token");
      return;
    }

    // Handle messages
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message);
        await handleWebSocketMessage(ws, data);
      } catch (error) {
        ws.send(
          JSON.stringify({
            type: "error",
            data: { message: "Invalid message format" },
          })
        );
      }
    });

    ws.on("close", () => {
      console.log(`Client disconnected: ${ws.username}`);
    });
  });

  return wss;
}

module.exports = { setupWebSocket };
```

### 12.2 Client Connection (frontend/src/services/websocket.js)

```javascript
class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(token) {
    return new Promise((resolve, reject) => {
      const wsUrl = `${process.env.REACT_APP_WS_URL}/ws?token=${token}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      };

      this.ws.onerror = (error) => {
        reject(error);
      };

      this.ws.onclose = () => {
        this.attemptReconnect(token);
      };
    });
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  handleMessage(message) {
    // Handle different message types
    switch (message.type) {
      case "session:created":
        // Handle session creation
        break;
      case "progress:update":
        // Handle progress update
        break;
      case "session:completed":
        // Handle completion
        break;
      default:
        console.log("Unknown message type:", message.type);
    }
  }

  attemptReconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect(token);
      }, 1000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default new WebSocketService();
```

---

## 13. Database Queries (Simple, No ORM)

### 13.1 Example: Create Session

```javascript
const { pool } = require("../config/database");

async function createSession(userId, textId) {
  const query = `
    INSERT INTO typing_sessions (user_id, text_id, started_at)
    VALUES ($1, $2, NOW())
    RETURNING id, started_at
  `;
  const result = await pool.query(query, [userId, textId]);
  return result.rows[0];
}
```

### 13.2 Example: Update Statistics

```javascript
async function updateUserStats(userId, wpm, accuracy) {
  const query = `
    INSERT INTO user_statistics (user_id, total_sessions, average_wpm, best_wpm, average_accuracy)
    VALUES ($1, 1, $2, $2, $3)
    ON CONFLICT (user_id) 
    DO UPDATE SET
      total_sessions = user_statistics.total_sessions + 1,
      average_wpm = (user_statistics.average_wpm * user_statistics.total_sessions + $2) / (user_statistics.total_sessions + 1),
      best_wpm = GREATEST(user_statistics.best_wpm, $2),
      average_accuracy = (user_statistics.average_accuracy * user_statistics.total_sessions + $3) / (user_statistics.total_sessions + 1),
      updated_at = NOW()
  `;
  await pool.query(query, [userId, wpm, accuracy]);
}
```

---

## 14. Deployment

### 14.1 Simple Deployment Checklist

- [ ] Database migrations run
- [ ] Environment variables configured
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Error handling in place
- [ ] PM2 configured for process management
- [ ] SSL certificates installed (for WSS)

### 14.2 Docker Compose (Local Development)

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: typing_speed
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=typing_speed
      - DB_USER=postgres
      - DB_PASSWORD=postgres
    depends_on:
      - postgres

volumes:
  postgres_data:
```

---

## 15. Key Simplifications

1. **No ORM** - Use `pg` library directly (simpler, more control)
2. **No Redis** - Not needed for MVP
3. **No complex caching** - PostgreSQL is fast enough
4. **Simple leaderboard** - Single table, top 50 only
5. **No typing events table** - Too granular, not needed
6. **Native WebSocket** - Use `ws` library, not Socket.io
7. **Simple authentication** - JWT only, no refresh tokens initially
8. **No pause/resume** - Keep it simple
9. **Throttled updates** - Max 1 WebSocket message per 100ms

---

## Conclusion

This simplified plan focuses on core functionality:

- Multi-user support with authentication
- Real-time typing updates via WebSocket
- Progress tracking and statistics
- Simple leaderboard
- Timer stops on completion

**Next Steps:**

1. Set up backend project structure
2. Create database schema
3. Implement authentication
4. Set up WebSocket server
5. Integrate with frontend

---

**Document Version:** 2.0 (Simplified)  
**Last Updated:** 2024
