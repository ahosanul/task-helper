import React from 'react';
import { useUIStore } from '../../store/uiStore';

function TaskDetailPanel() {
  const { setDetailPanelOpen } = useUIStore();

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-zinc-800 border-l border-zinc-700 shadow-xl z-50">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-zinc-700">
          <h2 className="font-semibold text-white">Task Details</h2>
          <button
            onClick={() => setDetailPanelOpen(false)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="card">
            <h3 className="text-lg font-medium text-white mb-2">Task Title</h3>
            <p className="text-sm text-zinc-400">Select a task to view details</p>
          </div>

          {/* Time Tracking Section Placeholder */}
          <div className="card">
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">⏱ Time Tracking</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Original Estimate</span>
                <span className="text-zinc-300">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Logged in Jira</span>
                <span className="text-zinc-300">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">FlowDesk Sessions</span>
                <span className="text-zinc-300">0m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailPanel;
