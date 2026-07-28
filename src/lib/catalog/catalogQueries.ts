import { queryOptions } from "@tanstack/react-query";
import { listCatalogPublic } from "./catalog.functions";

export const catalogPublicQuery = () =>
  queryOptions({
    queryKey: ["catalog", "public"] as const,
    queryFn: () => listCatalogPublic(),
    staleTime: 60_000,
  });