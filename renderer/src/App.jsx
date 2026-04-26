import React, { useEffect } from 'react';
import { useTaskStore } from './store/taskStore';
import { useUIStore } from './store/uiStore';
import { useTimerStore } from './store/timerStore';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import TaskDetailPanel from './components/tasks/TaskDetailPanel';
import SessionSummaryModal from './components/timer/SessionSummaryModal';

function App() {
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const detailPanelOpen = useUIStore((state) => state.detailPanelOpen);
  const showSessionModal = useTimerStore((state) => state.showSessionModal);

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainContent />
      </div>
      {detailPanelOpen && <TaskDetailPanel />}
      {showSessionModal && <SessionSummaryModal />}
    </div>
  );
}

export default App;
