import { create } from 'zustand';

export const useTimerStore = create((set, get) => ({
  // State
  activeTaskId: null,
  startedAt: null,
  elapsedSeconds: 0,
  pausedAt: null,
  totalPausedSeconds: 0,
  status: 'idle', // 'idle' | 'running' | 'paused'
  showSessionModal: false,
  pendingSession: null,

  // Actions
  startTimer: (taskId) => {
    const { activeTaskId, stopTimer } = get();
    
    if (activeTaskId && activeTaskId !== taskId) {
      // Prompt to stop current task
      if (!confirm('Stop current task and start a new one?')) {
        return;
      }
      stopTimer();
    }

    set({
      activeTaskId: taskId,
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0,
      pausedAt: null,
      totalPausedSeconds: 0,
      status: 'running',
    });

    // Start ticking
    get()._startTicking();
  },

  pauseTimer: () => {
    const { pausedAt, elapsedSeconds } = get();
    if (pausedAt) return;

    set({
      pausedAt: new Date().toISOString(),
      status: 'paused',
    });
    get()._stopTicking();
  },

  resumeTimer: () => {
    const { pausedAt, totalPausedSeconds } = get();
    if (!pausedAt) return;

    const pauseDuration = Math.floor((Date.now() - new Date(pausedAt).getTime()) / 1000);
    set({
      pausedAt: null,
      totalPausedSeconds: totalPausedSeconds + pauseDuration,
      status: 'running',
    });
    get()._startTicking();
  },

  stopTimer: () => {
    const { activeTaskId, startedAt, elapsedSeconds, totalPausedSeconds } = get();
    if (!activeTaskId) return;

    get()._stopTicking();

    const actualElapsed = elapsedSeconds - totalPausedSeconds;
    set({
      showSessionModal: true,
      pendingSession: {
        taskId: activeTaskId,
        startedAt,
        autoDetectedSeconds: Math.max(0, actualElapsed),
      },
      status: 'idle',
    });
  },

  saveSession: async (loggedMinutes, comment) => {
    const { pendingSession, activeTaskId } = get();
    if (!pendingSession) return;

    const entryData = {
      id: crypto.randomUUID(),
      taskId: pendingSession.taskId,
      startedAt: pendingSession.startedAt,
      endedAt: new Date().toISOString(),
      autoDetectedSeconds: pendingSession.autoDetectedSeconds,
      loggedMinutes,
      comment,
    };

    await window.electronAPI.timeEntries.create(entryData);

    set({
      activeTaskId: null,
      startedAt: null,
      elapsedSeconds: 0,
      pausedAt: null,
      totalPausedSeconds: 0,
      status: 'idle',
      showSessionModal: false,
      pendingSession: null,
    });
  },

  discardSession: () => {
    set({
      activeTaskId: null,
      startedAt: null,
      elapsedSeconds: 0,
      pausedAt: null,
      totalPausedSeconds: 0,
      status: 'idle',
      showSessionModal: false,
      pendingSession: null,
    });
  },

  tick: () => {
    set((state) => ({
      elapsedSeconds: state.elapsedSeconds + 1,
    }));
  },

  _startTicking: () => {
    const { tick } = get();
    if (get()._tickInterval) clearInterval(get()._tickInterval);
    get()._tickInterval = setInterval(tick, 1000);
  },

  _stopTicking: () => {
    if (get()._tickInterval) {
      clearInterval(get()._tickInterval);
      get()._tickInterval = null;
    }
  },

  formatTime: (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },
}));
