# Task Management Dashboard

A full-stack task management application built with React, TypeScript, Node.js, Express, and MongoDB.

## 🏗️ Project Structure

```
TaskDashboard/
├── Backend/          # Node.js/Express API (Deploy to Render)
├── Frontend/         # React/Vite Frontend (Deploy to Vercel)
└── README.md
```

This is a **monorepo** - both frontend and backend in one repository, deployed separately.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Local Development

#### Backend
```bash
cd Backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

#### Frontend
```bash
cd Frontend
npm install
cp .env.example .env  # Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

## 📦 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

**Quick Summary:**
- **Backend**: Deploy to [Render.com](https://render.com)
- **Frontend**: Deploy to [Vercel](https://vercel.com)

## 🔧 Environment Variables

### Backend
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration (default: 7d)
- `CORS_ORIGIN` - Allowed frontend origin
- `PORT` - Server port (default: 5000)

### Frontend
- `VITE_API_URL` - Backend API URL

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Security Audit Report](./SECURITY_AUDIT_REPORT.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Redux Toolkit (RTK Query)
- React Router
- Tailwind CSS
- Vite

**Backend:**
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Joi Validation

## 📝 License

MIT
