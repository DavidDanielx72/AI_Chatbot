import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import type { UIMessage } from "ai";
import { ThreadSidebar } from "@/components/thread-sidebar";
import { ChatWindow } from "@/components/chat-window";
import { useThreads } from "@/hooks/use-threads";

export const Route = createFileRoute("/$threadId")({
  head: ({ params }) => {
    const url = `https://cape-town-aid-guide.lovable.app/${params.threadId}`;
    const title = "Chat • Ubuntu Navigator — Cape Town Rights & Grants";
    const description =
      "Chat with a free AI helper for SASSA grants, Home Affairs IDs, SARS, and labour rights in Cape Town.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = useParams({ from: "/$threadId" });
  const navigate = useNavigate();
  const { threads, hydrated, createThread, updateThreadMessages, deleteThread } = useThreads();

  const thread = threads.find((t) => t.id === threadId);

  // Ensure the thread exists in storage (bookmarks / direct links).
  useEffect(() => {
    if (!hydrated) return;
    if (!thread) createThread(threadId);
  }, [hydrated, thread, createThread, threadId]);

  const handleMessagesChange = useCallback(
    (messages: UIMessage[]) => {
      updateThreadMessages(threadId, messages);
    },
    [threadId, updateThreadMessages],
  );

  return (
    <div className="flex h-screen w-full bg-background">
      <ThreadSidebar
        threads={threads}
        onNew={() => {
          const t = createThread();
          navigate({ to: "/$threadId", params: { threadId: t.id } });
        }}
        onDelete={deleteThread}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <h1 className="sr-only">
          Ubuntu Navigator — Rights and Grants Assistant for Cape Town
        </h1>
        {hydrated ? (
          <ChatWindow
            key={threadId}
            threadId={threadId}
            initialMessages={thread?.messages ?? []}
            onMessagesChange={handleMessagesChange}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Loading…
          </div>
        )}
      </main>
    </div>
  );
}
