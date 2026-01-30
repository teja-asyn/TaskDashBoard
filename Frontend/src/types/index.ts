export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  taskCounts: {
    todo: number;
    'in-progress': number;
    done: number;
  };
  totalTasks: number;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  projectId: string | { _id: string; name: string };
  assigneeId?: User | { _id: string; name: string; email: string };
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  projectId: string;
  assigneeId?: string;
  dueDate?: string;
  estimatedHours?: number;
  labels?: string[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  assigneeId?: string | null;
  dueDate?: string | null;
  estimatedHours?: number | null;
  labels?: string[];
}