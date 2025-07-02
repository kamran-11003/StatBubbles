# StatBubbles Application Workflow Documentation

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Application Startup Process](#application-startup-process)
3. [Data Flow and API Integration](#data-flow-and-api-integration)
4. [Real-Time Updates System](#real-time-updates-system)
5. [Frontend-Backend Communication](#frontend-backend-communication)
6. [Database Operations](#database-operations)
7. [Error Handling and Recovery](#error-handling-and-recovery)
8. [Deployment Considerations](#deployment-considerations)

---

## System Architecture Overview

StatBubbles is a full-stack sports statistics application with real-time capabilities, consisting of:

- **Backend**: Node.js/Express server with MongoDB database
- **Frontend**: React application with Socket.IO for real-time updates
- **External APIs**: ESPN API for live scores and team data
- **Real-time Communication**: WebSocket connections via Socket.IO

### Key Components:
- **Server** (`src/server.js`): Main application entry point
- **Live Scores Service** (`src/services/live-scores.service.js`): Manages ESPN API calls
- **Stats Services**: Sport-specific services for player statistics
- **Socket Service** (`src/services/socket.service.js`): Real-time communication
- **Database Models**: MongoDB schemas for teams and players
- **Frontend Components**: React components for UI rendering

---

## Application Startup Process

### 1. Server Initialization (`src/server.js`)

```javascript
// Initialize function execution order:
async function initialize() {
  1. Connect to MongoDB (connectDB())
  2. Initial stats fetch (refreshAllStats())
  3. Start live scores monitoring (LiveScoresService.startMonitoring())
  4. Set up periodic refresh (every 6 hours)
  5. Start HTTP server
}
```

### 2. Database Connection (`src/config/database.js`)
- Connects to MongoDB using `MONGODB_URI` environment variable
- Exits process if connection fails
- Required for all data operations

### 3. Initial Data Loading
- **Teams Data**: Fetches and stores team information for all sports
- **Player Stats**: Processes player statistics for all active players
- **Live Games**: Initial fetch of current live and scheduled games

---

## Data Flow and API Integration

### ESPN API Integration

The application integrates with ESPN's API endpoints:

```javascript
const SPORTS = {
  NBA: 'basketball/nba',
  WNBA: 'basketball/wnba', 
  MLB: 'baseball/mlb',
  NFL: 'football/nfl',
  NHL: 'hockey/nhl'
};
```

#### API Endpoints Used:
- **Teams**: `https://site.api.espn.com/apis/site/v2/sports/{sport}/teams`
- **Standings**: `https://site.web.api.espn.com/apis/v2/sports/{sport}/standings`
- **Scoreboard**: `https://site.api.espn.com/apis/site/v2/sports/{sport}/scoreboard`
- **Player Stats**: Sport-specific endpoints for player statistics

### Data Processing Workflow

#### 1. Team Data Processing
```javascript
// For each sport (NBA, WNBA, MLB, NFL, NHL):
1. Fetch team data from ESPN API
2. Transform and normalize data
3. Store in MongoDB collection (e.g., 'nbateams', 'wnbateams')
4. Update team standings and statistics
```

#### 2. Player Stats Processing
```javascript
// For each sport:
1. Fetch team roster from ESPN API
2. For each player:
   - Extract player information (name, position, team, etc.)
   - Fetch current season statistics
   - Calculate derived statistics
   - Store in MongoDB collection
3. Update player rankings and top performers
```

---

## Real-Time Updates System

### Live Scores Monitoring (`src/services/live-scores.service.js`)

The live scores service implements **dynamic refresh intervals** based on game status:

#### Refresh Intervals:
- **Live Games (InProgress)**: Every 20 seconds
- **Scheduled Games**: Dynamic intervals based on time until game start:
  - 5 minutes or less: Every 30 seconds
  - 30 minutes or less: Every 2 minutes
  - 2 hours or less: Every 10 minutes
  - 6 hours or less: Every 30 minutes
  - Beyond 6 hours: Every 2 hours
- **No Games**: Every 6 hours

#### Game Status Tracking:
```javascript
// Game statuses tracked:
- "Scheduled": Game hasn't started
- "InProgress": Game is currently live
- "Final": Game has ended
- "F/OT": Final in overtime
- "F/SO": Final in shootout
```

### Socket.IO Real-Time Communication

#### Connection Management:
```javascript
// Frontend connection:
socketRef.current = io('');

// Backend handling:
this.io.on('connection', (socket) => {
  // Handle subscriptions, data updates, disconnections
});
```

#### Event Types:
- **`liveScore`**: Real-time game score updates
- **`gameRemoved`**: Game completion notifications
- **`stats`**: Player statistics updates
- **`teams`**: Team data updates
- **`subscribe`/`unsubscribe`**: Client subscription management

---

## Frontend-Backend Communication

### API Endpoints

#### Live Scores:
- `GET /api/live-scores` - Fetch all current live games

#### Player Statistics:
- `GET /api/stats/{sport}/{statType}` - Get top players by stat
- `GET /api/stats/{sport}/search?name={query}` - Search players

#### Team Data:
- `GET /api/teams/{sport}/search?name={query}` - Search teams

### Real-Time Data Flow

#### 1. Initial Load:
```javascript
// Frontend startup:
1. Connect to Socket.IO server
2. Fetch initial live games via REST API
3. Subscribe to real-time updates
4. Load initial player/team data based on selected league
```

#### 2. Real-Time Updates:
```javascript
// Live score updates:
Backend → Socket.IO → Frontend → UI Update

// Stats updates:
Backend → Socket.IO → Frontend → Bubble Chart Update
```

#### 3. User Interactions:
```javascript
// League selection:
Frontend → API Call → Backend → Database Query → Frontend

// Search functionality:
Frontend → Debounced API Call → Backend → Database Search → Frontend
```

---

## Database Operations

### MongoDB Collections

#### Team Collections:
- `nbateams` - NBA team data and standings
- `wnbateams` - WNBA team data and standings
- `mlbteams` - MLB team data and standings
- `nflteams` - NFL team data and standings
- `nhlteams` - NHL team data and standings

#### Player Collections:
- `nbaplayers` - NBA player statistics
- `wnbaplayers` - WNBA player statistics
- `mlbplayers` - MLB player statistics
- `nflplayers` - NFL player statistics
- `nhlplayers` - NHL player statistics

### Data Operations

#### Upsert Operations:
```javascript
// Team data updates:
await collection.updateOne(
  { teamId: team.id },
  { $set: teamDoc },
  { upsert: true }
);

// Player data updates:
await collection.updateOne(
  { athleteId: athlete.id },
  { $set: playerDoc },
  { upsert: true }
);
```

#### Query Operations:
```javascript
// Top players by stat:
await collection.find({})
  .sort({ [`stats.${statType}`]: -1 })
  .limit(parseInt(playerCount))
  .toArray();

// Search operations:
await collection.find({
  $or: [
    { fullName: { $regex: query, $options: 'i' } },
    { displayName: { $regex: query, $options: 'i' } }
  ]
}).toArray();
```

---

## Error Handling and Recovery

### Backend Error Handling

#### Database Connection Failures:
```javascript
// Database connection:
try {
  await mongoose.connect(process.env.MONGODB_URI);
} catch (err) {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if database connection fails
}
```

#### API Call Failures:
```javascript
// ESPN API calls:
try {
  const response = await axios.get(url);
  // Process data
} catch (err) {
  console.error(`Error fetching ${sportPath}:`, err.message);
  return []; // Return empty array on failure
}
```

#### Service Failures:
```javascript
// Stats processing:
try {
  await refreshAllStats();
} catch (error) {
  console.error('Error refreshing stats:', error);
  // Continue running, don't exit process
}
```

### Frontend Error Handling

#### Network Failures:
```javascript
// API calls with error handling:
fetch('/api/stats/${activeLeague}/${selectedStat}')
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .catch(error => {
    console.error('Error fetching stats:', error);
    // Handle gracefully in UI
  });
```

#### Socket Connection Failures:
```javascript
// Socket connection with reconnection:
socketRef.current = io('', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});
```

---

## Deployment Considerations

### Environment Variables Required:
```bash
MONGODB_URI=mongodb://your-mongodb-connection-string
PORT=3000 (optional, defaults to 3000)
```

### Render Deployment Issues:

#### 1. 503 Service Unavailable Errors:
- **Cause**: Application crashes on startup
- **Common Issues**:
  - Missing `MONGODB_URI` environment variable
  - Database connection failures
  - Heavy initialization process timing out
  - Memory/CPU limits exceeded

#### 2. Performance Considerations:
- **API Rate Limiting**: ESPN API may rate-limit frequent requests
- **Database Load**: Frequent upserts can impact performance
- **Memory Usage**: Large datasets in memory
- **CPU Usage**: Heavy data processing on startup

#### 3. Recommended Optimizations:
```javascript
// Reduce API call frequency:
- Increase live game refresh from 20s to 60s
- Implement exponential backoff for failed API calls
- Add request caching for static data
- Implement graceful degradation for API failures

// Optimize database operations:
- Use bulk operations for multiple updates
- Implement connection pooling
- Add database indexes for frequent queries
- Implement data pagination for large datasets
```

### Monitoring and Logging:
```javascript
// Key metrics to monitor:
- API response times
- Database query performance
- Socket connection count
- Memory usage
- Error rates
- Live game count
```

---

## Troubleshooting Guide

### Common Issues:

#### 1. Application Won't Start:
- Check MongoDB connection string
- Verify all environment variables are set
- Check for syntax errors in server code
- Review startup logs for specific error messages

#### 2. No Live Data:
- Verify ESPN API endpoints are accessible
- Check network connectivity
- Review API rate limiting
- Verify data processing services are running

#### 3. Real-Time Updates Not Working:
- Check Socket.IO connection status
- Verify client-server communication
- Review subscription management
- Check for JavaScript errors in browser console

#### 4. Database Issues:
- Verify MongoDB connection
- Check collection permissions
- Review data schema consistency
- Monitor database performance

### Debug Commands:
```bash
# Check application logs:
npm start

# Test database connection:
node -e "require('./src/config/database.js')()"

# Test API endpoints:
curl http://localhost:3000/api/live-scores

# Monitor Socket.IO connections:
# Check browser console for connection logs
```

---

This documentation provides a comprehensive overview of the StatBubbles application workflow, from startup to real-time data processing and user interactions. Understanding these workflows is crucial for debugging deployment issues and optimizing application performance. 