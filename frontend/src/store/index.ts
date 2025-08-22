import { configureStore } from '@reduxjs/toolkit';
import authReducer, { AuthState } from './slices/authSlice';
import tasksReducer, { TasksState } from './slices/tasksSlice';
import uiReducer, { UIState } from './slices/uiSlice';

export interface RootState {
  auth: AuthState;
  tasks: TasksState;
  ui: UIState;
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
});

export type AppDispatch = typeof store.dispatch;
