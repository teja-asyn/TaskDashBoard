# Task Management Dashboard - Backend API

RESTful API for the Task Management Dashboard built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## 📡 API Endpoints

### Authentication Endpoints

#### Register User
- **URL**: `POST /api/auth/register`
- **Auth**: None required
- **Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**: `201 Created`
```json
{
  "_id": "64f8a1b2c9d7b8a1f4e5b6c7",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login User
- **URL**: `POST /api/auth/login`
- **Auth**: None required
- **Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**: `200 OK` (same format as register)

### Project Endpoints (Requires Authentication)

All project endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

#### Get All Projects
- **URL**: `GET /api/projects`
- **Response**: `200 OK`
```json
[
  {
    "_id": "64f8a2c3d9e8c9a2f5b6c7d8",
    "name": "Website Redesign",
    "description": "Redesign company website",
    "ownerId": "64f8a1b2c9d7b8a1f4e5b6c7",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "taskCounts": {
      "todo": 3,
      "in-progress": 2,
      "done": 5
    },
    "totalTasks": 10
  }
]
```

#### Create Project
- **URL**: `POST /api/projects`
- **Body**:
```json
{
  "name": "Mobile App Development",
  "description": "Build React Native app"
}
```
- **Response**: `201 Created`

#### Get Single Project
- **URL**: `GET /api/projects/:id`
- **Response**: `200 OK`

#### Get Project Tasks
- **URL**: `GET /api/projects/:id/tasks`
- **Response**: `200 OK`
```json
[
  {
    "_id": "64f8a3d4e9f9da3g6c7d8e9",
    "title": "Design Homepage",
    "description": "Create homepage mockups",
    "status": "todo",
    "priority": "high",
    "projectId": "64f8a2c3d9e8c9a2f5b6c7d8",
    "assigneeId": {
      "_id": "64f8a1b2c9d7b8a1f4e5b6c7",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "dueDate": "2024-01-25T23:59:59.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Update Project
- **URL**: `PUT /api/projects/:id`
- **Body**: Partial project data
- **Response**: `200 OK`

#### Delete Project
- **URL**: `DELETE /api/projects/:id`
- **Response**: `200 OK`
```json
{
  "message": "Project deleted successfully"
}
```

### Task Endpoints (Requires Authentication)

#### Get Tasks by Project
- **URL**: `GET /api/tasks/projects/:projectId/tasks`
- **Query Parameters**:
  - `status`: Filter by status (todo, in-progress, done)
  - `priority`: Filter by priority (low, medium, high)
  - `assignee`: Filter by assignee ID
  - `search`: Search in title and description
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
- **Response**: `200 OK`
```json
{
  "tasks": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

#### Create Task
- **URL**: `POST /api/tasks`
- **Body**:
```json
{
  "title": "Implement Login Page",
  "description": "Create login with validation",
  "status": "todo",
  "priority": "medium",
  "projectId": "64f8a2c3d9e8c9a2f5b6c7d8",
  "assigneeId": "64f8a1b2c9d7b8a1f4e5b6c7",
  "dueDate": "2024-01-25T23:59:59.000Z",
  "estimatedHours": 8,
  "labels": ["frontend", "auth"]
}
```
- **Response**: `201 Created`

#### Get Task Details
- **URL**: `GET /api/tasks/:taskId`
- **Response**: `200 OK`

#### Update Task
- **URL**: `PUT /api/tasks/:taskId`
- **Body**: Partial task data
- **Response**: `200 OK`

#### Update Task Status
- **URL**: `PUT /api/tasks/:taskId/status`
- **Body**:
```json
{
  "status": "in-progress"
}
```
- **Response**: `200 OK`

#### Delete Task
- **URL**: `DELETE /api/tasks/:taskId`
- **Response**: `200 OK`
```json
{
  "message": "Task deleted successfully"
}
```

## 🗄️ Data Models

### User
```typescript
{
  _id: ObjectId,
  name: String,        // required, 3-50 chars
  email: String,       // required, unique, valid email
  password: String,    // required, min 6 chars (hashed)
  createdAt: Date      // auto-generated
}
```

### Project
```typescript
{
  _id: ObjectId,
  name: String,        // required, max 100 chars
  description: String, // optional, max 500 chars
  ownerId: ObjectId,   // required, references User
  createdAt: Date      // auto-generated
}
```

### Task
```typescript
{
  _id: ObjectId,
  title: String,       // required, max 200 chars
  description: String, // optional, max 10000 chars
  status: String,      // enum: 'todo', 'in-progress', 'done'
  priority: String,    // enum: 'low', 'medium', 'high'
  projectId: ObjectId, // required, references Project
  assigneeId: ObjectId, // optional, references User
  dueDate: Date,       // optional
  estimatedHours: Number, // optional
  labels: [String],     // optional
  attachments: [Object], // optional
  createdBy: ObjectId,  // required, references User
  createdAt: Date,      // auto-generated
  updatedAt: Date       // auto-generated
}
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Applied to authentication endpoints
- **Input Validation**: Joi schema validation
- **CORS**: Configurable origin
- **Helmet**: Security headers
- **Error Handling**: No stack traces in production

## 🧪 Testing

Run tests:
```bash
npm test
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRE` | JWT token expiration | `30d` |
| `CORS_ORIGIN` | Allowed CORS origin | `*` |
| `NODE_ENV` | Environment mode | `development` |

## 🏗️ Project Structure

```
Backend/
├── src/
│   ├── controllers/     # Request handlers
│   │   ├── authController.ts
│   │   ├── projectController.ts
│   │   └── taskController.ts
│   ├── models/          # MongoDB models
│   │   ├── User.ts
│   │   ├── Project.ts
│   │   └── Task.ts
│   ├── routes/          # API routes
│   │   ├── authRoutes.ts
│   │   ├── projectRoutes.ts
│   │   └── taskRoutes.ts
│   ├── middleware/     # Custom middleware
│   │   └── auth.ts
│   ├── validation/      # Input validation
│   │   ├── auth.ts
│   │   ├── project.ts
│   │   └── task.ts
│   ├── utils/           # Utilities
│   │   └── jwt.ts
│   └── server.ts        # Entry point
├── test/                # Test files
└── package.json
```

## 🐛 Error Handling

All errors follow a consistent format:
```json
{
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (access denied)
- `404` - Not Found
- `500` - Internal Server Error
