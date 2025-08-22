import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskFilters, CreateTaskRequest, UpdateTaskRequest } from '@/types';
import { apiClient } from '@/lib/api';

// Utility function to deduplicate tasks by ID
const deduplicateTasks = (tasks: Task[]): Task[] => {
  const seen = new Set<string>();
  return tasks.filter(task => {
    if (seen.has(task.id)) {
      return false;
    }
    seen.add(task.id);
    return true;
  });
};

export interface TasksState {
  items: Task[];
  filters: TaskFilters;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  currentTask: Task | null;
}

const initialState: TasksState = {
  items: [],
  filters: {
    page: 1,
    pageSize: 20,
  },
  totalPages: 1,
  isLoading: false,
  error: null,
  currentTask: null,
};

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (filters: TaskFilters, { rejectWithValue }) => {
    try {
      const response = await apiClient.getTasks(filters);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: CreateTaskRequest, { rejectWithValue }) => {
    try {
      const response = await apiClient.createTask(taskData);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }: { id: string; taskData: UpdateTaskRequest }, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateTask(id, taskData);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.deleteTask(id);
      return id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleTask = createAsyncThunk(
  'tasks/toggleTask',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.toggleTask(id);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle task';
      return rejectWithValue(errorMessage);
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      const newFilters = { ...state.filters, ...action.payload };
      // Reset to page 1 only if filters actually changed (not just page)
      if (JSON.stringify({ ...state.filters, page: 1 }) !== JSON.stringify(newFilters)) {
        newFilters.page = 1;
        state.items = [];
      }
      state.filters = newFilters;
    },
    clearFilters: (state) => {
      state.filters = { page: 1, pageSize: 20 };
      state.items = [];
    },
    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
      // Clear current items when changing pages to prevent showing old data
      state.items = [];
    },
    resetTasks: (state) => {
      state.items = [];
      state.filters.page = 1;
    },
    cleanupDuplicates: (state) => {
      state.items = deduplicateTasks(state.items);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = deduplicateTasks(action.payload.items);
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create task
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        // Check if task already exists before adding
        const exists = state.items.some(task => task.id === action.payload.id);
        if (!exists) {
          state.items.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.currentTask = null;
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter(task => task.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Toggle task
      .addCase(toggleTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(toggleTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setFilters, 
  clearFilters, 
  setCurrentTask, 
  clearError, 
  setPage,
  resetTasks,
  cleanupDuplicates
} = tasksSlice.actions;

export default tasksSlice.reducer;
