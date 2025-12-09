# 💬 Chat API

Real-time chat API with WebSockets, built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Stack

- **Node.js + Express + TypeScript**
- **MongoDB + Mongoose**
- **Socket.io** (WebSockets)
- **JWT** (Authentication)
- **Docker** (MongoDB)

## ✨ Features

- User authentication with JWT
- Real-time messaging with WebSockets
- Room management (public/private rooms)
- Message editing and deletion
- User status tracking (online/offline/away)
- Room membership management

## 🛠️ Setup

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Start MongoDB with Docker
docker-compose up -d mongodb

# Run in development
npm run dev
```

Server runs on `http://localhost:3004`

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/register    - Register user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get profile (auth)
```

### Rooms

```
POST   /api/rooms            - Create room (auth)
GET    /api/rooms            - List all rooms
GET    /api/rooms/:id        - Get room details (auth)
POST   /api/rooms/:id/join   - Join room (auth)
POST   /api/rooms/:id/leave  - Leave room (auth)
```

### Messages

```
POST   /api/messages/:roomId      - Send message (auth)
GET    /api/messages/:roomId      - Get messages (auth)
PUT    /api/messages/:messageId   - Edit message (auth)
DELETE /api/messages/:messageId   - Delete message (auth)
```

## 🔌 WebSocket Events

### Client → Server

- `join_room` - Join a room
- `leave_room` - Leave a room
- `send_message` - Send a message
- `edit_message` - Edit a message
- `delete_message` - Delete a message

### Server → Client

- `new_message` - New message received
- `message_edited` - Message was edited
- `message_deleted` - Message was deleted
- `user_joined` - User joined room
- `user_left` - User left room
- `error` - Error occurred

## 📖 License

MIT




