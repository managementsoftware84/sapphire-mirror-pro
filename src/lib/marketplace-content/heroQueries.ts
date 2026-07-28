import { queryOptions } from "@tanstack/react-query";
import { listHeroSlidesPublic, listHeroSlidesAdmin } from "./hero.functions";

export const heroPublicQuery = () =>
  queryOptions({
    queryKey: ["hero_slides", "public"],
    queryFn: () => listHeroSlidesPublic(),
    staleTime: 30_000,
  });

export const heroAdminQuery = () =>
  queryOptions({
    queryKey: ["hero_slides", "admin"],
    queryFn: () => listHeroSlidesAdmin(),
    staleTime: 5_000,
  });
