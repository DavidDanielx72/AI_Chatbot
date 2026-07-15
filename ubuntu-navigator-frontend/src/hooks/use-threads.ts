import { useCallback, useEffect, useState } from "react";
import type { UIMessage } from "ai";
import {
  loadThreads,
  saveThreads,
  newThreadId,
  titleFromMessages,
  type StoredThread,
} from "@/lib/threads";

export function useThreads() {
  const [threads, setThreads] = useState<StoredThread[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setThreads(loadThreads());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveThreads(threads);
  }, [threads, hydrated]);

  const createThread = useCallback((id?: string): StoredThread => {
    const thread: StoredThread = {
      id: id ?? newThreadId(),
      title: "New chat",
      updatedAt: Date.now(),
      messages: [],
    };
    setThreads((prev) => {
      if (prev.some((t) => t.id === thread.id)) return prev;
      return [thread, ...prev];
    });
    return thread;
  }, []);

  const updateThreadMessages = useCallback((id: string, messages: UIMessage[]) => {
    setThreads((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      const title = titleFromMessages(messages);
      const updated: StoredThread = {
        id,
        title,
        updatedAt: Date.now(),
        messages,
      };
      if (idx === -1) return [updated, ...prev];
      const next = prev.slice();
      next[idx] = { ...next[idx], ...updated };
      // move to top
      const [item] = next.splice(idx, 1);
      return [item, ...next];
    });
  }, []);

  const deleteThread = useCallback((id: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const renameThread = useCallback((id: string, title: string) => {
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)));
  }, []);

  return { threads, hydrated, createThread, updateThreadMessages, deleteThread, renameThread };
}
