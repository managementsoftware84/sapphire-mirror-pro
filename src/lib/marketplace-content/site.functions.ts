import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type Announcement = {
  id: string;
  title: string;
  badge: string;
  text: string;
  icon_name: string;
  gradient: string;
  position: number;
  visible: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

export type FeatureItem = {
  id: string;
  label: string;
  icon_name: string;
  color_class: string;
  position: number;
  visible: boolean;
};

export type HomepageSection = {
  id: string;
  section_key: string;
  label: string;
  position: number;
  visible: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SiteSettings = Record<string, Record<string, any>>;

export type HomepageConfig = {
  settings: SiteSettings;
  announcements: Announcement[];
  features: FeatureItem[];
  sections: HomepageSection[];
};

function publicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        h.set("apikey", key);
        if (h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        return fetch(input, { ...init, headers: h });
      },
    },
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

/** Public: everything the homepage needs, in one round trip. */
export const getHomepageConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomepageConfig> => {
    const sb = publicClient();
    const [s, a, f, h] = await Promise.all([
      sb.from("site_settings").select("key,value"),
      sb.from("announcements").select("*").order("position", { ascending: true }),
      sb.from("feature_strip_items").select("*").order("position", { ascending: true }),
      sb.from("homepage_sections").select("*").order("position", { ascending: true }),
    ]);
    const err = s.error || a.error || f.error || h.error;
    if (err) throw new Error(err.message);

    const settings: SiteSettings = {};
    for (const row of s.data ?? []) {
      settings[row.key as string] = (row.value ?? {}) as Record<string, any>;
    }
    return {
      settings,
      announcements: (a.data ?? []) as Announcement[],
      features: (f.data ?? []) as FeatureItem[],
      sections: (h.data ?? []) as HomepageSection[],
    };
  },
);

/* ---------------- admin mutations ---------------- */

const announcementSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  badge: z.string().default(""),
  text: z.string().default(""),
  icon_name: z.string().min(1),
  gradient: z.string().min(1),
  position: z.number().int().nonnegative(),
  visible: z.boolean(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
});

export const upsertAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => announcementSchema.parse(d))
  .handler(async ({ data, context }): Promise<Announcement> => {
    const { data: row, error } = await context.supabase
      .from("announcements")
      .upsert(data, { onConflict: "id" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as Announcement;
  });

export const deleteAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("announcements").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const featureSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1),
  icon_name: z.string().min(1),
  color_class: z.string().min(1),
  position: z.number().int().nonnegative(),
  visible: z.boolean(),
});

export const upsertFeatureItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => featureSchema.parse(d))
  .handler(async ({ data, context }): Promise<FeatureItem> => {
    const { data: row, error } = await context.supabase
      .from("feature_strip_items")
      .upsert(data, { onConflict: "id" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as FeatureItem;
  });

export const deleteFeatureItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("feature_strip_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const updateHomepageSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        visible: z.boolean().optional(),
        position: z.number().int().optional(),
        label: z.string().min(1).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<HomepageSection> => {
    const { id, ...patch } = data;
    const { data: row, error } = await context.supabase
      .from("homepage_sections")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as HomepageSection;
  });

export const reorderHomepageSections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ order: z.array(z.object({ id: z.string().uuid(), position: z.number().int() })) })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    for (const it of data.order) {
      const { error } = await context.supabase
        .from("homepage_sections")
        .update({ position: it.position })
        .eq("id", it.id);
      if (error) throw new Error(error.message);
    }
    return { ok: true as const };
  });

export const saveSiteSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ key: z.string().min(1), value: z.record(z.string(), z.any()) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("site_settings")
      .upsert({ key: data.key, value: data.value }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
