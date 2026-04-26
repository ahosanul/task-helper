import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useTimerStore } from '../../store/timerStore';

function Header() {
  const { syncStatus, lastSyncedAt, setSyncStatus, setLastSyncedAt } = useUIStore();
  const { activeTaskId, elapsedSeconds, formatTime } = useTimerStore();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus('syncing');
    
    try {
      const result = await window.electronAPI.jira.sync();
      if (result.success) {
        setSyncStatus('idle');
        setLastSyncedAt(new Date().toISOString());
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      setSyncStatus('error');
    } finally {
      setSyncing(false);
    }
  };

  const formatLastSync = () => {
    if (!lastSyncedAt) return 'Never synced';
    const diff = Date.now() - new Date(lastSyncedAt).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 min ago';
    return `${minutes} mins ago`;
  };

  return (
    <header className="h-14 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-white">FlowDesk</h1>
        
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-md transition-colors disabled:opacity-50"
        >
          <span className={syncing ? 'animate-spin' : ''}>↻</span>
          {syncing ? 'Syncing...' : 'Sync'}
        </button>

        <button className="btn btn-primary text-sm">+ Task</button>

        <span className="text-xs text-zinc-500 ml-2">{formatLastSync()}</span>
        {syncStatus === 'error' && (
          <span className="text-xs text-red-400">· Sync failed</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {activeTaskId ? (
          <div className="px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-md text-indigo-300 text-sm font-mono">
            ▶ Task · {formatTime(elapsedSeconds)}
          </div>
        ) : (
          <button className="text-sm text-zinc-400 hover:text-white transition-colors">
            ▶ Start Tracking
          </button>
        )}

        <button className="text-zinc-400 hover:text-white transition-colors">⚙</button>
      </div>
    </header>
  );
}

export default Header;
