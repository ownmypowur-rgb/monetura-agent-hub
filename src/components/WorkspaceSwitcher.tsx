"use client";
import { WORKSPACE_NAMES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface WorkspaceSwitcherProps {
  activeWorkspace: number;
  onChange: (id: number) => void;
}

export default function WorkspaceSwitcher({ activeWorkspace, onChange }: WorkspaceSwitcherProps) {
  return (
    <div className="space-y-1">
      {Object.entries(WORKSPACE_NAMES).map(([id, name]) => (
        <button
          key={id}
          onClick={() => onChange(Number(id))}
          className={cn(
            "w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors",
            activeWorkspace === Number(id)
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          )}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
