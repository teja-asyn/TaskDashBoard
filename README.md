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
