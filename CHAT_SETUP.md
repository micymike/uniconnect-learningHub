# Study Chat Feature Setup

## Overview
The Study Chat feature enables real-time communication between students with the following capabilities:
- Real-time messaging with WebSocket support
- Study mate management (add/search students)
- Message editing (within 15 minutes)
- Message deletion
- Typing indicators
- Online status indicators
- Message history

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install @nestjs/websockets @nestjs/platform-socket.io
```

### 2. Database Setup
Run the SQL script to create the required tables:
```sql
-- Execute the contents of backend/src/chat/database-setup.sql in your Supabase database
```

### 3. Environment Variables
Ensure your backend `.env` file includes:
```env
FRONTEND_URL=http://localhost:3000
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend-1
npm install socket.io-client
```

### 2. Environment Variables
Ensure your frontend `.env` file includes:
```env
VITE_API_URL=http://localhost:3001/api
```

## Features

### Real-time Messaging
- Instant message delivery using WebSockets
- Message status indicators
- Typing indicators

### Study Mate Management
- Search for online students
- Add students as study mates
- View study mate list with online status

### Message Management
- Edit messages within 15 minutes of sending
- Delete messages
- Message history with timestamps

### User Status
- Online/offline indicators
- Last seen timestamps
- Typing status

## Usage

1. Navigate to "Study Chat" in the sidebar
2. Search for students to add as study mates
3. Click on a study mate to start chatting
4. Use the message input to send messages
5. Right-click or use buttons to edit/delete messages

## API Endpoints

### Chat Messages
- `POST /chat/messages` - Send a message
- `GET /chat/messages/:otherUserId` - Get message history
- `PUT /chat/messages/:messageId` - Edit a message
- `DELETE /chat/messages/:messageId` - Delete a message

### Study Mates
- `POST /chat/study-mates` - Add a study mate
- `GET /chat/study-mates` - Get study mate list
- `GET /chat/search-users` - Search for users

### User Status
- `POST /chat/status` - Update user status

## WebSocket Events

### Client to Server
- `joinRoom` - Join a chat room
- `sendMessage` - Send a message
- `typing` - Send typing indicator
- `editMessage` - Edit a message
- `deleteMessage` - Delete a message

### Server to Client
- `newMessage` - Receive new message
- `userTyping` - Receive typing indicator
- `messageEdited` - Message was edited
- `messageDeleted` - Message was deleted
- `userOnline` - User came online
- `userOffline` - User went offline

## Security Features

- JWT authentication required for all endpoints
- Row Level Security (RLS) policies in database
- Users can only see their own messages
- Message editing time limit (15 minutes)
- Input validation and sanitization