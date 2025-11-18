# 💬 Chat API

API de chat en tiempo real con WebSockets.

## 🚀 Stack

- **Node.js + Express + TypeScript**
- **MongoDB + Mongoose**
- **Socket.io** (WebSockets)
- **JWT** (Autenticación)
- **Docker** (MongoDB)

## 📁 Estructura

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

## 📝 Estado del Proyecto

En desarrollo...

## 📖 Licencia

MIT




