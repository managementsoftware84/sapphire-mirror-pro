import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type HeroSlide = {
  id: string;
  slug: string;
  kicker: string;
  title: string;
  subtitle: string;
  cta_primary: string;
  cta_secondary: string;
  cta_link: string;
  gradient: string;
  icon_name: string;
  accent: string;
  position: number;
  visible: boolean;
  published_at: string | null;
  unpublish_at: string | null;
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

/** Public: live/scheduled slides visible on the homepage */
export const listHeroSlidesPublic = createServerFn({ method: "GET" }).handler(
  async (): Promise<HeroSlide[]> => {
    const sb = publicClient();
    const { data, error } = await sb
      .from("hero_slides")
      .select("*")
      .order("position", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as HeroSlide[];
  },
);

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(60),
  kicker: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  cta_primary: z.string().min(1),
  cta_secondary: z.string().min(1),
  cta_link: z.string().min(1),
  gradient: z.string().min(1),
  icon_name: z.string().min(1),
  accent: z.string().min(1),
  position: z.number().int().nonnegative(),
  visible: z.boolean(),
  published_at: z.string().nullable().optional(),
  unpublish_at: z.string().nullable().optional(),
});

export const listHeroSlidesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<HeroSlide[]> => {
    const { data, error } = await context.supabase
      .from("hero_slides")
      .select("*")
      .order("position", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as HeroSlide[];
  });

export const upsertHeroSlide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => upsertSchema.parse(d))
  .handler(async ({ data, context }): Promise<HeroSlide> => {
    const { data: row, error } = await context.supabase
      .from("hero_slides")
      .upsert(data, { onConflict: "id" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as HeroSlide;
  });

export const deleteHeroSlide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { error } = await context.supabase.from("hero_slides").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderHeroSlides = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ order: z.array(z.object({ id: z.string().uuid(), position: z.number().int() })) }).parse(d),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    for (const it of data.order) {
      const { error } = await context.supabase
        .from("hero_slides")
        .update({ position: it.position })
        .eq("id", it.id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ isAdmin: boolean }> => {
    const { data, error } = await context.supabase.rpc("claim_admin");
    if (error) throw new Error(error.message);
    return { isAdmin: !!data };
  });

export const whoAmI = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ userId: string; isAdmin: boolean }> => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { userId: context.userId, isAdmin: !!data };
  });
