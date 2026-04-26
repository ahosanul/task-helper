import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { useTaskStore } from '../../store/taskStore';

function Sidebar() {
  const { sidebarView, setSidebarView } = useUIStore();

  return (
    <aside className="w-56 bg-zinc-800/30 border-r border-zinc-700/50 flex flex-col">
      <nav className="p-3 space-y-1">
        <button
          onClick={() => setSidebarView('all')}
          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
            sidebarView === 'all'
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
          }`}
        >
          All Tasks
        </button>
        <button
          onClick={() => setSidebarView('today')}
          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
            sidebarView === 'today'
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setSidebarView('pinned')}
          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
            sidebarView === 'pinned'
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
          }`}
        >
          📌 Pinned
        </button>
        <button
          onClick={() => setSidebarView('overdue')}
          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
            sidebarView === 'overdue'
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
          }`}
        >
          ⚠ Overdue
        </button>
      </nav>

      <div className="mt-6 px-3">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          Tags
        </h3>
        <div className="space-y-1">
          {/* Tags will be populated dynamically */}
          <button className="w-full text-left px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors">
            # work
          </button>
          <button className="w-full text-left px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors">
            # design
          </button>
          <button className="w-full text-left px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors">
            # review
          </button>
        </div>
        <button className="mt-2 w-full text-left px-3 py-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          + Add Tag
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
