import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useThreads } from "@/hooks/use-threads";
import { ThreadSidebar } from "@/components/thread-sidebar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ubuntu Navigator — Cape Town Rights & Grants AI" },
      {
        name: "description",
        content:
          "Free AI helper for people in Cape Town. Apply for SASSA grants, Smart IDs, tax numbers and understand your rights — in plain language.",
      },
      { property: "og:title", content: "Ubuntu Navigator — Cape Town Rights & Grants AI" },
      {
        property: "og:description",
        content:
          "Free AI helper for SASSA, Home Affairs, SARS, and labour rights in Cape Town. Know what to bring before you queue.",
      },
      { property: "og:url", content: "https://cape-town-aid-guide.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://cape-town-aid-guide.lovable.app/" }],
  }),
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();
  const { threads, hydrated, createThread, deleteThread } = useThreads();

  useEffect(() => {
    if (!hydrated) return;
    const target = threads[0] ?? createThread();
    navigate({ to: "/$threadId", params: { threadId: target.id }, replace: true });
  }, [hydrated, threads, createThread, navigate]);

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
      <main className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
        Loading your chat…
      </main>
    </div>
  );
}
