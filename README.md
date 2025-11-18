# 💬 Real-time Chat API

A real-time chat API with WebSockets, user authentication, and message management.

Built with **Node.js**, **Express**, **TypeScript**, **MongoDB**, and **Socket.io**.

## ✨ Features

- Real-time messaging with WebSockets
- User authentication with JWT
- Message history and persistence
- Room/Channel management
- User presence status

## 🚀 Tech Stack

- **Node.js + Express + TypeScript**
- **MongoDB + Mongoose**
- **Socket.io** (WebSockets)
- **JWT** (Authentication)
- **Docker** (MongoDB)

## 📁 Project Structure

```
chat_api/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   ├── sockets/
│   └── utils/
├── tests/
├── docs/
├── package.json
├── tsconfig.json
└── docker-compose.yml
```

## 🛠️ Setup

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Levantar MongoDB con Docker
docker-compose up -d

# Iniciar en desarrollo
npm run dev
```

## 📝 Project Status

In development...

## 📖 License

MIT




