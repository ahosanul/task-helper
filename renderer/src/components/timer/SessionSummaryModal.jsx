import React, { useState } from 'react';
import { useTimerStore } from '../../store/timerStore';

function SessionSummaryModal() {
  const { pendingSession, saveSession, discardSession } = useTimerStore();
  const [loggedMinutes, setLoggedMinutes] = useState(0);
  const [comment, setComment] = useState('');

  if (!pendingSession) return null;

  const autoDetectedMins = Math.floor(pendingSession.autoDetectedSeconds / 60);
  const hours = Math.floor(autoDetectedMins / 60);
  const mins = autoDetectedMins % 60;

  const handleSave = () => {
    if (!comment.trim()) return;
    saveSession(loggedMinutes || autoDetectedMins, comment);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-zinc-700">
        <h2 className="text-xl font-semibold text-white mb-4">✅ Session Complete</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-zinc-400 mb-1">Task</p>
            <p className="text-white font-medium">Selected Task</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-zinc-400">Started</p>
              <p className="text-white">
                {new Date(pendingSession.startedAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            <div>
              <p className="text-zinc-400">Ended</p>
              <p className="text-white">{new Date().toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-zinc-400 mb-2">
              Auto-detected: {Math.floor(pendingSession.autoDetectedSeconds / 3600)}h {Math.floor((pendingSession.autoDetectedSeconds % 3600) / 60)}m
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-300">Log time:</span>
              <input
                type="number"
                value={Math.floor(loggedMinutes / 60) || hours}
                onChange={(e) => setLoggedMinutes(parseInt(e.target.value) * 60 + (mins || 0))}
                className="w-16 input text-sm py-1"
                min="0"
              />
              <span className="text-zinc-400">h</span>
              <input
                type="number"
                value={loggedMinutes % 60 || mins}
                onChange={(e) => setLoggedMinutes((hours || 0) * 60 + parseInt(e.target.value))}
                className="w-16 input text-sm py-1"
                min="0"
                max="59"
              />
              <span className="text-zinc-400">m</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">
              Session Note <span className="text-zinc-500">(required)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you work on?"
              className="w-full input h-24 resize-none"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={discardSession}
              className="btn btn-secondary"
            >
              Discard Session
            </button>
            <button
              onClick={handleSave}
              disabled={!comment.trim()}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💾 Save Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionSummaryModal;
