# Task Management Dashboard - Frontend

React-based frontend application for the Task Management Dashboard built with TypeScript, Redux Toolkit, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173`

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── dashboard/   # Dashboard components
│   │   ├── kanban/      # Kanban board components
│   │   ├── layout/      # Layout components
│   │   ├── modals/      # Modal components
│   │   └── templates/   # Template components
│   ├── pages/           # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── ProjectView.tsx
│   ├── store/           # Redux store
│   │   ├── api/         # RTK Query API slices
│   │   ├── slices/      # Redux slices
│   │   └── store.ts     # Store configuration
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── hooks/           # Custom React hooks
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
└── package.json
```

## 🎨 Features

### Pages

1. **Login/Register** - User authentication
   - Form validation
   - Error handling
   - JWT token management

2. **Dashboard** - Project overview
   - List all projects
   - Task counts by status
   - Quick actions
   - Activity feed

3. **Project View** - Kanban board
   - Drag-and-drop task management
   - Task filtering (status, priority, assignee)
   - Search functionality
   - Board and list view modes

4. **Task Modal** - Create/Edit tasks
   - Rich text editor for descriptions
   - Priority and status selection
   - Due date picker
   - Assignee selection
   - File attachments

### State Management

- **Redux Toolkit**: Centralized state management
- **RTK Query**: API data fetching and caching
- **Local State**: Component-specific state with React hooks

### UI/UX Features

- **Responsive Design**: Mobile and desktop support
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Form Validation**: Real-time validation with Yup
- **Drag & Drop**: Intuitive task management
- **Rich Text Editor**: Formatting support for descriptions

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |

### Build Configuration

- **Vite**: Fast build tool and dev server
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint**: Code linting

## 📦 Key Dependencies

- **React 18**: UI library
- **Redux Toolkit**: State management
- **React Router**: Navigation
- **React Hook Form**: Form handling
- **Yup**: Schema validation
- **React Beautiful DnD**: Drag and drop
- **React Quill**: Rich text editor
- **Tailwind CSS**: Styling
- **React Hot Toast**: Notifications

## 🎯 Usage

### Authentication Flow

1. User registers or logs in
2. JWT token is stored in localStorage
3. Token is included in API requests via Authorization header
4. Protected routes check for valid token

### Creating a Task

1. Navigate to a project
2. Click "Add Task" button
3. Fill in task details in the modal
4. Submit to create the task

### Managing Tasks

- **Drag & Drop**: Move tasks between columns (Todo, In Progress, Done)
- **Edit**: Click on a task card to edit
- **Delete**: Use the delete button in task menu
- **Filter**: Use filters to find specific tasks

## 🧪 Testing

Run linting:
```bash
npm run lint
```

## 🚀 Deployment

### Vercel/Netlify

1. Set `VITE_API_URL` environment variable
2. Build command: `npm run build`
3. Output directory: `dist`

### Environment Variables for Production

Set `VITE_API_URL` to your deployed backend URL:
```
VITE_API_URL=https://your-backend-url.com/api
```

## 🐛 Troubleshooting

### API Connection Issues

- Verify `VITE_API_URL` is correct
- Check CORS configuration on backend
- Ensure backend server is running

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

## 📝 Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for formatting (if configured)
- Component-based architecture
- Custom hooks for reusable logic
