import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Save, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminOnly } from "../AdminOnly";
import { Card, PageHeader, PillButton, StatCard } from "../ui";
import { PRODUCT_ICONS } from "@/lib/catalog/productIcons";
import {
  deleteCategory, listCategoriesAdmin, upsertCategory, type CategoryRow,
} from "@/lib/catalog/catalog.functions";

const GRADIENTS = [
  "from-cyan-400 to-blue-600",
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-fuchsia-500 to-pink-600",
  "from-pink-500 to-rose-600",
  "from-red-500 to-orange-600",
  "from-amber-500 to-orange-600",
  "from-lime-500 to-green-600",
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-cyan-600",
];

const ICON_CHOICES = Object.keys(PRODUCT_ICONS);

export function CategoryManagerSection() {
  return (
    <AdminOnly>
      <CategoryEditor />
    </AdminOnly>
  );
}

function CategoryEditor() {
  const qc = useQueryClient();
  const listFn = useServerFn(listCategoriesAdmin);
  const upsertFn = useServerFn(upsertCategory);
  const deleteFn = useServerFn(deleteCategory);

  const q = useQuery({ queryKey: ["master_categories", "admin"], queryFn: () => listFn() });
  const rows = useMemo(() => q.data ?? [], [q.data]);
  const [editing, setEditing] = useState<CategoryRow | null>(null);

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["master_categories"] });
    await qc.invalidateQueries({ queryKey: ["catalog"] });
    await q.refetch();
  };

  const save = useMutation({
    mutationFn: (row: CategoryRow) =>
      upsertFn({
        data: {
          name: row.name,
          position: row.position,
          visible: row.visible,
          icon_name: row.icon_name,
          gradient: row.gradient,
          featured: row.featured,
        },
      }),
    onSuccess: async () => {
      toast.success("Category saved — homepage updated");
      setEditing(null);
      await refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const remove = useMutation({
    mutationFn: (name: string) => deleteFn({ data: { name } }),
    onSuccess: async () => {
      toast.success("Category removed");
      await refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const move = (row: CategoryRow, dir: -1 | 1) => {
    const idx = rows.findIndex((r) => r.name === row.name);
    const swap = rows[idx + dir];
    if (!swap) return;
    save.mutate({ ...row, position: swap.position });
    save.mutate({ ...swap, position: row.position });
  };

  const addNew = () => {
    const nextPos = rows.reduce((m, r) => Math.max(m, r.position), 0) + 1;
    setEditing({
      name: "",
      position: nextPos,
      visible: true,
      icon_name: "Package",
      gradient: GRADIENTS[0],
      featured: true,
      created_at: "",
      updated_at: "",
    } as CategoryRow);
  };

  const visibleCount = rows.filter((r) => r.visible).length;
  const featuredCount = rows.filter((r) => r.featured).length;

  return (
    <div className="px-4 py-8 md:px-8">
      <PageHeader
        eyebrow={`Category Manager · ${rows.length} verticals`}
        title="Categories"
        description="Single source of truth for the homepage category strip: order, icon, colour, visibility and feature status."
        actions={
          <PillButton variant="primary" onClick={addNew}>
            <span className="inline-flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> New Category</span>
          </PillButton>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="Total categories" value={String(rows.length)} />
        <StatCard label="Visible on homepage" value={String(visibleCount)} />
        <StatCard label="In category strip" value={String(featuredCount)} />
      </div>

      {editing && (
        <Card className="mb-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Name">
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="mm-input"
                placeholder="e.g. Healthcare"
              />
            </Field>
            <Field label="Icon">
              <select value={editing.icon_name} onChange={(e) => setEditing({ ...editing, icon_name: e.target.value })} className="mm-input">
                {ICON_CHOICES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Gradient">
              <select value={editing.gradient} onChange={(e) => setEditing({ ...editing, gradient: e.target.value })} className="mm-input">
                {GRADIENTS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Position">
              <input
                type="number"
                value={editing.position}
                onChange={(e) => setEditing({ ...editing, position: Number(e.target.value) || 0 })}
                className="mm-input"
              />
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Preview row={editing} />
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={editing.visible} onChange={(e) => setEditing({ ...editing, visible: e.target.checked })} />
              Visible
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
              Show in category strip
            </label>
            <div className="ml-auto flex gap-2">
              <PillButton onClick={() => setEditing(null)}>Cancel</PillButton>
              <PillButton
                variant="primary"
                onClick={() => (editing.name.trim() ? save.mutate(editing) : toast.error("Name is required"))}
              >
                <span className="inline-flex items-center gap-1.5"><Save className="h-3.5 w-3.5" /> Save</span>
              </PillButton>
            </div>
          </div>
        </Card>
      )}

      {q.isLoading ? (
        <div className="text-sm text-muted-foreground">Loading categories…</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row, i) => (
            <div key={row.name} className="glass group flex items-center justify-between gap-3 rounded-xl p-3">
              <button className="flex min-w-0 items-center gap-3 text-left" onClick={() => setEditing(row)}>
                <Preview row={row} compact />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{row.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Rank #{i + 1} · {row.visible ? "Visible" : "Hidden"}{row.featured ? " · Strip" : ""}
                  </div>
                </div>
              </button>
              <div className="flex flex-shrink-0 items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                <IconBtn title="Move up" onClick={() => move(row, -1)}><ArrowUp className="h-3.5 w-3.5" /></IconBtn>
                <IconBtn title="Move down" onClick={() => move(row, 1)}><ArrowDown className="h-3.5 w-3.5" /></IconBtn>
                <IconBtn title="Toggle strip" onClick={() => save.mutate({ ...row, featured: !row.featured })}>
                  <Star className={`h-3.5 w-3.5 ${row.featured ? "text-amber-400" : ""}`} />
                </IconBtn>
                <IconBtn title="Toggle visibility" onClick={() => save.mutate({ ...row, visible: !row.visible })}>
                  {row.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </IconBtn>
                <IconBtn title="Delete" onClick={() => confirm(`Delete "${row.name}"?`) && remove.mutate(row.name)}>
                  <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                </IconBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Preview({ row, compact }: { row: CategoryRow; compact?: boolean }) {
  const Icon = PRODUCT_ICONS[row.icon_name] ?? PRODUCT_ICONS.Package;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-br ${row.gradient} px-3 py-2 text-xs font-bold text-white shadow-lg`}
    >
      <Icon className="h-4 w-4" />
      {!compact && <span>{row.name || "Preview"}</span>}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function IconBtn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button title={title} onClick={onClick} className="grid h-7 w-7 place-items-center rounded-lg hover:bg-white/10">
      {children}
    </button>
  );
}
