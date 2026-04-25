'use client';

import React, { useState } from 'react';
import { TaskData, submitTaskFeedback } from '@/lib/hooks/useTasks';
import { FlaskConical, CheckCircle2, XCircle, Loader2, Send } from 'lucide-react';

interface TestingBannerProps {
  task: TaskData;
  onFeedbackSubmitted: () => void;
}

export default function TestingBanner({ task, onFeedbackSubmitted }: TestingBannerProps) {
  const [showFailForm, setShowFailForm] = useState(false);
  const [failNotes, setFailNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (task.status !== 'complete' && task.status !== 'testing') return null;
  if (task.testStatus === 'passed' || task.testStatus === 'failed') return null;

  const handlePass = async () => {
    setSubmitting(true);
    try {
      await submitTaskFeedback(task.id, true, 'All tests passed');
      setSubmitted(true);
      onFeedbackSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  const handleFail = async () => {
    if (!failNotes.trim()) return;
    setSubmitting(true);
    try {
      await submitTaskFeedback(task.id, false, failNotes);
      setSubmitted(true);
      onFeedbackSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
        <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
        <p className="text-sm text-zinc-300">Feedback submitted!</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-5 h-5 text-amber-400" />
        <h3 className="text-sm font-semibold text-amber-300">Testing Required</h3>
      </div>
      <div className="bg-black/20 rounded-lg p-3">
        <p className="text-xs font-medium text-zinc-400 mb-1">What was built:</p>
        <p className="text-sm text-zinc-200">{task.brief.split('\n')[0]}</p>
      </div>
      <div className="bg-black/20 rounded-lg p-3">
        <p className="text-xs font-medium text-zinc-400 mb-2">Checklist:</p>
        <ul className="space-y-1 text-sm text-zinc-300">
          <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-zinc-600 flex items-center justify-center text-xs">☐</span>Visual inspection — UI looks correct</li>
          <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-zinc-600 flex items-center justify-center text-xs">☐</span>Core functionality works as described</li>
          <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-zinc-600 flex items-center justify-center text-xs">☐</span>No console errors or broken links</li>
          {task.deploymentUrl && (
            <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-zinc-600 flex items-center justify-center text-xs">☐</span><a href={task.deploymentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Check live deployment →</a></li>
          )}
        </ul>
      </div>
      {!showFailForm ? (
        <div className="flex gap-2">
          <button onClick={handlePass} disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Passed ✅
          </button>
          <button onClick={() => setShowFailForm(true)} disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            <XCircle className="w-4 h-4" />
            Failed ❌
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea value={failNotes} onChange={(e) => setFailNotes(e.target.value)} placeholder="Describe what went wrong..." rows={3} className="w-full bg-black/30 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none" />
          <div className="flex gap-2">
            <button onClick={() => setShowFailForm(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">Cancel</button>
            <button onClick={handleFail} disabled={submitting || !failNotes.trim()} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Feedback & Create Fix Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
