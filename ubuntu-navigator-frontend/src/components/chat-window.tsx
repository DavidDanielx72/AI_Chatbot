import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MapPin, Sparkles, AlertTriangle, Navigation, X } from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { LocationPicker } from "@/components/location-picker";

import logo from "@/assets/logo.png";

const SUGGESTIONS = [
  "How do I apply for the SASSA SRD R370 grant?",
  "What documents do I need to apply for a Smart ID?",
  "I'm a domestic worker — what are my basic rights?",
  "Where can I book a Home Affairs appointment near me?",
];

type LocationCtx = { suburb?: string; lat?: number; lng?: number } | null;

type Props = {
  threadId: string;
  initialMessages: UIMessage[];
  onMessagesChange: (messages: UIMessage[]) => void;
};

export function ChatWindow({ threadId, initialMessages, onMessagesChange }: Props) {
  const [location, setLocation] = useState<LocationCtx>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem("sassa-navigator.location");
      return raw ? (JSON.parse(raw) as LocationCtx) : null;
    } catch {
      return null;
    }
  });
  const [locError, setLocError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (location) {
      window.localStorage.setItem("sassa-navigator.location", JSON.stringify(location));
    }
  }, [location]);

  const locationRef = useRef(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages, id, body }) => ({
          body: {
            id,
            messages,
            location: locationRef.current,
            ...body,
          },
        }),
      }),
    [],
  );

  const { messages, sendMessage, status, stop, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
  });

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "ready" || status === "error" || status === "submitted") {
      onMessagesChange(messages);
    }
  }, [messages, status, onMessagesChange]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId]);
  useEffect(() => {
    if (status === "ready") textareaRef.current?.focus();
  }, [status]);

  const handleSubmit = useCallback(
    async (message: { text: string; files: unknown[] }) => {
      const text = message.text.trim();
      if (!text || isBusy) return;
      setInput("");
      await sendMessage({ text });
    },
    [isBusy, sendMessage],
  );

  const send = useCallback(
    async (text: string) => {
      if (isBusy || !text.trim()) return;
      setInput("");
      await sendMessage({ text: text.trim() });
    },
    [isBusy, sendMessage],
  );

  const requestGeolocation = useCallback(() => {
    setLocError(null);
    if (!("geolocation" in navigator)) {
      setLocError("Your device doesn't support location.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setLocation((prev) => ({ ...(prev ?? {}), lat: pos.coords.latitude, lng: pos.coords.longitude }));
      },
      (err) => {
        setLocating(false);
        setLocError(err.message || "Could not get your location.");
      },
      { timeout: 8000, enableHighAccuracy: false },
    );
  }, []);

  const setSuburb = useCallback((s: string) => {
    setLocation((prev) => ({ ...(prev ?? {}), suburb: s }));
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    if (typeof window !== "undefined")
      window.localStorage.removeItem("sassa-navigator.location");
  }, []);

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col bg-aurora">
      {/* Location bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-card/60 px-4 py-2.5 text-sm backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Area</span>
        </div>
        <LocationPicker value={location?.suburb} onChange={setSuburb} />
        <button
          type="button"
          onClick={requestGeolocation}
          disabled={locating}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 text-xs font-medium backdrop-blur transition hover:border-accent hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
        >
          <Navigation className={`size-3.5 ${locating ? "animate-spin" : ""}`} />
          {locating ? "Locating…" : "Use my location"}
        </button>
        {location?.lat && !location?.suburb && (
          <span className="text-xs text-muted-foreground">Using device location</span>
        )}
        {location && (
          <button
            type="button"
            onClick={clearLocation}
            className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-xs text-muted-foreground transition hover:text-foreground"
          >
            <X className="size-3" /> Clear
          </button>
        )}
        {locError && (
          <div className="flex w-full items-center gap-2 text-xs text-destructive">
            <AlertTriangle className="size-3.5" /> {locError}
          </div>
        )}
      </div>

      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl">
          {messages.length === 0 ? (
            <ConversationEmptyState className="min-h-[60vh]" icon={null}>
              <div className="relative mb-3">
                <div className="absolute inset-0 -z-10 animate-pulse-slow rounded-full bg-primary/20 blur-2xl" />
                <img
                  src={logo}
                  alt=""
                  width={88}
                  height={88}
                  className="rounded-3xl shadow-xl animate-float"
                />
              </div>
              <h2 className="font-display text-3xl tracking-tight animate-fade-in-up">
                Molo! How can I help you today?
              </h2>
              <p className="max-w-md text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                Ask about SASSA grants, Smart IDs, SARS, labour rights, or where to go in Cape
                Town. Free to use. Never pay anyone for these services.
              </p>
              <div className="stagger-in mt-6 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="group relative overflow-hidden rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-left text-sm shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <Sparkles className="mb-1.5 inline size-3.5 text-accent" /> {s}
                  </button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            <>
              {messages.map((m, idx) => {
                const text = m.parts
                  .filter((p) => p.type === "text")
                  .map((p) => (p as { text: string }).text)
                  .join("");
                const isLatest = idx === messages.length - 1;
                return (
                  <div key={m.id} className={isLatest ? "animate-fade-in-up" : ""}>
                    <Message from={m.role}>
                      <MessageContent
                        className={
                          m.role === "user"
                            ? "group-[.is-user]:!bg-primary group-[.is-user]:!text-primary-foreground group-[.is-user]:shadow-md"
                            : ""
                        }
                      >
                        {m.role === "assistant" ? (
                          <MessageResponse className="assistant-prose">{text}</MessageResponse>
                        ) : (
                          <div className="whitespace-pre-wrap">{text}</div>
                        )}
                      </MessageContent>
                    </Message>
                  </div>
                );
              })}
              {status === "submitted" && (
                <div className="animate-fade-in-up">
                  <Message from="assistant">
                    <MessageContent>
                      <Shimmer>Thinking…</Shimmer>
                    </MessageContent>
                  </Message>
                </div>
              )}
              {error && (
                <div className="animate-fade-in-up rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  Something went wrong: {error.message}. Please try again.
                </div>
              )}
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border/60 bg-background/70 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-3xl">
          <PromptInput
            onSubmit={handleSubmit}
            className="group rounded-2xl border border-border/70 bg-card/80 shadow-lg backdrop-blur-xl transition focus-within:border-primary/60 focus-within:shadow-xl focus-within:ring-4 focus-within:ring-primary/10"
          >
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a grant, ID, tax, or your rights…"
            />
            <PromptInputFooter className="justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <MapPin className="size-3 text-primary" />
                <span>Not legal advice. In emergencies call SAPS 10111.</span>
              </div>
              <PromptInputSubmit status={status} onStop={stop} disabled={!input.trim() && !isBusy} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
