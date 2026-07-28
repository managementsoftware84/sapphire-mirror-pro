/** Presentation groups for the Categories mega menu. Slugs map to homepage anchors when they match a real master_category name. */
export interface CatLink { label: string; anchor?: string; }
export interface CatGroup { title: string; items: CatLink[]; }

export const CATEGORY_GROUPS: CatGroup[] = [
  { title: "Business Software", items: [
    { label: "All Categories", anchor: "All" },
    { label: "ERP", anchor: "ERP" },
    { label: "CRM", anchor: "Sales & CRM" },
    { label: "POS", anchor: "Retail & POS" },
    { label: "HRM", anchor: "HR & Payroll" },
    { label: "Accounting", anchor: "Accounting" },
  ]},
  { title: "Industry Verticals", items: [
    { label: "School", anchor: "Education" },
    { label: "Hospital", anchor: "Healthcare" },
    { label: "Hotel", anchor: "Hospitality (Hotel, Restaurant, Travel)" },
    { label: "Restaurant", anchor: "Hospitality (Hotel, Restaurant, Travel)" },
    { label: "E-Commerce", anchor: "E-commerce & Online Marketplaces" },
    { label: "Real Estate", anchor: "Real Estate" },
  ]},
  { title: "Modern & AI", items: [
    { label: "AI Software", anchor: "AI & Automation" },
    { label: "Mobile Apps", anchor: "Productivity" },
    { label: "Desktop Software", anchor: "Productivity" },
    { label: "SaaS", anchor: "Cloud & DevOps" },
  ]},
  { title: "Developer Assets", items: [
    { label: "Source Code" },
    { label: "APIs" },
    { label: "Templates" },
    { label: "Plugins" },
    { label: "Themes" },
  ]},
];
