import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Save, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, ShieldAlert, LogIn } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, PageHeader, PillButton, StatCard } from "../ui";
import {
  claimAdmin, deleteHeroSlide, listHeroSlidesAdmin,
  reorderHeroSlides, upsertHeroSlide, whoAmI, type HeroSlide,
} from "@/lib/marketplace-content/hero.functions";
import { heroAdminQuery } from "@/lib/marketplace-content/heroQueries";

const GRADIENT_PRESETS = [
  "from-cyan-500 via-blue-600 to-indigo-700",
  "from-amber-500 via-orange-600 to-rose-600",
  "from-emerald-500 via-teal-600 to-cyan-700",
  "from-fuchsia-500 via-purple-600 to-indigo-700",
  "from-rose-500 via-pink-600 to-fuchsia-700",
  "from-slate-800 via-slate-900 to-black",
];
const ICON_CHOICES = ["Boxes","Crown","Rocket","Sparkles","ShieldCheck","Zap","Store","Users","Utensils","GraduationCap","Stethoscope","ShoppingCart","Globe2","Lock","BadgeCheck","Clock","Play"];
const ACCENT_CHOICES = ["text-white","text-cyan-100","text-amber-200","text-emerald-200","text-fuchsia-200","text-rose-200","text-yellow-200"];

function blankSlide(nextPos: number): Omit<HeroSlide, "id"> & { id?: string } {
  return {
    slug: "new-slide-" + nextPos,
    kicker: "NEW",
    title: "New Hero Slide",
    subtitle: "Describe this offer.",
    cta_primary: "Explore",
    cta_secondary: "See Demos",
    cta_link: "/marketplace",
    gradient: GRADIENT_PRESETS[0],
    icon_name: "Boxes",
    accent: "text-white",
    position: nextPos,
    visible: true,
    published_at: null,
    unpublish_at: null,
  };
}

export function HeroBannerSection() {
  const [session, setSession] = useState<{ userId: string | null }>({ userId: null });

  // subscribe to auth
  useMemo(() => {
    supabase.auth.getSession().then(({ data }) => setSession({ userId: data.session?.user.id ?? null }));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession({ userId: s?.user.id ?? null }));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!session.userId) return <SignInGate />;
  return <AdminGate />;
}

function SignInGate() {
  return (
    <div className="px-4 py-16 md:px-8">
      <Card className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-accent/15 text-accent"><LogIn className="h-6 w-6" /></div>
        <h2 className="text-lg font-semibold">Sign in required</h2>
        <p className="mt-1 text-sm text-muted-foreground">The Marketplace Manager is the single source of truth for homepage content. Sign in to manage it.</p>
        <a href="/auth" className="mt-4 inline-block rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-semibold text-white">Go to sign-in</a>
      </Card>
    </div>
  );
}

function AdminGate() {
  const who = useServerFn(whoAmI);
  const q = useQuery({ queryKey: ["whoami"], queryFn: () => who() });
  const claim = useMutation({
    mutationFn: useServerFn(claimAdmin),
    onSuccess: () => q.refetch(),
  });
  if (q.isLoading) return <div className="px-8 py-12 text-sm text-muted-foreground">Checking access…</div>;
  if (!q.data?.isAdmin) {
    return (
      <div className="px-4 py-16 md:px-8">
        <Card className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-amber-500/15 text-amber-400"><ShieldAlert className="h-6 w-6" /></div>
          <h2 className="text-lg font-semibold">Admin role required</h2>
          <p className="mt-1 text-sm text-muted-foreground">Only workspace admins can edit homepage content. If no admin exists yet, claim it now.</p>
          <button
            disabled={claim.isPending}
            onClick={() => claim.mutate(undefined, {
              onSuccess: (r) => r.isAdmin ? toast.success("You are now admin") : toast.error("Admin already claimed"),
              onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
            })}
            className="mt-4 inline-block rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Claim admin
          </button>
        </Card>
      </div>
    );
  }
  return <HeroEditor />;
}

