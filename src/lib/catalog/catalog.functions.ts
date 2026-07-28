import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import {
  publicCatalogClient,
  productUpsertSchema,
  categoryUpsertSchema,
  productDeleteSchema,
  categoryDeleteSchema,
} from "./catalog.server";

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type CategoryRow = Database["public"]["Tables"]["master_categories"]["Row"];

/** Public: visible products + master categories for the marketplace homepage. */
export const listCatalogPublic = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ products: ProductRow[]; categories: CategoryRow[] }> => {
    const sb = publicCatalogClient();
    const [productsRes, categoriesRes] = await Promise.all([
      sb.from("products").select("*").order("position", { ascending: true }),
      sb.from("master_categories").select("*").order("position", { ascending: true }),
    ]);
    if (productsRes.error) throw new Error(productsRes.error.message);
    if (categoriesRes.error) throw new Error(categoriesRes.error.message);
    return { products: productsRes.data ?? [], categories: categoriesRes.data ?? [] };
  },
);

/** Admin: full product list including hidden rows (RLS enforces admin read). */
export const listProductsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProductRow[]> => {
    const { data, error } = await context.supabase
      .from("products")
      .select("*")
      .order("position", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => productUpsertSchema.parse(d))
  .handler(async ({ data, context }): Promise<ProductRow> => {
    const { data: row, error } = await context.supabase
      .from("products")
      .upsert(data, { onConflict: "id" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => productDeleteSchema.parse(d))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin: full category list including hidden rows. */
export const listCategoriesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CategoryRow[]> => {
    const { data, error } = await context.supabase
      .from("master_categories")
      .select("*")
      .order("position", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => categoryUpsertSchema.parse(d))
  .handler(async ({ data, context }): Promise<CategoryRow> => {
    const { data: row, error } = await context.supabase
      .from("master_categories")
      .upsert(data, { onConflict: "name" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => categoryDeleteSchema.parse(d))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { error } = await context.supabase.from("master_categories").delete().eq("name", data.name);
    if (error) throw new Error(error.message);
    return { ok: true };
  });