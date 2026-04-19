"use client";
import { useState, useEffect, useRef } from "react";
import { X, Play, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import type { Agent } from "@/types/agent";
import { cn } from "@/lib/utils";

const ORCHESTRATOR_URL = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL ?? "http://146.190.254.94:8080";
const ORCHESTRATOR_API_KEY = process.env.NEXT_PUBLIC_ORCHESTRATOR_API_KEY ?? "";

const statusColors: Record<string, string> = {
  active: "text-green-400",
  paused: "text-yellow-400",
  error: "text-red-400",
  idle: "text-gray-400",
};

type TaskStatus = "idle" | "running" | "completed" | "failed";

interface TaskLog {
  timestamp: string;
  message: string;
  level?: string;
}

interface AgentDetailPanelProps {
  agent: Agent;
  onClose: () => void;
}

export default function AgentDetailPanel({ agent, onClose }: AgentDetailPanelProps) {
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("idle");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (showLogs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, showLogs]);

  // Cleanup polling on unmount or agent change
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [agent.id]);

  const pollTaskStatus = (id: string) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${ORCHESTRATOR_URL}/status/${id}`, {
          headers: { "x-api-key": ORCHESTRATOR_API_KEY },
        });
        if (!res.ok) return;
        const data = await res.json();

        // Update logs
        if (data.logs && Array.isArray(data.logs)) {
          setLogs(data.logs);
        } else if (data.result) {
          setLogs((prev) => {
            const last = prev[prev.length - 1];
            const msg = typeof data.result === "string" ? data.result : JSON.stringify(data.result);
            if (!last || last.message !== msg) {
              return [...prev, { timestamp: new Date().toISOString(), message: msg }];
            }
            return prev;
          });
        }

        if (data.status === "completed") {
          setTaskStatus("completed");
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (data.status === "failed" || data.status === "error") {
          setTaskStatus("failed");
          setErrorMsg(data.error ?? "Task failed");
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // Network error - keep polling
      }
    }, 2000);
  };

  const handleRunTask = async () => {
    if (!taskInput.trim()) return;
    setTaskStatus("running");
    setLogs([]);
    setErrorMsg("");
    setShowLogs(true);

    try {
      const res = await fetch(`${ORCHESTRATOR_URL}/run-task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ORCHESTRATOR_API_KEY,
        },
        body: JSON.stringify({
          project: "monetura-agent-hub",
          task: `[${agent.name}] ${taskInput.trim()}`,
          mode: "github",
          agent: agent.name,
          agentFamily: agent.family,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      setTaskId(data.taskId);
      setLogs([{ timestamp: new Date().toISOString(), message: `Task started: ${data.taskId}` }]);
      pollTaskStatus(data.taskId);
    } catch (err) {
      setTaskStatus("failed");
      setErrorMsg(err instanceof Error ? err.message : "Failed to start task");
    }
  };

  const handleReset = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setTaskStatus("idle");
    setTaskId(null);
    setLogs([]);
    setErrorMsg("");
    setTaskInput("");
  };

  return (
    <div className="absolute right-4 top-4 bottom-4 w-96 bg-gray-900 border border-gray-700 rounded-xl p-5 z-50 overflow-auto shadow-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-white font-semibold text-base">{agent.name}</h2>
          <p className="text-gray-400 text-xs mt-0.5">{agent.family}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Agent Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Status</span>
          <span className={cn("font-medium capitalize", statusColors[agent.status] ?? "text-gray-400")}>
            {agent.status}
          </span>
        </div>
        {agent.description && (
          <div>
            <p className="text-gray-400 text-xs mb-1">Description</p>
            <p className="text-gray-300 text-sm">{agent.description}</p>
          </div>
        )}
        {agent.lastRun && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Last Run</span>
            <span className="text-gray-300">{agent.lastRun}</span>
          </div>
        )}
        {agent.triggersCount !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Triggers</span>
            <span className="text-gray-300">{agent.triggersCount}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700" />

      {/* Run Task Section */}
      <div className="space-y-3">
        <p className="text-gray-300 text-sm font-medium">Run Task</p>

        {taskStatus === "idle" && (
          <>
            <textarea
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500 transition-colors"
              rows={3}
              placeholder={`Describe what you want ${agent.name} to do...`}
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleRunTask();
              }}
            />
            <button
              onClick={handleRunTask}
              disabled={!taskInput.trim()}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              <Play size={14} />
              Run Task
            </button>
          </>
        )}

        {taskStatus === "running" && (
          <div className="flex items-center gap-2 text-blue-400 text-sm">
            <Loader2 size={16} className="animate-spin" />
            <span>Running task...</span>
            {taskId && <span className="text-gray-500 text-xs ml-auto">#{taskId.slice(-6)}</span>}
          </div>
        )}

        {taskStatus === "completed" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle2 size={16} />
              <span>Task completed successfully</span>
            </div>
            <button
              onClick={handleReset}
              className="w-full text-xs text-gray-400 hover:text-white py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors"
            >
              Run another task
            </button>
          </div>
        )}

        {taskStatus === "failed" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              <span>Task failed</span>
            </div>
            {errorMsg && <p className="text-red-300 text-xs bg-red-950/30 rounded p-2">{errorMsg}</p>}
            <button
              onClick={handleReset}
              className="w-full text-xs text-gray-400 hover:text-white py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Live Logs */}
      {logs.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowLogs((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors w-full"
          >
            {showLogs ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            <span>Live logs ({logs.length})</span>
          </button>

          {showLogs && (
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-3 max-h-48 overflow-y-auto font-mono text-xs space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-gray-600 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={cn(
                    "break-all",
                    log.level === "error" ? "text-red-400" :
                    log.level === "warn" ? "text-yellow-400" :
                    "text-gray-300"
                  )}>
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
