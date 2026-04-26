import { create } from 'zustand';

export const useTaskStore = create((set, get) => ({
  // State
  tasks: [],
  filters: {
    priority: [],
    tags: [],
    source: 'all',
    status: 'active',
    dueDateRange: null,
  },
  sort: { field: 'dueDate', direction: 'asc' },
  searchQuery: '',
  selectedTaskId: null,
  isLoading: false,

  // Actions
  fetchTasks: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const mergedFilters = { ...get().filters, ...filters };
      const tasks = await window.electronAPI.tasks.getAll(mergedFilters);
      set({ tasks, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      set({ isLoading: false });
    }
  },

  createTask: async (taskData) => {
    const newTask = await window.electronAPI.tasks.create(taskData);
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
    return newTask;
  },

  updateTask: async (id, fields) => {
    const updatedTask = await window.electronAPI.tasks.update(id, fields);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
    }));
    return updatedTask;
  },

  deleteTask: async (id) => {
    await window.electronAPI.tasks.delete(id);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
  },

  toggleComplete: async (id) => {
    const updatedTask = await window.electronAPI.tasks.toggleComplete(id);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
    }));
    return updatedTask;
  },

  togglePin: async (id) => {
    const updatedTask = await window.electronAPI.tasks.togglePin(id);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
    }));
    return updatedTask;
  },

  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setSort: (sort) => set({ sort }),
  setSearch: (searchQuery) => set({ searchQuery }),
  selectTask: (selectedTaskId) => set({ selectedTaskId }),
}));
