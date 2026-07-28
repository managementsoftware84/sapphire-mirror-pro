import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

/** Server-only publishable client for public catalog reads (RLS as anon). */
export function publicCatalogClient() {
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

export const productUpsertSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().min(1),
  category: z.string().min(1),
  master_category: z.string().min(1),
  description: z.string().min(1),
  url: z.string().min(1),
  icon_name: z.string().min(1),
  status: z.enum(["ACTIVE", "COMING_SOON"]),
  features: z.array(z.string()),
  frontend: z.array(z.string()),
  backend: z.array(z.string()),
  color: z.string().min(1),
  price: z.string().min(1),
  discount_price: z.string().min(1),
  position: z.number().int().nonnegative(),
  visible: z.boolean(),
});

export const categoryUpsertSchema = z.object({
  name: z.string().min(1).max(120),
  position: z.number().int().nonnegative(),
  visible: z.boolean(),
});

export const productDeleteSchema = z.object({ id: z.string().min(1) });
export const categoryDeleteSchema = z.object({ name: z.string().min(1) });