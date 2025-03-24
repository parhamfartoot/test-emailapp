# Email Scheduler Server

This server handles both immediate and scheduled email delivery for the Earth Promises application.

## Features

- **Immediate Email Delivery**: Sends confirmation emails when users submit pledges
- **Scheduled Reminders**: Sends reminder emails 5 years after a pledge if users opt-in
- **Database Persistence**: All scheduled emails are stored in MongoDB and survive server restarts

## How It Works

The application consists of two main components:

1. **API Server** (`server.js`): Handles HTTP requests, immediate email sending, and pledge storage
2. **Email Worker** (`emailWorker.js`): Runs in the background, checking for and sending scheduled emails

When a user submits a pledge with the reminder consent option enabled, the system:
1. Saves the pledge to the database with the `reminderConsent` flag set to true
2. The email worker periodically checks for pledges with `reminderConsent: true` that were created 5 years ago
3. Reminders are sent once and marked as processed using the `remindersProcessed` flag

## Running the Application

### Prerequisites

- Node.js and npm installed
- MongoDB instance (local or remote)
- Gmail account for sending emails

### Environment Variables

Create a `.env` file with:

```
MONGODB_URI=your_mongodb_connection_string
EMAIL_USER=your_gmail_address
EMAIL_APP_PASSWORD=your_gmail_app_specific_password
PORT=5001
```

### Installation

```
npm install
```

### Starting the Application

To run both server and email worker:
```
npm start
```

To run only the server:
```
npm run server
```

To run only the email worker:
```
npm run worker
```

## Testing

To test scheduled email reminders, you can modify the creation date of a pledge in the database to be older than 5 years for a pledge with `reminderConsent: true` and `remindersProcessed: false`. 