import { useMemo, useState, type ReactNode } from "react";
import {
  MonitorPlay, Globe2, Link2, KeyRound, RotateCcw, RefreshCw, Play, Pause, Clock,
  QrCode, Copy, ExternalLink, ShieldCheck, Smartphone, Monitor, WifiOff, Package,
  Users, Store, PenTool, LayoutDashboard, Server, Activity, Search, Sparkles,
} from "lucide-react";
import { Card, EmptyHint, PageHeader, PillButton, StatCard, SubNav } from "../ui";

/* ---------------- micro primitives (demo-scoped) ---------------- */

function Tone({ tone, children }: { tone: "info" | "success" | "warning" | "danger" | "muted" | "premium"; children: ReactNode }) {
  const map: Record<string, string> = {
    info: "bg-accent/15 text-accent border-accent/30",
    success: "bg-success/15 text-success border-success/30",
    warning: "bg-warning/15 text-warning border-warning/30",
    danger: "bg-destructive/15 text-destructive border-destructive/30",
    muted: "bg-white/[0.04] text-muted-foreground border-border",
    premium: "bg-premium/15 text-premium border-premium/30",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[tone]}`}>
      {children}
    </span>
  );
}

function IconBtn({ icon: Icon, label, tone = "muted" }: { icon: React.ComponentType<{ className?: string }>; label: string; tone?: "muted" | "danger" | "success" | "accent" }) {
  const toneCls: Record<string, string> = {
    muted: "hover:border-accent/40 hover:text-accent",
    danger: "hover:border-destructive/50 hover:text-destructive",
    success: "hover:border-success/50 hover:text-success",
    accent: "border-accent/40 text-accent hover:bg-accent/10",
  };
  return (
    <button
      title={label}
      className={`inline-flex items-center gap-1.5 rounded-md border border-border bg-background/50 px-2 py-1 text-[11px] font-semibold text-foreground transition-all ${toneCls[tone]}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        {hint && <span className="text-[10px] text-muted-foreground/70">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function Input({ value, mono = false }: { value: string; mono?: boolean }) {
  return (
    <div
      className={`w-full truncate rounded-lg border border-border bg-background/60 px-3 py-2 text-xs text-foreground ${mono ? "font-mono tabular" : ""}`}
    >
      {value}
    </div>
  );
}

function Toggle({ label, on = false }: { label: string; on?: boolean }) {
  const [v, setV] = useState(on);
  return (
    <button
      onClick={() => setV(!v)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2 text-left"
    >
      <span className="text-[11px] font-semibold text-foreground">{label}</span>
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${v ? "bg-gradient-to-r from-primary to-accent" : "bg-secondary"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform ${v ? "translate-x-4" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}

/* ---------------- data model (structure only — values stay "—") ---------------- */

type Surface = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pattern: string;
  kind: "web" | "mobile" | "desktop" | "offline" | "sandbox";
};

const SURFACES: Surface[] = [
  { key: "live", label: "Live Demo", icon: Globe2, pattern: "https://{slug}.demo.softwarewala.net", kind: "web" },
  { key: "frontend", label: "Frontend Demo", icon: MonitorPlay, pattern: "https://{slug}.demo.softwarewala.net/", kind: "web" },
  { key: "backend", label: "Backend Demo", icon: Server, pattern: "https://{slug}.demo.softwarewala.net/backend", kind: "web" },
  { key: "admin", label: "Admin Demo", icon: LayoutDashboard, pattern: "https://{slug}.demo.softwarewala.net/admin", kind: "web" },
  { key: "customer", label: "Customer Demo", icon: Users, pattern: "https://{slug}.demo.softwarewala.net/app", kind: "web" },
  { key: "vendor", label: "Vendor Demo", icon: Store, pattern: "https://{slug}.demo.softwarewala.net/vendor", kind: "web" },
  { key: "author", label: "Author Demo", icon: PenTool, pattern: "https://{slug}.demo.softwarewala.net/author", kind: "web" },
  { key: "mobile", label: "Mobile Demo", icon: Smartphone, pattern: "https://{slug}.demo.softwarewala.net/m", kind: "mobile" },
  { key: "apk", label: "APK Demo", icon: Package, pattern: "https://cdn.softwarewala.net/demo/{slug}.apk", kind: "mobile" },
  { key: "desktop", label: "Desktop Demo", icon: Monitor, pattern: "https://cdn.softwarewala.net/demo/{slug}-setup.exe", kind: "desktop" },
  { key: "offline", label: "Offline Demo", icon: WifiOff, pattern: "https://cdn.softwarewala.net/demo/{slug}-offline.zip", kind: "offline" },
  { key: "sandbox", label: "Sandbox Demo", icon: MonitorPlay, pattern: "https://sandbox.softwarewala.net/{slug}", kind: "sandbox" },
];

const ROLE_CREDENTIALS = [
  { role: "Admin", user: "admin@demo.softwarewala.net", pass: "•••••••• (rotating)", scope: "Full admin" },
  { role: "Customer", user: "customer@demo.softwarewala.net", pass: "•••••••• (rotating)", scope: "Storefront" },
  { role: "Vendor", user: "vendor@demo.softwarewala.net", pass: "•••••••• (rotating)", scope: "Vendor console" },
  { role: "Author", user: "author@demo.softwarewala.net", pass: "•••••••• (rotating)", scope: "Author console" },
  { role: "Support", user: "support@demo.softwarewala.net", pass: "•••••••• (rotating)", scope: "Read-only" },
];

const TABS = ["All Demos", "Live", "Sandbox", "Mobile", "Offline", "Credentials", "Reset & Expiry", "Demo SEO", "Health"] as const;

/* ---------------- section ---------------- */

export function DemoSection() {
  const [tab, setTab] = useState<string>(TABS[0]);

  const visible = useMemo(() => {
    if (tab === "Live") return SURFACES.filter((s) => s.kind === "web");
    if (tab === "Sandbox") return SURFACES.filter((s) => s.kind === "sandbox");
    if (tab === "Mobile") return SURFACES.filter((s) => s.kind === "mobile" || s.kind === "desktop");
    if (tab === "Offline") return SURFACES.filter((s) => s.kind === "offline");
    return SURFACES;
  }, [tab]);

  return (
    <div className="px-4 py-8 md:px-8">
      <PageHeader
        eyebrow="Catalog · Demo System"
        title="Demo URL Command Center"
        description="Every demo surface for every product — URLs, credentials, one-click login, auto-reset, expiry, QR sharing, indexing guards and uptime, controlled from one console."
        actions={
          <>
            <PillButton variant="ghost"><span className="inline-flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Regenerate URLs</span></PillButton>
            <PillButton variant="primary"><span className="inline-flex items-center gap-1.5"><Play className="h-3.5 w-3.5" /> Provision Demo</span></PillButton>
          </>
        }
      />

      <SubNav items={[...TABS]} active={tab} onChange={setTab} />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Active Demos" value="—" icon={<MonitorPlay className="h-3.5 w-3.5" />} />
        <StatCard label="Auto-Reset Today" value="—" tone="success" icon={<RotateCcw className="h-3.5 w-3.5" />} />
        <StatCard label="Expiring < 48h" value="—" tone="warning" icon={<Clock className="h-3.5 w-3.5" />} />
        <StatCard label="Demo Uptime" value="—" tone="premium" icon={<Activity className="h-3.5 w-3.5" />} />
        <StatCard label="One-Click Logins" value="—" icon={<KeyRound className="h-3.5 w-3.5" />} />
      </div>

      {/* URL PATTERNS */}
      {(tab !== "Credentials" && tab !== "Reset & Expiry" && tab !== "Demo SEO" && tab !== "Health") && (
        <>
          <Card className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-accent" />
              <div className="text-sm font-bold">URL Generation Rules</div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Subdomain pattern" hint="Isolated per product"><Input value="https://{slug}.demo.softwarewala.net" mono /></Field>
              <Field label="Path pattern" hint="Shared sandbox"><Input value="https://sandbox.softwarewala.net/{slug}" mono /></Field>
              <Field label="Asset CDN" hint="APK / EXE / offline"><Input value="https://cdn.softwarewala.net/demo/" mono /></Field>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <Toggle on label="Auto-generate on publish" />
              <Toggle on label="Validate URL reachability" />
              <Toggle on label="Force HTTPS + HSTS" />
              <Toggle on label="Short link (svala.to/{slug})" />
              <Toggle on label="UTM auto-tagging on share" />
              <Toggle label="Password protect by default" />
            </div>
          </Card>

          <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
            <MonitorPlay className="h-3.5 w-3.5" /> Demo Surface Matrix
          </div>
          <EmptyHint text="URL structure is live — counters populate once demo telemetry is connected" />

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((s) => (
              <Card key={s.key}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-accent/20 bg-gradient-to-br from-primary/25 to-accent/25 text-accent">
                      <s.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold">{s.label}</div>
                      <div className="mt-0.5 truncate font-mono text-[10px] tabular text-muted-foreground">{s.pattern}</div>
                    </div>
                  </div>
                  <Tone tone="muted">—</Tone>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {[["Visits", "—"], ["Avg session", "—"], ["Errors", "—"]].map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-border bg-background/40 px-2 py-1.5">
                      <div className="font-mono text-[13px] font-bold tabular">{v}</div>
                      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{k}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <IconBtn icon={ExternalLink} label="Open" tone="accent" />
                  <IconBtn icon={Copy} label="Copy" />
                  <IconBtn icon={QrCode} label="QR" />
                  <IconBtn icon={RotateCcw} label="Reset" />
                  <IconBtn icon={Pause} label="Disable" tone="danger" />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* CREDENTIALS */}
      {tab === "Credentials" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-accent" />
                <span className="text-sm font-bold">Demo Credentials</span>
              </div>
              <IconBtn icon={RefreshCw} label="Rotate all" />
            </div>
            <div className="divide-y divide-border">
              {ROLE_CREDENTIALS.map((c) => (
                <div key={c.role} className="grid grid-cols-12 items-center gap-3 px-4 py-3">
                  <div className="col-span-3 text-sm font-bold">{c.role}</div>
                  <div className="col-span-5 truncate font-mono text-[11px] tabular text-muted-foreground">{c.user}</div>
                  <div className="col-span-2 font-mono text-[11px] tabular text-muted-foreground">{c.pass}</div>
                  <div className="col-span-2 flex justify-end gap-1.5">
                    <IconBtn icon={Copy} label="Copy" />
                    <IconBtn icon={Play} label="Login" tone="success" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              <div className="text-sm font-bold">One-Click Login & Guardrails</div>
            </div>
            <div className="grid gap-2">
              <Toggle on label="One-click login tokens (signed, 15 min TTL)" />
              <Toggle on label="Rotate demo passwords every reset" />
              <Toggle on label="Block outbound email from demo" />
              <Toggle on label="Block real payments (sandbox gateway only)" />
              <Toggle on label="Mask PII in seeded demo data" />
              <Toggle label="Allow visitor-created accounts" />
            </div>
            <div className="mt-4 rounded-lg border border-premium/40 bg-premium/10 p-3 text-[11px] text-premium">
              Demo sessions never touch production data, payments or customer records.
            </div>
          </Card>
        </div>
      )}

      {/* RESET & EXPIRY */}
      {tab === "Reset & Expiry" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-accent" />
              <div className="text-sm font-bold">Auto-Reset Schedule</div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Reset frequency"><Input value="Every 6 hours" /></Field>
              <Field label="Reset window" hint="Low traffic"><Input value="02:00 – 02:15 IST" mono /></Field>
              <Field label="Seed dataset"><Input value="demo-seed-v4 (verified)" mono /></Field>
              <Field label="Reset strategy"><Input value="Snapshot restore" /></Field>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <Toggle on label="Reset on session end" />
              <Toggle on label="Reset after 50 sessions" />
              <Toggle on label="Notify on failed reset" />
              <Toggle label="Freeze resets during campaigns" />
            </div>
          </Card>
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <div className="text-sm font-bold">Expiry & Lifecycle</div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Default demo lifetime"><Input value="30 days" /></Field>
              <Field label="Grace period"><Input value="72 hours" /></Field>
              <Field label="On expiry"><Input value="Disable + redirect to product page" /></Field>
              <Field label="Renewal"><Input value="Auto-renew while product published" /></Field>
            </div>
            <div className="mt-3 space-y-2">
              {["Expiring in 24h", "Expiring in 7 days", "Expired (archived)"].map((l) => (
                <div key={l} className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2">
                  <span className="text-[11px] font-semibold">{l}</span>
                  <span className="font-mono text-sm font-bold tabular text-muted-foreground">—</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* DEMO SEO */}
      {tab === "Demo SEO" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Search className="h-4 w-4 text-accent" />
              <div className="text-sm font-bold">Indexing Guard</div>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Demo surfaces must never outrank or duplicate the canonical product page. These rules are applied to every generated demo URL.
            </p>
            <div className="grid gap-2">
              <Toggle on label="noindex, nofollow on all demo URLs" />
              <Toggle on label="Canonical → product page" />
              <Toggle on label="robots.txt Disallow: / on demo hosts" />
              <Toggle on label="X-Robots-Tag header enforcement" />
              <Toggle on label="Exclude demo hosts from sitemap" />
              <Toggle on label="Block AI crawlers on demo hosts" />
            </div>
          </Card>
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-accent" />
              <div className="text-sm font-bold">Emitted Head — demo host</div>
            </div>
            <pre className="scroll-row max-h-72 overflow-auto rounded-lg border border-border bg-background/60 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">{`<meta name="robots" content="noindex, nofollow, noarchive" />
<link rel="canonical" href="https://softwarewala.net/software/{category}/{slug}" />
<meta property="og:title" content="{Product} — Live Demo | Software Vala" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
# robots.txt (demo host)
User-agent: *
Disallow: /`}</pre>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <IconBtn icon={Sparkles} label="Re-run SEO audit" tone="accent" />
              <IconBtn icon={RefreshCw} label="Re-apply to all demos" />
            </div>
          </Card>
        </div>
      )}

      {/* HEALTH */}
      {tab === "Health" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-success" />
              <div className="text-sm font-bold">Uptime Monitors</div>
            </div>
            <div className="space-y-2">
              {SURFACES.slice(0, 7).map((s) => (
                <div key={s.key} className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <s.icon className="h-3.5 w-3.5 text-accent" />
                    <span className="text-[11px] font-semibold">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] tabular text-muted-foreground">—</span>
                    <Tone tone="muted">No data</Tone>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <div className="text-sm font-bold">Checks & Alerts</div>
            </div>
            <div className="grid gap-2">
              <Toggle on label="HTTP 200 check every 60s" />
              <Toggle on label="SSL expiry check (30-day alert)" />
              <Toggle on label="Broken demo URL auto-disable" />
              <Toggle on label="Slow response alert (> 2.5s)" />
              <Toggle on label="Notify author + ops on failure" />
              <Toggle label="Auto-rollback to last good snapshot" />
            </div>
            <div className="mt-4 rounded-lg border border-border bg-background/40 p-3 text-[11px] text-muted-foreground">
              Health metrics render <span className="font-mono text-foreground">—</span> until monitoring is connected. No demo numbers, per the integrity policy.
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
