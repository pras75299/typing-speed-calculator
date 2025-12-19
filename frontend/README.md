# Typing Speed Calculator - Frontend

React frontend application for the Typing Speed Calculator with real-time typing updates via WebSocket.

## Features

- Real-time typing speed calculation
- Animated typing cursor
- WebSocket integration for live updates
- User authentication
- Statistics and leaderboard
- Modern, responsive UI

## Prerequisites

- Node.js 18+
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

3. Update `.env` with your backend API and WebSocket URLs:
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001
```

4. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run deploy` - Deploy to GitHub Pages

## Project Structure

```
frontend/
├── public/              # Static files
│   ├── index.html
│   └── ...
├── src/
│   ├── components/      # React components
│   │   ├── Preview.js   # Text preview with cursor
│   │   └── Speed.js     # WPM display
│   ├── utils/          # Utility functions
│   │   └── getRandomText.js
│   ├── App.js          # Main app component
│   ├── App.css         # App styles
│   ├── index.js        # Entry point
│   └── index.css       # Global styles
├── package.json
└── .env.example
```

## Environment Variables

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:3001/api)
- `REACT_APP_WS_URL` - WebSocket server URL (default: ws://localhost:3001)

## Development

The frontend is built with Create React App. Hot reloading is enabled in development mode.

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

