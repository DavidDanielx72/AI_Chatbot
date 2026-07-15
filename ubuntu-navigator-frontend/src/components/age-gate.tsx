import { useEffect, useState } from "react";
import { ShieldCheck, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";

const STORAGE_KEY = "sassa-navigator.age-verified";

export function AgeGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    try {
      const v = typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY);
      setVerified(v === "true");
    } catch {
      setVerified(false);
    }
  }, []);

  if (verified === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (verified) return <>{children}</>;

  const confirm = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* noop */
    }
    setVerified(true);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* animated aurora backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-40 size-[520px] rounded-full bg-primary/20 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-40 size-[520px] rounded-full bg-accent/25 blur-3xl animate-pulse-slower" />
        <div className="absolute left-1/2 top-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.588_0.155_40/0.12)] blur-3xl animate-float" />
      </div>

      <div className="w-full max-w-md animate-scale-in rounded-3xl border border-border/70 bg-card/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative">
            <img src={logo} alt="" width={56} height={56} className="rounded-2xl shadow-md" />
            <Sparkles className="absolute -right-1 -top-1 size-4 text-accent animate-pulse" />
          </div>
          <div>
            <div className="font-display text-xl leading-tight">Ubuntu Navigator</div>
            <div className="text-xs text-muted-foreground">Cape Town rights & grants</div>
          </div>
        </div>

        <h1 className="font-display text-2xl">Before we begin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This service is for people who are <strong>16 years or older</strong>. Please confirm your age
          to continue. Your answer is stored on this device only.
        </p>

        {denied ? (
          <div className="mt-6 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
            You need to be 16 or older to use Ubuntu Navigator. If you need help, please ask a
            trusted adult, a teacher, or visit your nearest SASSA or Home Affairs office.
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={confirm}
              className="group relative flex-1 overflow-hidden rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:brightness-110 active:scale-[0.98]"
            >
              <span className="relative z-10 inline-flex items-center justify-center gap-2">
                <ShieldCheck className="size-4" /> I'm 16 or older
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
            <button
              type="button"
              onClick={() => setDenied(true)}
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              I'm under 16
            </button>
          </div>
        )}

        <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
          Ubuntu Navigator provides general information about SASSA, Home Affairs, SARS and labour
          rights. It is not legal advice. These services are always free — never pay a middleman.
        </p>
      </div>
    </div>
  );
}
