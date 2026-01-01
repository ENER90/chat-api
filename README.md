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

## 💻 Example Usage

### Register & Login

```bash
# Register
curl -X POST http://localhost:3004/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@test.com","password":"123456"}'

# Login (get token)
curl -X POST http://localhost:3004/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"123456"}'
```

### Create Room & Send Message

```bash
# Create room
curl -X POST http://localhost:3004/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"General Chat","description":"Main chat room","type":"public"}'

# Send message
curl -X POST http://localhost:3004/api/messages/ROOM_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content":"Hello everyone!"}'

# Get messages
curl http://localhost:3004/api/messages/ROOM_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 Environment Variables

Create `.env` file:

```env
PORT=3004
MONGODB_URI=mongodb://admin:password123@localhost:27019/chat-db?authSource=admin
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3004
```

## 📖 License

MIT




