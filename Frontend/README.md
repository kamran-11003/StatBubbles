# StatBubbles NFL Frontend

A React + Vite application for visualizing NFL player statistics with interactive bubble charts.

## Environment Setup

Before running the application, you need to configure the backend URL:

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file with your backend URL:**
   ```bash
   VITE_BACKEND_URL=http://localhost:3000
   ```

For detailed setup instructions, see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md).

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## API Configuration

The application uses a centralized API configuration that reads the backend URL from environment variables. All API calls are routed through the configured backend URL.

## Features

- Interactive bubble chart visualization
- Real-time live scores
- Team and player statistics
- Dark/light theme support
- Responsive design

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Socket.io for real-time updates
- D3.js for data visualization
