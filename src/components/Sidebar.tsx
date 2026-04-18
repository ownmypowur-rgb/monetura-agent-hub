"use client";
import { LayoutDashboard, Bot, Settings, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

interface SidebarProps {
  activeWorkspace: number;
  onWorkspaceChange: (id: number) => void;
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/hub" },
  { label: "Agents", icon: Bot, href: "/hub/agents" },
  { label: "Activity", icon: Activity, href: "/hub/activity" },
  { label: "Settings", icon: Settings, href: "/hub/settings" },
];

export default function Sidebar({ activeWorkspace, onWorkspaceChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-40">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-lg font-bold text-white">Agent Hub</h1>
        <p className="text-xs text-gray-400 mt-0.5">Monetura Media</p>
      </div>
      <div className="p-3 border-b border-gray-800">
        <WorkspaceSwitcher activeWorkspace={activeWorkspace} onChange={onWorkspaceChange} />
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            <item.icon size={16} />
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
