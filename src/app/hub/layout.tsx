"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { WorkspaceContext } from "@/lib/workspace-context";
export default function HubLayout({ children }: { children: React.ReactNode }) {
  const [activeWorkspace, setActiveWorkspace] = useState(2);
  return (<WorkspaceContext.Provider value={activeWorkspace}><div className="flex h-screen bg-gray-950"><Sidebar activeWorkspace={activeWorkspace} onWorkspaceChange={setActiveWorkspace} /><main className="ml-64 flex-1 overflow-auto">{children}</main></div></WorkspaceContext.Provider>);
}
