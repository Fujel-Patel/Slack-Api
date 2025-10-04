# Slack API Integration Project

A Node.js backend application that integrates with the Slack API to handle messages and channel operations.

## Features

- Send instant messages to Slack channels
- Schedule messages with multiple timing options
- Retrieve channel messages
- Edit existing messages
- Delete messages
- List all available channels

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Slack Workspace Admin access
- Slack Bot Token

## Environment Variables

Create a .env file in the Backend directory with the following variables:

```env
PORT=8000
SLACK_TOKEN=your-slack-bot-token
SLACK_CHANNEL_ID=default-channel-id
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Fujel-Patel/Slack-Api.git
cd slack-mern-app/Backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

## API Endpoints

### 1. Send Message
- **POST** `/api/v1/slack/send-message`
- **Body:**
```json
{
    "channel": "channel-id",  // optional
    "text": "Your message"
}
```

### 2. Schedule Message
- **POST** `/api/v1/slack/schedule-message`
- **Body:** (multiple scheduling options available)
```json
{
    "channel": "channel-id",  // optional
    "text": "Your message",
    // Choose one of the following timing options:
    "post_at": 1728132600,  // Unix timestamp
    "scheduled_time": "2024-10-05 15:30:00",  // Human readable time
    "delay_minutes": 30,  // Schedule in X minutes
    "delay_hours": 2  // Schedule in X hours
}
```

### 3. Get Messages
- **GET** `/api/v1/slack/get-messages/:channel`
- Retrieves recent messages from specified channel

### 4. Edit Message
- **PUT** `/api/v1/slack/edit-message`
- **Body:**
```json
{
    "channel": "channel-id",
    "ts": "message-timestamp",
    "text": "Updated message text"
}
```

### 5. Delete Message
- **DELETE** `/api/v1/slack/delete-message`
- **Body:**
```json
{
    "channel": "channel-id",
    "ts": "message-timestamp"
}
```

### 6. List Channels
- **GET** `/api/v1/slack/list-channels`
- Lists all available channels

## Response Formats

All API endpoints return responses in the following format:

### Success Response
```json
{
    "success": true,
    "message": "Operation successful",
    "data": {
        // Operation specific data
    }
}
```

### Error Response
```json
{
    "success": false,
    "error": "Error message"
}
```

## Validation

The API includes comprehensive validation for:
- Message text (required, max length)
- Channel IDs
- Timestamps
- Scheduling parameters
- Date formats

## Error Handling

- Proper error messages for invalid inputs
- Slack API error handling
- Server error handling

## Time Zones

The application uses Indian Standard Time (IST) for displaying dates and times.

## Author

Fujel Patel
- GitHub: [@Fujel-Patel](https://github.com/Fujel-Patel)