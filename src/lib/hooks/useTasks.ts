'use client';

import { useState, useEffect, useCallback } from 'react';

export interface TaskData {
  id: string;
  projectId: string;
  projectName: string;
  brief: string;
  status: 'queued' | 'running' | 'complete' | 'failed' | 'testing' | 'passed';
  logs: string | null;
  claudeInstructions: string | null;
  deploymentUrl: string | null;
  testStatus: 'pending' | 'passed' | 'failed';
  testNotes: string | null;
  errorMessage: string | null;
  parentTaskId: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface GlobalStats {
  tasksToday: number;
  passedToday: number;
  failedToday: number;
  passRate: number;
  activeProjects: number;
  recentTasks: TaskData[];
}

export function useTasks(projectId?: string) {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const url = projectId
        ? `/api/tasks/project/${projectId}`
        : '/api/tasks?limit=50';
      const res = await fetch(url);
      const data = await res.json();
      setTasks(data.tasks || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  return { tasks, loading, error, refetch: fetchTasks };
}

export function useTask(taskId: string | null) {
  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      const data = await res.json();
      setTask(data);
    } catch (err) {
      console.error('Failed to fetch task:', err);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  return { task, loading, refetch: fetchTask };
}

export function useGlobalStats() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

export async function submitTaskFeedback(taskId: string, passed: boolean, testNotes?: string) {
  const res = await fetch(`/api/tasks/${taskId}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passed, testNotes }),
  });
  return res.json();
}
