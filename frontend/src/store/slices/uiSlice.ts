import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  showTaskForm: boolean;
  showFilters: boolean;
  showMobileMenu: boolean;
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

const initialState: UIState = {
  showTaskForm: false,
  showFilters: false,
  showMobileMenu: false,
  theme: typeof window !== 'undefined' ? (localStorage.getItem('theme') as 'light' | 'dark') || 'light' : 'light',
  sidebarCollapsed: false,
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTaskForm: (state, action: PayloadAction<boolean | undefined>) => {
      state.showTaskForm = action.payload !== undefined ? action.payload : !state.showTaskForm;
    },
    toggleFilters: (state, action: PayloadAction<boolean | undefined>) => {
      state.showFilters = action.payload !== undefined ? action.payload : !state.showFilters;
    },
    toggleMobileMenu: (state, action: PayloadAction<boolean | undefined>) => {
      state.showMobileMenu = action.payload !== undefined ? action.payload : !state.showMobileMenu;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
        document.documentElement.classList.toggle('dark', action.payload === 'dark');
      }
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      }
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = Date.now().toString();
      const notification: Notification = {
        ...action.payload,
        id,
        duration: action.payload.duration || 5000,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    closeAllModals: (state) => {
      state.showTaskForm = false;
      state.showFilters = false;
      state.showMobileMenu = false;
    },
  },
});

export const {
  toggleTaskForm,
  toggleFilters,
  toggleMobileMenu,
  setTheme,
  toggleTheme,
  toggleSidebar,
  setSidebarCollapsed,
  addNotification,
  removeNotification,
  clearNotifications,
  closeAllModals,
} = uiSlice.actions;

export default uiSlice.reducer;