function HeroEditor() {
  const qc = useQueryClient();
  const { data: slides } = useSuspenseQuery(heroAdminQuery());
  const [editing, setEditing] = useState<HeroSlide | null>(null);

  const upsertFn = useServerFn(upsertHeroSlide);
  const deleteFn = useServerFn(deleteHeroSlide);
  const reorderFn = useServerFn(reorderHeroSlides);
  const listFn = useServerFn(listHeroSlidesAdmin);

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: ["hero_slides"] });
    const fresh = await listFn();
    qc.setQueryData(["hero_slides", "admin"], fresh);
    qc.setQueryData(["hero_slides", "public"], fresh.filter((s) => s.visible));
  };

  const save = useMutation({
    mutationFn: (s: HeroSlide) => upsertFn({ data: s }),
    onSuccess: async () => { toast.success("Saved"); setEditing(null); await invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: async () => { toast.success("Deleted"); await invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });
  const reorder = useMutation({
    mutationFn: (order: { id: string; position: number }[]) => reorderFn({ data: { order } }),
    onSuccess: () => invalidate(),
  });

  const move = (idx: number, dir: -1 | 1) => {
    const swap = idx + dir;
    if (swap < 0 || swap >= slides.length) return;
    const next = [...slides];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    reorder.mutate(next.map((s, i) => ({ id: s.id, position: i })));
  };

  return (
    <div className="px-4 py-8 md:px-8">
      <PageHeader
        eyebrow="Hero Banner Manager · live source of truth"
        title="Hero Banner Manager"
        description="Every slide here renders on the public homepage carousel. Changes save to the database instantly."
        actions={
          <PillButton
            variant="primary"
            onClick={() => setEditing({ ...blankSlide(slides.length), id: crypto.randomUUID() } as HeroSlide)}
          >
            <span className="inline-flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> New Slide</span>
          </PillButton>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Slides" value={String(slides.length)} />
        <StatCard label="Live" value={String(slides.filter((s) => s.visible).length)} tone="success" />
        <StatCard label="Hidden" value={String(slides.filter((s) => !s.visible).length)} tone="warning" />
        <StatCard label="Source" value="DB" tone="premium" />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {slides.map((s, i) => (
          <div key={s.id} className="glass overflow-hidden rounded-2xl">
            <div className={`relative h-40 bg-gradient-to-br ${s.gradient}`}>
              <div className="absolute inset-0 bg-black/25" />
              <div className="absolute inset-x-4 bottom-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/80">{s.kicker}</div>
                <div className="text-lg font-bold text-white">{s.title}</div>
              </div>
              <div className="absolute right-3 top-3 flex items-center gap-1">
                <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur ${s.visible ? "bg-emerald-500/30 text-emerald-100" : "bg-slate-500/30 text-slate-100"}`}>{s.visible ? "Live" : "Hidden"}</span>
                <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">#{i + 1}</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border p-3">
              <div className="flex items-center gap-1">
                <button title="Up" onClick={() => move(i, -1)} className="rounded p-1.5 hover:bg-white/10"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button title="Down" onClick={() => move(i, 1)} className="rounded p-1.5 hover:bg-white/10"><ArrowDown className="h-3.5 w-3.5" /></button>
                <button
                  title={s.visible ? "Hide" : "Show"}
                  onClick={() => save.mutate({ ...s, visible: !s.visible })}
                  className="rounded p-1.5 hover:bg-white/10"
                >
                  {s.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(s)} className="rounded-full bg-white/[0.06] px-3 py-1 text-[11px] font-semibold hover:bg-white/[0.12]">Edit</button>
                <button onClick={() => confirm("Delete this slide?") && del.mutate(s.id)} className="rounded-full bg-destructive/20 px-3 py-1 text-[11px] font-semibold text-destructive hover:bg-destructive/30"><Trash2 className="inline h-3 w-3" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EditorDialog
          slide={editing}
          onClose={() => setEditing(null)}
          onSave={(s) => save.mutate(s)}
          busy={save.isPending}
        />
      )}
    </div>
  );
}

function EditorDialog({ slide, onClose, onSave, busy }: { slide: HeroSlide; onClose: () => void; onSave: (s: HeroSlide) => void; busy: boolean }) {
  const [f, setF] = useState<HeroSlide>(slide);
  const set = <K extends keyof HeroSlide>(k: K, v: HeroSlide[K]) => setF((p) => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-[color:var(--surface)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold">Edit Slide</h3>
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">
          <div className={`mb-4 h-32 rounded-xl bg-gradient-to-br ${f.gradient} p-4 text-white shadow-inner`}>
            <div className="text-[10px] font-bold uppercase tracking-widest">{f.kicker}</div>
            <div className="mt-1 text-xl font-bold">{f.title}</div>
            <div className="mt-0.5 text-xs opacity-90">{f.subtitle}</div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Slug"><input value={f.slug} onChange={(e) => set("slug", e.target.value)} className={inputCls} /></Field>
            <Field label="Kicker"><input value={f.kicker} onChange={(e) => set("kicker", e.target.value)} className={inputCls} /></Field>
            <Field label="Title" full><input value={f.title} onChange={(e) => set("title", e.target.value)} className={inputCls} /></Field>
            <Field label="Subtitle" full><textarea value={f.subtitle} onChange={(e) => set("subtitle", e.target.value)} rows={2} className={inputCls} /></Field>
            <Field label="Primary CTA text"><input value={f.cta_primary} onChange={(e) => set("cta_primary", e.target.value)} className={inputCls} /></Field>
            <Field label="Secondary CTA text"><input value={f.cta_secondary} onChange={(e) => set("cta_secondary", e.target.value)} className={inputCls} /></Field>
            <Field label="CTA link" full><input value={f.cta_link} onChange={(e) => set("cta_link", e.target.value)} className={inputCls} /></Field>
            <Field label="Gradient" full>
              <select value={f.gradient} onChange={(e) => set("gradient", e.target.value)} className={inputCls}>
                {GRADIENT_PRESETS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Icon">
              <select value={f.icon_name} onChange={(e) => set("icon_name", e.target.value)} className={inputCls}>
                {ICON_CHOICES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Accent color">
              <select value={f.accent} onChange={(e) => set("accent", e.target.value)} className={inputCls}>
                {ACCENT_CHOICES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Position"><input type="number" value={f.position} onChange={(e) => set("position", Number(e.target.value))} className={inputCls} /></Field>
            <Field label="Visible">
              <label className="mt-1 inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={f.visible} onChange={(e) => set("visible", e.target.checked)} /> Show on homepage
              </label>
            </Field>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border bg-black/20 px-5 py-3">
          <button onClick={onClose} className="rounded-full bg-white/[0.05] px-4 py-1.5 text-xs font-semibold hover:bg-white/[0.1]">Cancel</button>
          <button
            disabled={busy}
            onClick={() => onSave(f)}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-1.5 text-xs font-bold text-white disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" /> {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-cyan-400/60";
function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`${full ? "col-span-2" : ""} flex flex-col gap-1`}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
