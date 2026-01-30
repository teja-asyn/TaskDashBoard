# Deployment Guide

This guide will help you deploy the Task Management Dashboard to:
- **Backend**: Render.com
- **Frontend**: Vercel

## 📁 Repository Structure

```
TaskDashboard/
├── Backend/          # Node.js/Express API
├── Frontend/         # React/Vite Frontend
└── README.md
```

This is a **monorepo** structure - both frontend and backend in one repository, deployed separately.

---

## 🚀 Step 1: Prepare Your Repository

### 1.1 Create a Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Task Management Dashboard"

# Create a new repository on GitHub/GitLab/Bitbucket
# Then push:
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

### 1.2 Create `.gitignore` (if not exists)

Create a root `.gitignore`:

```gitignore
# Dependencies
node_modules/
package-lock.json

# Environment variables
.env
.env.local
.env.production

# Build outputs
dist/
build/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

---

## 🔧 Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up/login with GitHub

### 2.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select the repository containing your code

### 2.3 Configure Backend Service

**Basic Settings:**
- **Name**: `task-manager-backend` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `Backend` ⚠️ **IMPORTANT**
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Environment Variables:**
Add these in Render dashboard:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-frontend-app.vercel.app
```

**Important Notes:**
- Get `MONGO_URI` from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
- Generate a strong `JWT_SECRET` (use: `openssl rand -base64 32`)
- Set `CORS_ORIGIN` to your Vercel frontend URL (you'll update this after deploying frontend)

### 2.4 Deploy
1. Click **"Create Web Service"**
2. Render will build and deploy your backend
3. Note the service URL (e.g., `https://task-manager-backend.onrender.com`)

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub

### 3.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Select the repository

### 3.3 Configure Frontend Project

**Framework Preset:**
- **Framework Preset**: `Vite` (auto-detected)

**Root Directory:**
- **Root Directory**: `Frontend` ⚠️ **IMPORTANT**

**Build Settings:**
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

**Environment Variables:**
Add these in Vercel dashboard:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

**Important:**
- Replace `your-backend-url.onrender.com` with your actual Render backend URL

### 3.4 Deploy
1. Click **"Deploy"**
2. Vercel will build and deploy your frontend
3. Note the deployment URL (e.g., `https://task-manager-frontend.vercel.app`)

---

## 🔄 Step 4: Update CORS Configuration

After both are deployed:

1. **Update Backend CORS in Render:**
   - Go to Render dashboard → Your backend service → Environment
   - Update `CORS_ORIGIN` to your Vercel frontend URL:
     ```
     CORS_ORIGIN=https://your-frontend-app.vercel.app
     ```
   - Click **"Save Changes"** → Render will redeploy

2. **Verify Frontend API URL in Vercel:**
   - Go to Vercel dashboard → Your project → Settings → Environment Variables
   - Verify `VITE_API_URL` points to your Render backend

---

## ✅ Step 5: Verify Deployment

### Test Backend
```bash
# Health check
curl https://your-backend-url.onrender.com/health

# Should return: {"status":"OK","timestamp":"..."}
```

### Test Frontend
1. Visit your Vercel URL
2. Try to register/login
3. Check browser console for any errors

---

## 🔒 Security Checklist

- [x] Environment variables set (not hardcoded)
- [x] CORS configured correctly
- [x] JWT_SECRET is strong and secure
- [x] MongoDB connection string is secure
- [x] No sensitive data in code
- [x] Rate limiting enabled
- [x] Helmet.js security headers enabled

---

## 🐛 Troubleshooting

### Backend Issues

**Build Fails:**
- Check `Root Directory` is set to `Backend`
- Verify `package.json` has correct build script
- Check Render build logs

**Database Connection Fails:**
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Render)
- Verify network access in MongoDB Atlas

**CORS Errors:**
- Verify `CORS_ORIGIN` includes your Vercel URL
- Check for trailing slashes
- Ensure protocol matches (https)

### Frontend Issues

**API Calls Fail:**
- Verify `VITE_API_URL` is correct
- Check browser console for errors
- Verify backend is running (check Render logs)
- Check CORS configuration

**Build Fails:**
- Check `Root Directory` is set to `Frontend`
- Verify all dependencies are in `package.json`
- Check Vercel build logs

---

## 📝 Environment Variables Summary

### Backend (Render)
```env
NODE_ENV=production
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-secret-key>
JWT_EXPIRE=7d
CORS_ORIGIN=<your-vercel-frontend-url>
```

### Frontend (Vercel)
```env
VITE_API_URL=<your-render-backend-url>/api
```

---

## 🎯 Quick Reference

| Service | Platform | URL Pattern |
|---------|----------|-------------|
| Backend | Render | `https://your-app.onrender.com` |
| Frontend | Vercel | `https://your-app.vercel.app` |

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)

---

## ✨ Next Steps

1. Set up custom domains (optional)
2. Enable automatic deployments on git push
3. Set up monitoring and logging
4. Configure CI/CD pipelines
5. Add staging environment

---

**Your deployment approach is correct!** ✅

The monorepo structure with separate deployments is a common and recommended pattern for full-stack applications.

