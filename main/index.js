const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { createMainWindow } = require('./windows/mainWindow');
const { closeDatabase } = require('./db/connection');

// IPC Handlers
const taskHandlers = require('./ipc/tasks');
const timeEntryHandlers = require('./ipc/timeEntries');
const credentialsHandlers = require('./ipc/credentials');
const tagHandlers = require('./ipc/tags');
const SyncEngine = require('./services/syncEngine');

// Register IPC handlers
function registerIPCHandlers() {
  // Task handlers
  ipcMain.handle('tasks:getAll', (_, filters) => taskHandlers.getAllTasks(filters));
  ipcMain.handle('tasks:getById', (_, id) => taskHandlers.getTaskById(id));
  ipcMain.handle('tasks:create', (_, taskData) => taskHandlers.createTask(taskData));
  ipcMain.handle('tasks:update', (_, id, fields) => taskHandlers.updateTask(id, fields));
  ipcMain.handle('tasks:delete', (_, id) => taskHandlers.deleteTask(id));
  ipcMain.handle('tasks:toggleComplete', (_, id) => taskHandlers.toggleComplete(id));
  ipcMain.handle('tasks:togglePin', (_, id) => taskHandlers.togglePin(id));

  // Time entry handlers
  ipcMain.handle('timeEntries:getForTask', (_, taskId) => timeEntryHandlers.getTimeEntriesForTask(taskId));
  ipcMain.handle('timeEntries:create', (_, entryData) => timeEntryHandlers.createTimeEntry(entryData));
  ipcMain.handle('timeEntries:update', (_, id, fields) => timeEntryHandlers.updateTimeEntry(id, fields));
  ipcMain.handle('timeEntries:delete', (_, id) => timeEntryHandlers.deleteTimeEntry(id));

  // Credentials handlers
  ipcMain.handle('jira:saveCredentials', (_, creds) => credentialsHandlers.saveCredentials(creds));
  ipcMain.handle('jira:testConnection', () => credentialsHandlers.testConnection());
  ipcMain.handle('jira:getCredentials', () => credentialsHandlers.getCredentials());

  // Tag handlers
  ipcMain.handle('tags:getAll', () => tagHandlers.getAllTags());
  ipcMain.handle('tags:create', (_, tagData) => tagHandlers.createTag(tagData));
  ipcMain.handle('tags:delete', (_, id) => tagHandlers.deleteTag(id));
  ipcMain.handle('tags:addToTask', (_, taskId, tagId) => tagHandlers.addToTask(taskId, tagId));
  ipcMain.handle('tags:removeFromTask', (_, taskId, tagId) => tagHandlers.removeFromTask(taskId, tagId));

  // Jira sync handler
  ipcMain.handle('jira:sync', async () => {
    try {
      const syncEngine = new SyncEngine();
      const result = await syncEngine.sync();
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get last synced at
  ipcMain.handle('jira:getLastSyncedAt', () => {
    const { getDatabase } = require('./db/connection');
    const db = getDatabase();
    const row = db.prepare(`SELECT value FROM settings WHERE key = 'last_synced_at'`).get();
    return row ? row.value : null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  registerIPCHandlers();
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('before-quit', () => {
  closeDatabase();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
