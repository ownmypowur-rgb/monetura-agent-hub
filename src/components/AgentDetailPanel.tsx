"use client";
import { useState, useEffect, useRef } from "react";

const ORCHESTRATOR_URL = "https://mountain-compliance-molecular-territory.trycloudflare.com";
const ORCHESTRATOR_API_KEY = "7d7f64cdd061fa2ccce94cba04acccca9e8bc4acceffbdf53400aa67c6d55599";

interface Agent {
  id: string;
  name: string;
  role: string;
  status: "active" | "idle" | "error" | "paused";
  description: string;
  lastRun?: string;
  triggerCount?: number;
}

interface AgentDetailPanelProps {
  agent: Agent | null;
  onClose: () => void;
}

interface TaskLog {
  timestamp: string;
  message: string;
  level: "info" | "error" | "success";
}

export default function AgentDetailPanel({ agent, onClose }: AgentDetailPanelProps) {
  const [taskInput, setTaskInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const seenLogsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const addLog = (message: string, level: "info" | "error" | "success" = "info") => {
    const key = `${level}:${message}`;
    if (seenLogsRef.current.has(key)) return;
    seenLogsRef.current.add(key);
    setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message, level }]);
  };

  const runTask = async () => {
    if (!agent || !taskInput.trim()) return;
    setIsRunning(true);
    setError(null);
    setLogs([]);
    seenLogsRef.current = new Set();
    setTaskStatus("starting");
    addLog(`Starting task for ${agent.name}...`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${ORCHESTRATOR_URL}/run-task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ORCHESTRATOR_API_KEY,
        },
        signal: controller.signal,
        body: JSON.stringify({
          project: "apex-crm",
          agent: agent.name,
          task: taskInput,
          mode: "github",
        }),
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error || `HTTP ${response.status}`);
      }

      const data = await response.json() as { taskId?: string; task_id?: string; status?: string };
      const id = data.taskId ?? data.task_id ?? null;
      if (!id) throw new Error("No task ID returned from orchestrator");

      setTaskId(id);
      addLog(`Task queued — ID: ${id}`, "success");
      addLog("Polling for live updates...");

      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`${ORCHESTRATOR_URL}/status/${id}`, {
            headers: { "x-api-key": ORCHESTRATOR_API_KEY },
          });
          if (!statusRes.ok) return;
          const statusData = await statusRes.json() as {
            status: string;
            logs?: string[];
            result?: string;
            error?: string;
          };
          setTaskStatus(statusData.status);

          if (statusData.logs?.length) {
            statusData.logs.forEach(logLine => {
              const clean = logLine.replace(/^\[\d{2}:\d{2}:\d{2}\]\s*/, "");
              const level = clean.startsWith("✗") ? "error" : clean.startsWith("✓") ? "success" : "info";
              addLog(clean, level);
            });
          }

          if (statusData.status === "completed" || statusData.status === "failed") {
            if (pollRef.current) clearInterval(pollRef.current);
            setIsRunning(false);
            if (statusData.status === "completed") {
              addLog("✓ Task completed!", "success");
            } else {
              addLog(`✗ Failed: ${statusData.error ?? "Unknown error"}`, "error");
            }
          }
        } catch { /* ignore transient poll errors */ }
      }, 2000);

    } catch (err: unknown) {
      const msg = err instanceof Error
        ? (err.name === "AbortError" ? "Request timed out (10s)" : err.message)
        : "Failed to run task";
      setError(msg);
      addLog(`Error: ${msg}`, "error");
      setIsRunning(false);
      setTaskStatus("failed");
    }
  };

  const resetTask = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setIsRunning(false);
    setTaskId(null);
    setTaskStatus(null);
    setLogs([]);
    setError(null);
    setTaskInput("");
    seenLogsRef.current = new Set();
  };

  if (!agent) return null;

  const statusColors: Record<string, string> = {
    active: "text-green-400",
    idle: "text-gray-400",
    error: "text-red-400",
    paused: "text-yellow-400",
  };
  const logColors: Record<string, string> = {
    info: "text-gray-300",
    error: "text-red-400",
    success: "text-green-400",
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-72 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold text-sm">{agent.name}</h3>
          <p className="text-gray-400 text-xs">{agent.role}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-xs px-1">✕</button>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-xs">Status</span>
        <span className={`text-xs font-medium ${statusColors[agent.status] ?? "text-gray-400"}`}>
          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
        </span>
      </div>

      <p className="text-gray-400 text-xs mb-2">{agent.description}</p>

      <div className="flex justify-between mb-3 text-xs text-gray-500">
        <span>Last Run: {agent.lastRun ?? "Never"}</span>
        <span>Triggers: {agent.triggerCount ?? 0}</span>
      </div>

      <div className="border-t border-gray-700 pt-3">
        <p className="text-gray-300 text-xs font-medium mb-2">Run Task</p>

        {(taskStatus === "completed" || taskStatus === "failed") ? (
          <button
            onClick={resetTask}
            className="w-full text-xs py-1.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            Run Another Task
          </button>
        ) : (
          <>
            <textarea
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder={`Describe what you want ${agent.name} to do…`}
              className="w-full text-xs bg-gray-800 text-white border border-gray-600 rounded p-2 mb-2 resize-none h-16 focus:outline-none focus:border-blue-500"
              disabled={isRunning}
            />
            {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
            <button
              onClick={runTask}
              disabled={isRunning || !taskInput.trim()}
              className="w-full text-xs py-1.5 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1"
            >
              {isRunning ? (
                <><span className="animate-spin inline-block">⟳</span>{" "}{taskStatus === "starting" ? "Starting…" : "Running…"}</>
              ) : (
                <>▷ Run Task</>
              )}
            </button>
          </>
        )}

        {logs.length > 0 && (
          <div className="mt-2 bg-gray-950 rounded p-2 max-h-40 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className={`text-xs font-mono ${logColors[log.level] ?? "text-gray-300"} mb-0.5 leading-tight`}>
                <span className="text-gray-600">{log.timestamp}</span>{" "}{log.message}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}

        {taskId && (
          <p className="text-gray-600 text-xs mt-1">Task: {taskId.slice(0, 8)}…</p>
        )}
      </div>
    </div>
  );
}
