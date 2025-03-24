# Earth Promises

A full-stack application for tracking and managing environmental pledges.

## Deployment

This application is now configured for deployment on Render.com. For detailed deployment instructions, see the [Deployment Guide](./DEPLOYMENT.md).

## Project Structure

- `/client` - React frontend application
- `/server` - Node.js backend API

## Setup

### Backend Setup

```bash
cd server
npm install
# Create a .env file with your configuration (see .env.example)
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm start
```

## Available Scripts

### Backend

- `npm run dev` - Start the server in development mode
- `npm run start:prod` - Start the server in production mode

### Frontend

- `npm start` - Start the React application in development mode
- `npm run build` - Build the application for production
- `npm run build:prod` - Build with production API URL

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests. 