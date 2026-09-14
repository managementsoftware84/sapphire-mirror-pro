import { queryOptions } from "@tanstack/react-query";
import { getHomepageConfig, type HomepageConfig } from "./site.functions";

export const homepageConfigQuery = () =>
  queryOptions({
    queryKey: ["homepage_config"],
    queryFn: () => getHomepageConfig(),
    staleTime: 30_000,
  });

export const EMPTY_CONFIG: HomepageConfig = {
  settings: {},
  announcements: [],
  features: [],
  sections: [],
};

export function sectionVisible(cfg: HomepageConfig | undefined, key: string) {
  const row = cfg?.sections.find((s) => s.section_key === key);
  return row ? row.visible : true;
}
