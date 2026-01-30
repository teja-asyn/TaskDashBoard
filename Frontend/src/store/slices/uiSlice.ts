import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  isOpen: boolean;
  type: 'task' | 'project' | 'confirm' | 'taskDetails' | 'projectDetails' | null;
  data: Record<string, unknown> | null;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface UIState {
  sidebarOpen: boolean;
  modal: ModalState;
  notifications: Notification[];
  loading: boolean;
  theme: 'light' | 'dark';
}

const initialState: UIState = {
  sidebarOpen: false,
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  notifications: [],
  loading: false,
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    openModal: (state, action: PayloadAction<{ type: string; data?: Record<string, unknown> | null }>) => {
      state.modal.isOpen = true;
      state.modal.type = action.payload.type as 'task' | 'project' | 'confirm' | 'taskDetails' | 'projectDetails';
      state.modal.data = action.payload.data || null;
    },
    closeModal: (state) => {
      state.modal.isOpen = false;
      state.modal.type = null;
      state.modal.data = null;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = Date.now().toString();
      state.notifications.push({ id, ...action.payload });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark');
    },
  },
});

export const {
  toggleSidebar,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  setLoading,
  toggleTheme,
} = uiSlice.actions;

export default uiSlice.reducer;