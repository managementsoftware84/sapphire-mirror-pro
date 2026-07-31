import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LogIn, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui";
import { claimAdmin, whoAmI } from "@/lib/marketplace-content/hero.functions";

/** Gate that requires a signed-in workspace admin before rendering manager tools. */
export function AdminOnly({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (userId === undefined) return <Pending label="Checking session…" />;
  if (userId === null) {
    return (
      <Shell icon={<LogIn className="h-6 w-6" />} tone="accent" title="Sign in required">
        <p className="mt-1 text-sm text-muted-foreground">
          The Marketplace Manager is the single source of truth for homepage content. Sign in to manage it.
        </p>
        <a href="/auth" className="mt-4 inline-block rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-semibold text-white">
          Go to sign-in
        </a>
      </Shell>
    );
  }
  return <RoleGate>{children}</RoleGate>;
}

function RoleGate({ children }: { children: ReactNode }) {
  const who = useServerFn(whoAmI);
  const q = useQuery({ queryKey: ["whoami"], queryFn: () => who() });
  const claim = useMutation({ mutationFn: useServerFn(claimAdmin), onSuccess: () => q.refetch() });

  if (q.isLoading) return <Pending label="Checking access…" />;
  if (!q.data?.isAdmin) {
    return (
      <Shell icon={<ShieldAlert className="h-6 w-6" />} tone="amber" title="Admin role required">
        <p className="mt-1 text-sm text-muted-foreground">
          Only workspace admins can edit homepage content. If no admin exists yet, claim it now.
        </p>
        <button
          disabled={claim.isPending}
          onClick={() =>
            claim.mutate(undefined, {
              onSuccess: (r) => (r.isAdmin ? toast.success("You are now admin") : toast.error("Admin already claimed")),
              onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
            })
          }
          className="mt-4 inline-block rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Claim admin
        </button>
      </Shell>
    );
  }
  return <>{children}</>;
}

function Pending({ label }: { label: string }) {
  return <div className="px-8 py-12 text-sm text-muted-foreground">{label}</div>;
}

function Shell({ icon, tone, title, children }: { icon: ReactNode; tone: "accent" | "amber"; title: string; children: ReactNode }) {
  return (
    <div className="px-4 py-16 md:px-8">
      <Card className="mx-auto max-w-md text-center">
        <div className={`mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl ${tone === "amber" ? "bg-amber-500/15 text-amber-400" : "bg-accent/15 text-accent"}`}>
          {icon}
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {children}
      </Card>
    </div>
  );
}
