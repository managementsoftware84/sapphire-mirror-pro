import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Software Vala Boss Panel" },
      { name: "description", content: "Sign in to manage the Software Vala Marketplace." },
      { property: "og:title", content: "Sign in — Software Vala Boss Panel" },
      { property: "og:description", content: "Operator sign-in for the Software Vala Boss Panel." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/marketplace-manager" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fn = mode === "signin" ? supabase.auth.signInWithPassword : supabase.auth.signUp;
      const { error } = await fn.call(supabase.auth, {
        email,
        password,
        options: mode === "signup" ? { emailRedirectTo: `${window.location.origin}/marketplace-manager` } : undefined,
      } as never);
      if (error) throw error;
      toast.success(mode === "signin" ? "Welcome back" : "Account created");
      navigate({ to: "/marketplace-manager" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/marketplace-manager" });
    if (r.error) { toast.error(r.error.message ?? "Google sign-in failed"); setBusy(false); return; }
    if (r.redirected) return;
    navigate({ to: "/marketplace-manager" });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-950 text-white px-4">
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md shadow-2xl">
        <h1 className="text-2xl font-bold">{mode === "signin" ? "Sign in" : "Create account"}</h1>
        <p className="mt-1 text-sm text-white/60">Manager access to Software Vala Boss Panel.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-cyan-400/60" />
          <input type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-cyan-400/60" />
          <button disabled={busy} className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2.5 text-sm font-semibold disabled:opacity-60">{busy ? "…" : mode === "signin" ? "Sign in" : "Sign up"}</button>
        </form>
        <button onClick={google} disabled={busy} className="mt-3 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold hover:bg-white/[0.08] disabled:opacity-60">Continue with Google</button>
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-4 w-full text-center text-xs text-white/60 hover:text-white">
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
        <Link to="/" className="mt-2 block text-center text-xs text-white/40 hover:text-white/70">← Back to homepage</Link>
      </div>
    </div>
  );
}
