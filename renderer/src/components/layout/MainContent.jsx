import React from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useUIStore } from '../../store/uiStore';
import TaskList from '../tasks/TaskList';

function MainContent() {
  const tasks = useTaskStore((state) => state.tasks);
  const searchQuery = useTaskStore((state) => state.searchQuery);
  const sidebarView = useUIStore((state) => state.sidebarView);

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '—';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  // Group tasks by source
  const jiraTasks = tasks.filter(t => t.source === 'jira' && !t.parent_id);
  const localTasks = tasks.filter(t => t.source === 'local' && !t.parent_id);

  return (
    <main className="flex-1 overflow-hidden flex flex-col bg-zinc-900">
      {/* Filter Bar */}
      <div className="h-12 border-b border-zinc-700/50 flex items-center px-4 gap-3">
        <input
          type="text"
          placeholder="🔍 Search tasks..."
          className="flex-1 max-w-md input text-sm py-1.5"
        />
        
        <select className="input text-sm py-1.5 bg-zinc-800 border-zinc-700">
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
          <option value="created">Created</option>
          <option value="timeSpent">Time Spent</option>
        </select>

        <button className="input text-sm py-1.5">Filter ▾</button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4">
        {jiraTasks.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Jira Tasks
            </h2>
            <div className="space-y-2">
              {jiraTasks.map(task => (
                <div
                  key={task.id}
                  className="card hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getPriorityIcon(task.priority)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-indigo-400">{task.jira_key}</span>
                        <span className="font-medium text-white truncate">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
                        <span>⏳ Est: {formatTime(task.jira_estimated_seconds)}</span>
                        <span>⚡ Rem: {formatTime(task.jira_remaining_seconds)}</span>
                      </div>
                    </div>
                    <button className="text-zinc-500 hover:text-yellow-500 transition-colors">
                      {task.is_pinned ? '📌' : '○'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {localTasks.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Personal Tasks
            </h2>
            <div className="space-y-2">
              {localTasks.map(task => (
                <div
                  key={task.id}
                  className="card hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getPriorityIcon(task.priority)}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-white truncate">{task.title}</span>
                      <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
                        <span>Local · {formatTime(task.local_estimated_minutes * 60)}</span>
                      </div>
                    </div>
                    <button className="text-zinc-500 hover:text-yellow-500 transition-colors">
                      {task.is_pinned ? '📌' : '○'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500">No tasks yet</p>
            <button className="mt-4 btn btn-primary">+ Add your first task</button>
          </div>
        )}
      </div>
    </main>
  );
}

export default MainContent;
