import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { Plus, Trash2, MessageSquare, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoredThread } from "@/lib/threads";
import logo from "@/assets/logo.png";

type Props = {
  threads: StoredThread[];
  onNew: () => void;
  onDelete: (id: string) => void;
};

export function ThreadSidebar({ threads, onNew, onDelete }: Props) {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };
  const activeId = params.threadId;

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <img src={logo} alt="" width={40} height={40} className="rounded-lg bg-white/10 p-1" />
        <div className="min-w-0">
          <div className="font-display text-lg leading-tight">Ubuntu Navigator</div>
          <div className="text-xs text-sidebar-foreground/70">Cape Town rights & grants</div>
        </div>
      </div>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => {
            onNew();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-sidebar-primary px-3 py-2 text-sm font-semibold text-sidebar-primary-foreground shadow-sm transition hover:brightness-95"
        >
          <Plus className="size-4" />
          New chat
        </button>
      </div>

      <div className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
        Recent chats
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {threads.length === 0 && (
          <p className="px-2 py-4 text-sm text-sidebar-foreground/70">
            No chats yet. Start a conversation.
          </p>
        )}
        <ul className="space-y-1">
          {threads.map((t) => {
            const isActive = t.id === activeId;
            return (
              <li key={t.id} className="group relative">
                <Link
                  to="/$threadId"
                  params={{ threadId: t.id }}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/90 hover:bg-sidebar-accent/60",
                  )}
                >
                  <MessageSquare className="size-4 shrink-0 opacity-80" />
                  <span className="truncate">{t.title || "New chat"}</span>
                </Link>
                <button
                  type="button"
                  aria-label="Delete chat"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const next = threads.filter((x) => x.id !== t.id)[0];
                    onDelete(t.id);
                    if (isActive) {
                      if (next) navigate({ to: "/$threadId", params: { threadId: next.id } });
                      else navigate({ to: "/" });
                    }
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-sidebar-foreground/60 opacity-0 transition hover:bg-black/20 hover:text-sidebar-foreground group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border/60 px-4 py-3 text-xs text-sidebar-foreground/70">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-3.5" />
          <span>These services are free. Never pay a middleman.</span>
        </div>
      </div>
    </aside>
  );
}
