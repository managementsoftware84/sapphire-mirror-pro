import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowDown, ArrowUp, Eye, EyeOff, LogIn, Plus, Save, ShieldAlert, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, PageHeader, PillButton, StatCard } from "../ui";
import { claimAdmin, whoAmI } from "@/lib/marketplace-content/hero.functions";
import {
  deleteAnnouncement, deleteFeatureItem, reorderHomepageSections,
  saveSiteSetting, updateHomepageSection, upsertAnnouncement, upsertFeatureItem,
  type Announcement, type FeatureItem, type HomepageSection,
} from "@/lib/marketplace-content/site.functions";
import { homepageConfigQuery } from "@/lib/marketplace-content/siteQueries";

const GRADIENTS = [
  "from-amber-500 via-orange-500 to-red-500",
  "from-cyan-500 via-blue-600 to-indigo-700",
  "from-emerald-500 via-teal-600 to-cyan-700",
  "from-fuchsia-500 via-purple-600 to-indigo-700",
  "from-gray-800 via-gray-900 to-black",
];
const ICONS = ["PartyPopper","Truck","ShieldCheck","Headphones","Tag","Zap","Clock","BadgeCheck","Lock","Boxes","Globe2","Sparkles","Rocket","Star"];
const COLORS = ["text-emerald-300","text-cyan-300","text-amber-300","text-rose-300","text-violet-300","text-fuchsia-300","text-sky-300"];

const input =
  "w-full rounded-lg border border-border bg-white/[0.04] px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60";

/* ---------------- gates ---------------- */

