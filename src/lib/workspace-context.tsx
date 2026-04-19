"use client";
import { createContext, useContext } from "react";

export const WorkspaceContext = createContext<number>(2);

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
