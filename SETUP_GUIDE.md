# Complete Setup Guide

This guide will help you set up and run the Task Management Dashboard application from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
- **npm** or **yarn** (comes with Node.js)
- **Git** (optional, for cloning the repository)

## Step 1: Clone or Download the Project

If you have the repository URL:
```bash
git clone <repository-url>
cd TaskDashboard
```

Or extract the project files to a folder named `TaskDashboard`.

## Step 2: Set Up MongoDB

### Option A: Local MongoDB

1. Install MongoDB locally from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   - **Windows**: MongoDB should start automatically as a service
   - **Mac/Linux**: `sudo systemctl start mongod` or `brew services start mongodb-community`
3. Verify MongoDB is running:
   ```bash
   mongosh
   ```
4. Your connection string will be: `mongodb://localhost:27017/taskmanager`

### Option B: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier M0)
4. Create a database user (username and password)
5. Whitelist your IP address (or use `0.0.0.0/0` for development)
6. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/taskmanager
   ```

## Step 3: Set Up Backend

1. Navigate to the backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `Backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanager
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/taskmanager

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**Important**: 
- Replace `MONGO_URI` with your actual MongoDB connection string
- Replace `JWT_SECRET` with a strong random string (at least 32 characters)
- You can generate a JWT secret using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

4. Start the backend server:
```bash
npm run dev
```

You should see:
```
Connected to MongoDB
Server running on port 5000
```

The backend API is now running at `http://localhost:5000`

## Step 4: Set Up Frontend

1. Open a **new terminal window** (keep the backend running)

2. Navigate to the frontend directory:
```bash
cd Frontend
```

3. Install dependencies:
```bash
npm install
```

4. Create a `.env` file in the `Frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

5. Start the frontend development server:
```bash
npm run dev
```

You should see:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

The frontend is now running at `http://localhost:5173`

## Step 5: Access the Application

1. Open your browser and go to: `http://localhost:5173`

2. **Register a new account**:
   - Click "Register" or "Sign Up"
   - Fill in your name, email, and password
   - Click "Register"

3. **Or login** if you already have an account

4. **Create your first project**:
   - Click "New Project" button
   - Enter project name and description
   - Click "Create Project"

5. **Create tasks**:
   - Click on a project to open it
   - Click "Add Task" button
   - Fill in task details
   - Drag and drop tasks between columns (Todo, In Progress, Done)

## Step 6: Running Tests

### Backend Tests

1. Navigate to the backend directory:
```bash
cd Backend
```

2. Run tests:
```bash
npm test
```

This will run all unit tests for authentication, projects, and tasks.

## Troubleshooting

### Backend Issues

**MongoDB Connection Error**:
- Verify MongoDB is running: `mongosh` or check MongoDB service
- Check your `MONGO_URI` in `.env` file
- For MongoDB Atlas: Ensure your IP is whitelisted

**Port Already in Use**:
- Change `PORT` in `.env` to a different port (e.g., 5001)
- Or stop the process using port 5000

**JWT Secret Error**:
- Ensure `JWT_SECRET` is set in `.env`
- Make sure it's at least 32 characters long

### Frontend Issues

**API Connection Error**:
- Verify backend is running on port 5000
- Check `VITE_API_URL` in `.env` matches backend URL
- Check browser console for CORS errors

**Build Errors**:
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`

### Common Issues

**"Cannot find module" errors**:
- Run `npm install` in both Backend and Frontend directories
- Ensure you're in the correct directory

**Environment variables not loading**:
- Ensure `.env` files are in the root of Backend and Frontend directories
- Restart the development servers after changing `.env` files

## Production Build

### Backend

```bash
cd Backend
npm run build
npm start
```

### Frontend

```bash
cd Frontend
npm run build
```

The production build will be in the `dist` folder.

## Deployment

### Backend (Railway/Render)

1. Connect your GitHub repository
2. Set environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `CORS_ORIGIN` (your frontend URL)
3. Build command: `npm run build`
4. Start command: `npm start`

### Frontend (Vercel/Netlify)

1. Connect your GitHub repository
2. Set environment variable:
   - `VITE_API_URL` (your deployed backend URL)
3. Build command: `npm run build`
4. Output directory: `dist`

## Next Steps

- Explore the Kanban board and drag tasks between columns
- Create multiple projects
- Add task descriptions with rich text formatting
- Set task priorities and due dates
- Filter and search tasks

## Support

If you encounter any issues:
1. Check the console/terminal for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check that both backend and frontend servers are running

## Verification Checklist

- [ ] MongoDB is installed and running
- [ ] Backend `.env` file is configured
- [ ] Backend server starts without errors
- [ ] Frontend `.env` file is configured
- [ ] Frontend server starts without errors
- [ ] Can register a new user
- [ ] Can login
- [ ] Can create a project
- [ ] Can create a task
- [ ] Can drag and drop tasks

Once all items are checked, you're ready to use the application! 🎉