function useSignedIn() {
  const [userId, setUserId] = useState<string | null>(null);
  useMemo(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  return userId;
}

function Gate({ children }: { children: React.ReactNode }) {
  const userId = useSignedIn();
  const who = useServerFn(whoAmI);
  const q = useQuery({ queryKey: ["whoami"], queryFn: () => who(), enabled: !!userId });
  const claim = useMutation({ mutationFn: useServerFn(claimAdmin), onSuccess: () => q.refetch() });

  if (!userId) {
    return (
      <div className="px-4 py-16 md:px-8">
        <Card className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-accent/15 text-accent"><LogIn className="h-6 w-6" /></div>
          <h2 className="text-lg font-semibold">Sign in required</h2>
          <p className="mt-1 text-sm text-muted-foreground">The Marketplace Manager controls the live homepage. Sign in to manage it.</p>
          <a href="/auth" className="mt-4 inline-block rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-semibold text-white">Go to sign-in</a>
        </Card>
      </div>
    );
  }
  if (q.isLoading) return <div className="px-8 py-12 text-sm text-muted-foreground">Checking access…</div>;
  if (!q.data?.isAdmin) {
    return (
      <div className="px-4 py-16 md:px-8">
        <Card className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-warning/15 text-warning"><ShieldAlert className="h-6 w-6" /></div>
          <h2 className="text-lg font-semibold">Admin access needed</h2>
          <p className="mt-1 text-sm text-muted-foreground">Your account is signed in but has no admin role yet.</p>
          <button onClick={() => claim.mutate(undefined as never)} className="mt-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-semibold text-white">
            {claim.isPending ? "Claiming…" : "Claim admin (first user only)"}
          </button>
        </Card>
      </div>
    );
  }
  return <>{children}</>;
}

/* ---------------- homepage control ---------------- */

export function HomepageControlSection() {
  return <Gate><HomepageControlInner /></Gate>;
}

function HomepageControlInner() {
  const qc = useQueryClient();
  const cfgQ = useQuery(homepageConfigQuery());
  const cfg = cfgQ.data;
  const refresh = () => qc.invalidateQueries({ queryKey: ["homepage_config"] });

  const upsertAnnFn = useServerFn(upsertAnnouncement);
  const delAnnFn = useServerFn(deleteAnnouncement);
  const upsertFeatFn = useServerFn(upsertFeatureItem);
  const delFeatFn = useServerFn(deleteFeatureItem);
  const saveSettingFn = useServerFn(saveSiteSetting);

  const saveAnn = useMutation({ mutationFn: (v: Omit<Announcement, "id"> & { id?: string }) => upsertAnnFn({ data: v }), onSuccess: () => { toast.success("Announcement saved — live on homepage"); refresh(); }, onError: (e: Error) => toast.error(e.message) });
  const delAnn = useMutation({ mutationFn: (id: string) => delAnnFn({ data: { id } }), onSuccess: () => { toast.success("Announcement removed"); refresh(); }, onError: (e: Error) => toast.error(e.message) });
  const saveFeat = useMutation({ mutationFn: (v: Omit<FeatureItem, "id"> & { id?: string }) => upsertFeatFn({ data: v }), onSuccess: () => { toast.success("Feature strip updated"); refresh(); }, onError: (e: Error) => toast.error(e.message) });
  const delFeat = useMutation({ mutationFn: (id: string) => delFeatFn({ data: { id } }), onSuccess: () => { toast.success("Item removed"); refresh(); }, onError: (e: Error) => toast.error(e.message) });
  const saveSetting = useMutation({ mutationFn: (v: { key: string; value: unknown }) => saveSettingFn({ data: v }), onSuccess: () => { toast.success("Settings saved"); refresh(); }, onError: (e: Error) => toast.error(e.message) });

  const [brand, setBrand] = useState<{ name: string; tagline: string } | null>(null);
  const [footer, setFooter] = useState<{ copyright: string; tagline: string } | null>(null);
  const [badges, setBadges] = useState<{ lifetime_deal: string; discount: string } | null>(null);

  if (cfgQ.isLoading) return <div className="px-8 py-12 text-sm text-muted-foreground">Loading homepage content…</div>;

  const b = brand ?? { name: String(cfg?.settings.brand?.name ?? ""), tagline: String(cfg?.settings.brand?.tagline ?? "") };
  const f = footer ?? { copyright: String(cfg?.settings.footer?.copyright ?? ""), tagline: String(cfg?.settings.footer?.tagline ?? "") };
  const hb = badges ?? { lifetime_deal: String(cfg?.settings.header_badges?.lifetime_deal ?? ""), discount: String(cfg?.settings.header_badges?.discount ?? "") };

  const anns = cfg?.announcements ?? [];
  const feats = cfg?.features ?? [];

  return (
    <div className="px-4 py-8 md:px-8">
      <PageHeader
        eyebrow="Homepage Control"
        title="Announcements, Feature Strip & Branding"
        description="Everything here writes straight to the live public homepage."
        actions={<a href="/" target="_blank" rel="noreferrer"><PillButton>Preview homepage</PillButton></a>}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Announcements" value={String(anns.length)} />
        <StatCard label="Live announcements" value={String(anns.filter((a) => a.visible).length)} tone="success" />
        <StatCard label="Strip items" value={String(feats.length)} />
        <StatCard label="Sections" value={String(cfg?.sections.length ?? 0)} tone="premium" />
      </div>

      {/* Branding */}
      <Card className="mb-6">
        <h3 className="mb-3 text-base font-bold">Header & footer content</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs text-muted-foreground">Brand name
            <input className={input} value={b.name} onChange={(e) => setBrand({ ...b, name: e.target.value })} />
          </label>
          <label className="text-xs text-muted-foreground">Brand tagline
            <input className={input} value={b.tagline} onChange={(e) => setBrand({ ...b, tagline: e.target.value })} />
          </label>
          <label className="text-xs text-muted-foreground">Lifetime deal pill
            <input className={input} value={hb.lifetime_deal} onChange={(e) => setBadges({ ...hb, lifetime_deal: e.target.value })} />
          </label>
          <label className="text-xs text-muted-foreground">Discount pill
            <input className={input} value={hb.discount} onChange={(e) => setBadges({ ...hb, discount: e.target.value })} />
          </label>
          <label className="text-xs text-muted-foreground">Footer copyright
            <input className={input} value={f.copyright} onChange={(e) => setFooter({ ...f, copyright: e.target.value })} />
          </label>
          <label className="text-xs text-muted-foreground">Footer tagline
            <input className={input} value={f.tagline} onChange={(e) => setFooter({ ...f, tagline: e.target.value })} />
          </label>
        </div>
        <button
          onClick={() => {
            saveSetting.mutate({ key: "brand", value: b });
            saveSetting.mutate({ key: "footer", value: f });
            saveSetting.mutate({
              key: "header_badges",
              value: { ...(cfg?.settings.header_badges ?? {}), ...hb },
            });
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white"
        >
          <Save className="h-3.5 w-3.5" /> Save branding
        </button>
      </Card>

      {/* Announcements */}
      <Card className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold">Announcement banner slides</h3>
          <button
            onClick={() =>
              saveAnn.mutate({
                title: "New announcement —", badge: "Badge", text: "Describe this announcement.",
                icon_name: "PartyPopper", gradient: GRADIENTS[0], position: anns.length, visible: true,
                starts_at: null, ends_at: null,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.04] px-3 py-1.5 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" /> Add slide
          </button>
        </div>
        <div className="space-y-3">
          {anns.map((a) => (
            <AnnouncementRow
              key={a.id} row={a}
              onSave={(v) => saveAnn.mutate(v)}
              onDelete={() => delAnn.mutate(a.id)}
            />
          ))}
          {anns.length === 0 && <div className="text-sm text-muted-foreground">No announcements — the banner is hidden.</div>}
        </div>
      </Card>

      {/* Feature strip */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold">Feature strip items</h3>
          <button
            onClick={() => saveFeat.mutate({ label: "New benefit", icon_name: "ShieldCheck", color_class: COLORS[0], position: feats.length, visible: true })}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.04] px-3 py-1.5 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" /> Add item
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {feats.map((it) => (
            <FeatureRow key={it.id} row={it} onSave={(v) => saveFeat.mutate(v)} onDelete={() => delFeat.mutate(it.id)} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function AnnouncementRow({ row, onSave, onDelete }: { row: Announcement; onSave: (v: Announcement) => void; onDelete: () => void }) {
  const [d, setD] = useState(row);
  return (
    <div className="rounded-xl border border-border bg-white/[0.02] p-3">
      <div className="grid gap-2 md:grid-cols-3">
        <input className={input} value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} placeholder="Title" />
        <input className={input} value={d.badge} onChange={(e) => setD({ ...d, badge: e.target.value })} placeholder="Badge" />
        <input className={input} value={d.text} onChange={(e) => setD({ ...d, text: e.target.value })} placeholder="Supporting text" />
        <select className={input} value={d.icon_name} onChange={(e) => setD({ ...d, icon_name: e.target.value })}>
          {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <select className={input} value={d.gradient} onChange={(e) => setD({ ...d, gradient: e.target.value })}>
          {GRADIENTS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <input className={input} type="number" value={d.position} onChange={(e) => setD({ ...d, position: Number(e.target.value) })} placeholder="Position" />
        <label className="text-[11px] text-muted-foreground">Start (optional)
          <input className={input} type="datetime-local" value={d.starts_at ? d.starts_at.slice(0, 16) : ""} onChange={(e) => setD({ ...d, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
        </label>
        <label className="text-[11px] text-muted-foreground">End (optional)
          <input className={input} type="datetime-local" value={d.ends_at ? d.ends_at.slice(0, 16) : ""} onChange={(e) => setD({ ...d, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={() => onSave(d)} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white"><Save className="h-3.5 w-3.5" /> Save</button>
        <button onClick={() => onSave({ ...d, visible: !d.visible })} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold">
          {d.visible ? <><Eye className="h-3.5 w-3.5" /> Visible</> : <><EyeOff className="h-3.5 w-3.5" /> Hidden</>}
        </button>
        <button onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
      </div>
    </div>
  );
}

function FeatureRow({ row, onSave, onDelete }: { row: FeatureItem; onSave: (v: FeatureItem) => void; onDelete: () => void }) {
  const [d, setD] = useState(row);
  return (
    <div className="rounded-xl border border-border bg-white/[0.02] p-3">
      <div className="grid gap-2 md:grid-cols-2">
        <input className={input} value={d.label} onChange={(e) => setD({ ...d, label: e.target.value })} />
        <input className={input} type="number" value={d.position} onChange={(e) => setD({ ...d, position: Number(e.target.value) })} />
        <select className={input} value={d.icon_name} onChange={(e) => setD({ ...d, icon_name: e.target.value })}>
          {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <select className={input} value={d.color_class} onChange={(e) => setD({ ...d, color_class: e.target.value })}>
          {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => onSave(d)} className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white">Save</button>
        <button onClick={() => onSave({ ...d, visible: !d.visible })} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold">{d.visible ? "Visible" : "Hidden"}</button>
        <button onClick={onDelete} className="rounded-full border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive">Delete</button>
      </div>
    </div>
  );
}

/* ---------------- layout order ---------------- */

export function LayoutOrderSection() {
  return <Gate><LayoutOrderInner /></Gate>;
}

function LayoutOrderInner() {
  const qc = useQueryClient();
  const cfgQ = useQuery(homepageConfigQuery());
  const refresh = () => qc.invalidateQueries({ queryKey: ["homepage_config"] });
  const updateFn = useServerFn(updateHomepageSection);
  const reorderFn = useServerFn(reorderHomepageSections);
  const update = useMutation({ mutationFn: (v: { id: string; visible?: boolean; label?: string }) => updateFn({ data: v }), onSuccess: () => { toast.success("Homepage updated"); refresh(); }, onError: (e: Error) => toast.error(e.message) });
  const reorder = useMutation({ mutationFn: (order: { id: string; position: number }[]) => reorderFn({ data: { order } }), onSuccess: () => { toast.success("Order saved"); refresh(); }, onError: (e: Error) => toast.error(e.message) });

  const sections: HomepageSection[] = cfgQ.data?.sections ?? [];

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...sections];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    reorder.mutate(next.map((s, i) => ({ id: s.id, position: i })));
  };

  return (
    <div className="px-4 py-8 md:px-8">
      <PageHeader
        eyebrow="Layout Order"
        title="Homepage section order & visibility"
        description="Reorder or hide any block of the public homepage. Changes apply immediately."
        actions={<a href="/" target="_blank" rel="noreferrer"><PillButton>Preview homepage</PillButton></a>}
      />
      <Card>
        <div className="divide-y divide-border">
          {sections.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 py-3">
              <span className="w-8 text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold">{s.label}</div>
                <div className="text-[11px] text-muted-foreground">{s.section_key}</div>
              </div>
              <button onClick={() => move(i, -1)} className="rounded-lg border border-border p-1.5" aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button onClick={() => move(i, 1)} className="rounded-lg border border-border p-1.5" aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></button>
              <button
                onClick={() => update.mutate({ id: s.id, visible: !s.visible })}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${s.visible ? "border-success/40 text-success" : "border-border text-muted-foreground"}`}
              >
                {s.visible ? <><Eye className="h-3.5 w-3.5" /> Live</> : <><EyeOff className="h-3.5 w-3.5" /> Hidden</>}
              </button>
            </div>
          ))}
          {sections.length === 0 && <div className="py-6 text-sm text-muted-foreground">Loading sections…</div>}
        </div>
      </Card>
    </div>
  );
}
