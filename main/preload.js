const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Tasks
  tasks: {
    getAll: (filters) => ipcRenderer.invoke('tasks:getAll', filters),
    getById: (id) => ipcRenderer.invoke('tasks:getById', id),
    create: (taskData) => ipcRenderer.invoke('tasks:create', taskData),
    update: (id, fields) => ipcRenderer.invoke('tasks:update', id, fields),
    delete: (id) => ipcRenderer.invoke('tasks:delete', id),
    toggleComplete: (id) => ipcRenderer.invoke('tasks:toggleComplete', id),
    togglePin: (id) => ipcRenderer.invoke('tasks:togglePin', id)
  },

  // Time Entries
  timeEntries: {
    getForTask: (taskId) => ipcRenderer.invoke('timeEntries:getForTask', taskId),
    create: (entryData) => ipcRenderer.invoke('timeEntries:create', entryData),
    update: (id, fields) => ipcRenderer.invoke('timeEntries:update', id, fields),
    delete: (id) => ipcRenderer.invoke('timeEntries:delete', id)
  },

  // Jira
  jira: {
    saveCredentials: (creds) => ipcRenderer.invoke('jira:saveCredentials', creds),
    testConnection: () => ipcRenderer.invoke('jira:testConnection'),
    sync: () => ipcRenderer.invoke('jira:sync'),
    getLastSyncedAt: () => ipcRenderer.invoke('jira:getLastSyncedAt'),
    getCredentials: () => ipcRenderer.invoke('jira:getCredentials')
  },

  // Tags
  tags: {
    getAll: () => ipcRenderer.invoke('tags:getAll'),
    create: (tagData) => ipcRenderer.invoke('tags:create', tagData),
    delete: (id) => ipcRenderer.invoke('tags:delete', id),
    addToTask: (taskId, tagId) => ipcRenderer.invoke('tags:addToTask', taskId, tagId),
    removeFromTask: (taskId, tagId) => ipcRenderer.invoke('tags:removeFromTask', taskId, tagId)
  }
});
