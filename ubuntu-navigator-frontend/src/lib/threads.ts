import type { UIMessage } from "ai";

const STORAGE_KEY = "sassa-navigator.threads.v1";

export type StoredThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

export function loadThreads(): StoredThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredThread[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveThreads(threads: StoredThread[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch {
    // ignore quota errors
  }
}

export function newThreadId() {
  return `t_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function titleFromMessages(messages: UIMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New chat";
  const text = firstUser.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { text: string }).text)
    .join(" ")
    .trim();
  if (!text) return "New chat";
  return text.length > 48 ? text.slice(0, 45) + "…" : text;
}
